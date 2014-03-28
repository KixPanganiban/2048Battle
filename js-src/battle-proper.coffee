cookies = []
gameInfo = []
otherPlayer = null
thisActuator = null

$(document).ready () ->

	# Check if cookies are OK
	if not document.cookie
		alert "Select an opponent in the lobby first!"
		window.location = "/"
	else
		cookies = document.cookie.split "$"
		if not cookies[1]
			alert "Select an opponent in the lobby first!"
			window.location = "/"

	# Connect to socket
	socket = io.connect()

	# Initialize 2048
	thisGameManager = new GameManager 4, KeyboardInputManager, HTMLActuator, LocalStorageManager, socket

	# Ractives
	racGameOpponent = new Ractive {
		el: 'divGameOpponent',
		template: '#tmpGameOpponent',
		data: { otherPlayer }
		}

	# Emitters
	socket.emit 'handshakeBattle', { name: cookies[0] }, (res) ->
		if res.status is 'OK'
			console.log 'Connected to the 2048Battle server.'
		else
			console.log 'Connection error. Please check your internet connection.'

	# Verify match
	socket.emit 'verifyMatch', { username: cookies[0], gameKey: cookies[1] }, (res) ->
		if not res.matchValid
			alert "Your game seems to be invalid or expired. Try getting finding a different opponent."
			window.location = "/"
		gameInfo = res.gameInfo
		otherPlayer = if gameInfo.playerb is cookies[0] then gameInfo.playera  else gameInfo.playerb; 
		racGameOpponent.set 'otherPlayer', otherPlayer

	# Socket Handler
	socket.on 'gameOver', (data) ->
		currentGameKey = cookies[1]
		rcvdGameKey = data.gameKey
		status = data.status
		thatPlayer = data.player

		if cookies[1] != rcvdGameKey
			return

		if cookies[0] != thatPlayer
			if status is "win"
				thisGameManager.actuator.message false
				alert "#{thatPlayer} won the match! You will now be returned to the lobby."
				window.location = "/"
			if status is "lose"
				thisGameManager.actuator.message true
				alert "#{thatPlayer}'s game is over! You win! You will now be returned to the lobby."
				window.location = "/"