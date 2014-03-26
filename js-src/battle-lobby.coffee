# Local Data Containers
players = []
games = []

$(document).ready () ->

	# Ask username
	if not document.cookie
		username = prompt 'Your name?', 'Player 0'
		document.cookie = username
	else
		cookies = document.cookie.split("$")
		username = cookies[0]

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
	socket.on 'gameUpdate', (data) ->
		games = data.games
		racPlayersInGame.set 'games', games
	socket.on 'message', (data) ->
		alert "#{data.from}: #{data.message}"

	# Game Socket Event Handlers
	socket.on 'invite', (data) ->
		from = data.from
		inviteKey = data.inviteKey
		answer = prompt("Invite received from #{from}! y/Y to accept, else deny.")
		if answer is 'Y' or 'y'
			socket.emit 'game:accept', inviteKey

	socket.on 'startGame', (gameKey) ->
		alert "Your game is starting! Match id: #{gameKey}"
		document.cookie = "#{username}$#{gameKey}"
		window.location = '/game'

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
		document.cookie = username
		@set 'username', username

	# Players Lobby Ractive
	racPlayersLobby = new Ractive {
		el: 'divPlayersLobby'
		template: '#tmpPlayersLobby'
		data: {
			players: players
		}
	}

	racPlayersLobby.on {
			challenge: (event, destUsername) ->
				if destUsername is username
					alert "You can't invite yourself!"
					return
				socket.emit 'game:invite', destUsername
				alert "You have invited #{destUsername} to a game! Please wait for confirmation."
			message: (event, destUsername) ->
				if destUsername is username
					alert "You can't message yourself!"
					return
				message = prompt('Enter message: ')
				socket.emit 'message', { to: destUsername, message: message }
		}

	# Players In Game Ractive
	racPlayersInGame = new Ractive {
		el: 'divPlayersInGame'
		template: '#tmpPlayersInGame'
		data: {
			games: games
		}
	}