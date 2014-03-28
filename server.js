
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
var app, express, games, pendingInvites, playerSockets, players;

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

games = [];

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

app.io.route('handshakeBattle', function(req) {
  req.io.respond({
    status: 'OK'
  });
  playerSockets.push({
    name: req.data.name,
    socket: req.socket,
    io: req.io
  });
  return console.log("Player " + req.data.name + " reconnected from " + req.socket.id + " (BATTLE MODE)");
});

app.io.route('verifyMatch', function(req) {
  var game, gameKey, matchValid, thisGame, username, _i, _len;
  matchValid = false;
  username = req.data.username;
  gameKey = req.data.gameKey;
  thisGame = null;
  for (_i = 0, _len = games.length; _i < _len; _i++) {
    game = games[_i];
    if (game.gameKey === gameKey) {
      if (game.playera === username || game.playerb === username) {
        matchValid = true;
        thisGame = game;
      }
    }
  }
  return req.io.respond({
    matchValid: matchValid,
    gameInfo: thisGame
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
  var i, iStack, ii, j, jStack, jj, player, playerSocket, x, y, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n;
  iStack = [];
  jStack = [];
  for (i = _i = 0, _len = playerSockets.length; _i < _len; i = ++_i) {
    playerSocket = playerSockets[i];
    if (playerSocket.socket.id === req.socket.id) {
      iStack.push(i);
      for (j = _j = 0, _len1 = players.length; _j < _len1; j = ++_j) {
        player = players[j];
        if (player.name === playerSocket.name) {
          jStack.push(j);
        }
      }
    }
  }
  for (_k = 0, _len2 = iStack.length; _k < _len2; _k++) {
    i = iStack[_k];
    playerSockets.splice(i, 1);
    for (x = _l = 0, _len3 = iStack.length; _l < _len3; x = ++_l) {
      ii = iStack[x];
      if (i < ii) {
        iStack[x] -= 1;
      }
    }
  }
  for (_m = 0, _len4 = jStack.length; _m < _len4; _m++) {
    j = jStack[_m];
    players.splice(j, 1);
    for (y = _n = 0, _len5 = jStack.length; _n < _len5; y = ++_n) {
      jj = jStack[y];
      if (j < jj) {
        jStack[y] -= 1;
      }
    }
  }
  app.io.broadcast('playerUpdate', {
    players: players
  });
  return console.log("" + req.socket.id + " has disconnected.");
});

app.io.route('game', {
  invite: function(req) {
    var from, inviteKey, playerSocket, to, _i, _j, _len, _len1;
    inviteKey = Math.random().toString(36).substr(2, 10);
    from = "";
    to = req.data;
    for (_i = 0, _len = playerSockets.length; _i < _len; _i++) {
      playerSocket = playerSockets[_i];
      if (playerSocket.socket.id === req.socket.id) {
        from = playerSocket.name;
      }
    }
    pendingInvites.push({
      from: from,
      to: to,
      inviteKey: inviteKey
    });
    for (_j = 0, _len1 = playerSockets.length; _j < _len1; _j++) {
      playerSocket = playerSockets[_j];
      if (playerSocket.name === to) {
        playerSocket.socket.emit('invite', {
          from: from,
          inviteKey: inviteKey
        });
      }
    }
    return console.log("Invite " + from + " -> " + to);
  },
  accept: function(req) {
    var i, iStack, ii, inviteKey, j, jStack, jj, pendingInvite, player, playerSocket, thisInvite, x, y, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _m, _n, _o;
    inviteKey = req.data;
    thisInvite = null;
    for (i = _i = 0, _len = pendingInvites.length; _i < _len; i = ++_i) {
      pendingInvite = pendingInvites[i];
      if (pendingInvite.inviteKey === inviteKey) {
        thisInvite = pendingInvite;
        pendingInvites.splice(i, 1);
      }
    }
    iStack = [];
    for (i = _j = 0, _len1 = players.length; _j < _len1; i = ++_j) {
      player = players[i];
      if (player.name === thisInvite.to || player.name === thisInvite.from) {
        iStack.push(i);
      }
    }
    for (_k = 0, _len2 = iStack.length; _k < _len2; _k++) {
      i = iStack[_k];
      players.splice(i, 1);
      for (x = _l = 0, _len3 = iStack.length; _l < _len3; x = ++_l) {
        ii = iStack[x];
        if (i < ii) {
          iStack[x] -= 1;
        }
      }
    }
    jStack = [];
    for (j = _m = 0, _len4 = playerSockets.length; _m < _len4; j = ++_m) {
      playerSocket = playerSockets[j];
      if (playerSocket.name && playerSocket.name === thisInvite.to || playerSocket.name === thisInvite.from) {
        jStack.push(j);
        playerSocket.socket.emit('startGame', inviteKey);
      }
    }
    for (_n = 0, _len5 = jStack.length; _n < _len5; _n++) {
      j = jStack[_n];
      playerSockets.splice(j, 1);
      for (y = _o = 0, _len6 = jStack.length; _o < _len6; y = ++_o) {
        jj = jStack[y];
        if (j < jj) {
          jStack[y] -= 1;
        }
      }
    }
    console.log(iStack);
    console.log(players);
    app.io.broadcast('playerUpdate', {
      players: players
    });
    games.push({
      playera: thisInvite.from,
      playerb: thisInvite.to,
      gameKey: inviteKey
    });
    app.io.broadcast('gameUpdate', {
      games: games
    });
    return console.log("" + thisInvite.to + " has accepted an invitation from " + thisInvite.from + "!");
  },
  updateStatus: function(req) {
    var gameKey, player, status;
    gameKey = req.data.gameKey;
    status = req.data.status;
    player = req.data.player;
    console.log("" + player + " just " + status + " game " + gameKey);
    return app.io.broadcast("gameOver", {
      gameKey: gameKey,
      status: status,
      player: player
    });
  }
});

app.listen(8080);
