var cookies, gameInfo, otherPlayer;

cookies = [];

gameInfo = [];

otherPlayer = null;

$(document).ready(function() {
  var racGameOpponent, socket;
  if (!document.cookie) {
    alert("Select an opponent in the lobby first!");
    window.location = "/";
  } else {
    cookies = document.cookie.split("$");
    if (!cookies[1]) {
      alert("Select an opponent in the lobby first!");
      window.location = "/";
    }
  }
  socket = io.connect();
  racGameOpponent = new Ractive({
    el: 'divGameOpponent',
    template: '#tmpGameOpponent',
    data: {
      otherPlayer: otherPlayer
    }
  });
  socket.emit('handshakeBattle', {
    name: cookies[0]
  }, function(res) {
    if (res.status === 'OK') {
      return console.log('Connected to the 2048Battle server.');
    } else {
      return console.log('Connection error. Please check your internet connection.');
    }
  });
  return socket.emit('verifyMatch', {
    username: cookies[0],
    gameKey: cookies[1]
  }, function(res) {
    if (!res.matchValid) {
      alert("Your game seems to be invalid or expired. Try getting finding a different opponent.");
      window.location = "/";
    }
    gameInfo = res.gameInfo;
    otherPlayer = gameInfo.playerb === cookies[0] ? gameInfo.playera : gameInfo.playerb;
    racGameOpponent.set('otherPlayer', otherPlayer);
    return new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager, socket);
  });
});
