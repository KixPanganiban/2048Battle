var cookies, gameInfo, otherPlayer, thisActuator;

cookies = [];

gameInfo = [];

otherPlayer = null;

thisActuator = null;

$(document).ready(function() {
  var racGameOpponent, socket, thisGameManager;
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
  thisGameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager, socket);
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
  socket.emit('verifyMatch', {
    username: cookies[0],
    gameKey: cookies[1]
  }, function(res) {
    if (!res.matchValid) {
      alert("Your game seems to be invalid or expired. Try getting finding a different opponent.");
      window.location = "/";
    }
    gameInfo = res.gameInfo;
    otherPlayer = gameInfo.playerb === cookies[0] ? gameInfo.playera : gameInfo.playerb;
    return racGameOpponent.set('otherPlayer', otherPlayer);
  });
  return socket.on('gameOver', function(data) {
    var currentGameKey, rcvdGameKey, status, thatPlayer;
    currentGameKey = cookies[1];
    rcvdGameKey = data.gameKey;
    status = data.status;
    thatPlayer = data.player;
    if (cookies[1] !== rcvdGameKey) {
      return;
    }
    if (cookies[0] !== thatPlayer) {
      if (status === "win") {
        thisGameManager.actuator.message(false);
        alert("" + thatPlayer + " won the match! You will now be returned to the lobby.");
        window.location = "/";
      }
      if (status === "lose") {
        thisGameManager.actuator.message(true);
        alert("" + thatPlayer + "'s game is over! You win! You will now be returned to the lobby.");
        return window.location = "/";
      }
    }
  });
});
