# Local Data Containers
players = []

$(document).ready () ->

	# Ask username
	if not document.cookie
		username = prompt 'Your name?', 'Player 0'
		document.cookie = username
	else
		username = document.cookie

	# Sockets
	# Initial Connection
	socket = io.connect()

	socket.emit 'handshake', { name: username }, (res) ->
		if res.status is 'OK'
			console.log 'Connected to the 2048Battle server.'
		else
			console.log 'Connection error. Please check your internet connection.'

	# Socket Event Handlers
	socket.on 'playerUpdate', (data) ->
		players = data.players
		racPlayersLobby.set 'players', players
	socket.on 'message', (data) ->
		alert "#{data.from}: #{data.message}"

	# Username Ractive
	racUsername = new Ractive {
		el: 'divUsername'
		template: '#tmpUsername'
		data: {
			username: username
		}
	}

	racUsername.on 'changeUsername', () ->
		username = prompt('New username?')
		socket.emit 'usernameChange', username
		@set 'username', username
		document.cookie = username

	# Players Lobby Ractive
	racPlayersLobby = new Ractive {
		el: 'divPlayersLobby'
		template: '#tmpPlayersLobby'
		data: {
			players: players
		}
	}

	racPlayersLobby.on {
			challenge: (event, username) ->
				alert "You have challenged #{username}!"
			message: (event, destUsername) ->
				message = prompt('Enter message: ')
				socket.emit 'message', { to: destUsername, message: message }
		}

	# Players In Game Dummy Data
	# TODO: Remove Later

	games = [
		{ playera: {name: 'Kropeck'}, playerb: {name: 'Crackers'} }
	]

	# Players In Game Ractive
	racPlayersInGame = new Ractive {
		el: 'divPlayersInGame'
		template: '#tmpPlayersInGame'
		data: {
			games: games
		}
	}