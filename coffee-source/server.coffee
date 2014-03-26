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
rooms = []
pendingInvites = [] # { from: 'name', to: 'name' }

# Socket Routers
# Initial Handshake
app.io.route 'handshake', (req) ->
	req.io.respond {
		status: 'OK'
	}
	players.push { name: req.data.name }
	playerSockets.push { name: req.data.name, socket: req.socket, io: req.io }
	console.log "Player #{req.data.name} connected from #{req.socket.id}"
	app.io.broadcast 'playerUpdate', { players: players }

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
		return
	accept: (req) ->
		return
}

# Run the server on port 8080
app.listen 8080