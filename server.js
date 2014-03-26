
/*
	
	2048-battle
	server.js

	A Tetris Battle-style fork of gabrielecirulli's 2048 game.
	Created by Kix Panganiban and Jed Cortez as a requirement 
	for CS 145: Computer Network, under the instruction of the
	legen...

	...wait for it...

	...dary! Edgardo "alyas Balbas" P. Felizmenio jr
 */
var app, express, pendingInvites, playerSockets, players, rooms;

express = require('express.io');

app = express();

app.http().io();

app.configure(function() {
  app.use(express["static"]("static"));
});

app.get("/", function(req, res) {
  res.sendfile(__dirname + '/main.html');
});

app.get("/game", function(req, res) {
  res.sendfile(__dirname + '/game.html');
});

players = [];

playerSockets = [];

rooms = [];

pendingInvites = [];

app.io.route('handshake', function(req) {
  req.io.respond({
    status: 'OK'
  });
  players.push({
    name: req.data.name
  });
  playerSockets.push({
    name: req.data.name,
    socket: req.socket,
    io: req.io
  });
  console.log("Player " + req.data.name + " connected from " + req.socket.id);
  return app.io.broadcast('playerUpdate', {
    players: players
  });
});

app.io.route('usernameChange', function(req) {
  var oldname, player, playerSocket, socketId, username, _i, _j, _len, _len1;
  username = req.data;
  oldname = "";
  socketId = req.socket.id;
  for (_i = 0, _len = playerSockets.length; _i < _len; _i++) {
    playerSocket = playerSockets[_i];
    if (playerSocket.socket.id === req.socket.id) {
      oldname = playerSocket.name;
      playerSocket.name = username;
    }
  }
  for (_j = 0, _len1 = players.length; _j < _len1; _j++) {
    player = players[_j];
    if (player.name === oldname) {
      player.name = username;
    }
  }
  return app.io.broadcast('playerUpdate', {
    players: players
  });
});

app.io.route('message', function(req) {
  var destName, playerSocket, srcName, _i, _j, _len, _len1;
  destName = req.data.to;
  srcName = "";
  for (_i = 0, _len = playerSockets.length; _i < _len; _i++) {
    playerSocket = playerSockets[_i];
    if (playerSocket.socket.id === req.socket.id) {
      srcName = playerSocket.name;
    }
  }
  for (_j = 0, _len1 = playerSockets.length; _j < _len1; _j++) {
    playerSocket = playerSockets[_j];
    if (playerSocket.name === destName) {
      playerSocket.io.emit('message', {
        message: req.data.message,
        from: srcName
      });
    }
  }
  return console.log("" + srcName + " -> " + destName + ": " + req.data.message);
});

app.io.route('disconnect', function(req) {
  var i, j, player, playerSocket, _i, _j, _len, _len1;
  for (i = _i = 0, _len = playerSockets.length; _i < _len; i = ++_i) {
    playerSocket = playerSockets[i];
    if (playerSocket.socket.id === req.socket.id) {
      playerSockets.splice(i, 1);
      for (j = _j = 0, _len1 = players.length; _j < _len1; j = ++_j) {
        player = players[j];
        if (player.name === playerSocket.name) {
          players.splice(j, 1);
        }
      }
    }
  }
  app.io.broadcast('playerUpdate', {
    players: players
  });
  return console.log("" + req.socket.id + " has disconnected.");
});

app.io.route('game', {
  invite: function(req) {},
  accept: function(req) {}
});

app.listen(8080);
