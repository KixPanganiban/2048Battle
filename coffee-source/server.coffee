###
	
	2048-battle
	server.js

	A Tetris Battle-style fork of gabrielecirulli's 2048 game.
	Created by Kix Panganiban and Jed Cortez as a requirement 
	for CS 145: Computer Network, under the instruction of the
	legen...

	...wait for it...

	...dary! Edgardo "alyas Balbas" P. Felizmenio jr

###

# Initialize Express.io
express = require 'express.io'
app = express()
app.http().io()

# Serve static dirs
app.configure -> 
	app.use express.static("static")
	return

# Basic HTTP routes
app.get "/", (req, res) ->
	res.sendfile __dirname + '/main.html'
	return
app.get "/game", (req, res) ->
	res.sendfile __dirname + '/game.html'
	return

# Global Data Containers
players = [] # { name: 'name' }
playerSockets = [] # { name: 'name', socket: socket, io: io }
games = [] # { p1: 'name', p2: 'name', gameKey: 'gameKey'}
pendingInvites = [] # { from: 'name', to: 'name', inviteKey: 'inviteKey' }

# Socket Routers (Lobby)
# Initial Handshake
app.io.route 'handshake', (req) ->
	req.io.respond {
		status: 'OK'
	}
	players.push { name: req.data.name }
	playerSockets.push { name: req.data.name, socket: req.socket, io: req.io }
	console.log "Player #{req.data.name} connected from #{req.socket.id}"
	app.io.broadcast 'playerUpdate', { players: players }

# Battle Proper Handshake
app.io.route 'handshakeBattle', (req) ->
	req.io.respond {
		status: 'OK'
	}
	playerSockets.push { name: req.data.name, socket: req.socket, io: req.io }
	console.log "Player #{req.data.name} reconnected from #{req.socket.id} (BATTLE MODE)"

# Battle state verification
app.io.route 'verifyMatch', (req) ->
	matchValid = false
	username = req.data.username
	gameKey = req.data.gameKey
	thisGame = null

	for game in games
		if game.gameKey is gameKey
			if game.playera is username or game.playerb is username
				matchValid = true
				thisGame = game

	req.io.respond { matchValid, gameInfo: thisGame	}

# Username change handler
app.io.route 'usernameChange', (req) ->
	username = req.data
	oldname = ""
	socketId = req.socket.id

	for playerSocket in playerSockets
		if playerSocket.socket.id == req.socket.id
			oldname = playerSocket.name
			playerSocket.name = username

	for player in players
		if player.name == oldname
			player.name = username

	app.io.broadcast 'playerUpdate', { players: players }

# Person to Person Message
app.io.route 'message', (req) ->
	destName = req.data.to
	srcName = ""
	for playerSocket in playerSockets
		if playerSocket.socket.id is req.socket.id
			srcName = playerSocket.name
	for playerSocket in playerSockets
		if playerSocket.name == destName
			playerSocket.io.emit 'message', { message: req.data.message, from: srcName }
	console.log "#{srcName} -> #{destName}: #{req.data.message}"

# Disconnection Handler
app.io.route 'disconnect', (req) ->
	for playerSocket, i in playerSockets
		if playerSocket.socket.id is req.socket.id
			playerSockets.splice i, 1
			for player, j in players
				if player.name is playerSocket.name
					players.splice j, 1
	app.io.broadcast 'playerUpdate', { players: players }
	console.log "#{req.socket.id} has disconnected."

# Game routes
app.io.route 'game', {
	invite: (req) ->
		inviteKey = Math.random().toString(36).substr(2, 10)

		from = ""
		to = req.data
		for playerSocket in playerSockets
			if playerSocket.socket.id is req.socket.id
				from = playerSocket.name

		pendingInvites.push { from, to, inviteKey }

		for playerSocket in playerSockets
			if playerSocket.name is to 
				playerSocket.socket.emit 'invite', { from, inviteKey }
		console.log "Invite #{from} -> #{to}"

	accept: (req) ->
		inviteKey = req.data
		thisInvite = null

		for pendingInvite, i in pendingInvites
			if pendingInvite.inviteKey is inviteKey
				thisInvite = pendingInvite
				pendingInvites.splice(i, 1)

		iStack = []
		for player, i in players
			if player.name is thisInvite.to or player.name is thisInvite.from
				iStack.push i

		for i in iStack
			players.splice i, 1
			for ii, x in iStack
				if i < ii
					iStack[x] -= 1

		jStack = []
		for playerSocket, j in playerSockets
			if playerSocket.name and playerSocket.name is thisInvite.to or playerSocket.name is thisInvite.from
				jStack.push j
				playerSocket.socket.emit 'startGame', inviteKey
		
		for j in jStack
			playerSockets.splice j, 1
			for jj, y in jStack
				if j < jj
					jStack[y] -= 1

		console.log iStack
		console.log players
		app.io.broadcast 'playerUpdate', { players }
		games.push { playera: thisInvite.from, playerb: thisInvite.to, gameKey: inviteKey }
		app.io.broadcast 'gameUpdate', { games }

		console.log "#{thisInvite.to} has accepted an invitation from #{thisInvite.from}!"
}

# Run the server on port 8080
app.listen 8080