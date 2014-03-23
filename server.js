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

// Initialize Express.io
express = require('express.io');
app = express()
app.http().io()

// Serve Static Dirs
app.configure(function() {
	app.use('/js', express.static(__dirname + '/js'));
	app.use('/style', express.static(__dirname + '/style'));
});

// Basic HTTP Routes
app.get('/', function(req,res) {
	res.sendfile(__dirname + '/main.html');
});

app.listen(8080)