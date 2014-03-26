var games, players;

players = [];

games = [];

$(document).ready(function() {
  var cookies, racPlayersInGame, racPlayersLobby, racUsername, socket, username;
  if (!document.cookie) {
    username = prompt('Your name?', 'Player 0');
    document.cookie = username;
  } else {
    cookies = document.cookie.split("$");
    username = cookies[0];
  }
  socket = io.connect();
  socket.emit('handshake', {
    name: username
  }, function(res) {
    if (res.status === 'OK') {
      return console.log('Connected to the 2048Battle server.');
    } else {
      return console.log('Connection error. Please check your internet connection.');
    }
  });
  socket.on('playerUpdate', function(data) {
    players = data.players;
    return racPlayersLobby.set('players', players);
  });
  socket.on('gameUpdate', function(data) {
    games = data.games;
    return racPlayersInGame.set('games', games);
  });
  socket.on('message', function(data) {
    return alert("" + data.from + ": " + data.message);
  });
  socket.on('invite', function(data) {
    var answer, from, inviteKey;
    from = data.from;
    inviteKey = data.inviteKey;
    answer = prompt("Invite received from " + from + "! y/Y to accept, else deny.");
    if (answer === 'Y' || 'y') {
      return socket.emit('game:accept', inviteKey);
    }
  });
  socket.on('startGame', function(gameKey) {
    alert("Your game is starting! Match id: " + gameKey);
    document.cookie = "" + username + "$" + gameKey;
    return window.location = '/game';
  });
  racUsername = new Ractive({
    el: 'divUsername',
    template: '#tmpUsername',
    data: {
      username: username
    }
  });
  racUsername.on('changeUsername', function() {
    username = prompt('New username?');
    socket.emit('usernameChange', username);
    document.cookie = username;
    return this.set('username', username);
  });
  racPlayersLobby = new Ractive({
    el: 'divPlayersLobby',
    template: '#tmpPlayersLobby',
    data: {
      players: players
    }
  });
  racPlayersLobby.on({
    challenge: function(event, destUsername) {
      if (destUsername === username) {
        alert("You can't invite yourself!");
        return;
      }
      socket.emit('game:invite', destUsername);
      return alert("You have invited " + destUsername + " to a game! Please wait for confirmation.");
    },
    message: function(event, destUsername) {
      var message;
      if (destUsername === username) {
        alert("You can't message yourself!");
        return;
      }
      message = prompt('Enter message: ');
      return socket.emit('message', {
        to: destUsername,
        message: message
      });
    }
  });
  return racPlayersInGame = new Ractive({
    el: 'divPlayersInGame',
    template: '#tmpPlayersInGame',
    data: {
      games: games
    }
  });
});
