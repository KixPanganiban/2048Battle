var players;

players = [];

$(document).ready(function() {
  var games, racPlayersInGame, racPlayersLobby, racUsername, socket, username;
  if (!document.cookie) {
    username = prompt('Your name?', 'Player 0');
    document.cookie = username;
  } else {
    username = document.cookie;
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
  socket.on('message', function(data) {
    return alert("" + data.from + ": " + data.message);
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
    this.set('username', username);
    return document.cookie = username;
  });
  racPlayersLobby = new Ractive({
    el: 'divPlayersLobby',
    template: '#tmpPlayersLobby',
    data: {
      players: players
    }
  });
  racPlayersLobby.on({
    challenge: function(event, username) {
      return alert("You have challenged " + username + "!");
    },
    message: function(event, destUsername) {
      var message;
      message = prompt('Enter message: ');
      return socket.emit('message', {
        to: destUsername,
        message: message
      });
    }
  });
  games = [
    {
      playera: {
        name: 'Kropeck'
      },
      playerb: {
        name: 'Crackers'
      }
    }
  ];
  return racPlayersInGame = new Ractive({
    el: 'divPlayersInGame',
    template: '#tmpPlayersInGame',
    data: {
      games: games
    }
  });
});
