cookies = []
gameInfo = []
otherPlayer = null

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

  new GameManager 4, KeyboardInputManager, HTMLActuator, LocalStorageManager, socket
	

	