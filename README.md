# 2048 Battle
2048 Battle is a Tetris Battle-inspired multiplayer fork of gabrielecirulli's 2048 game (http://git.io/2048) that uses Express.io on top of Node.js.

This was created primarily as an academic requirement for *CS 145: Computer Networking* in the University of the Phillipines - Diliman, under the instruction of Edgar Felizmenio.

Created by **Kix Panganiban** and **Jed Cortez**

---

## Usage
2048 Battle requires Node.js and Express.io to run. Make sure you have the latest Express.io installed using **npm**. To run, navigate to the 2048 Battle directory and:

    npm install
    npm start

## Notes
You are free to use this project for any purpose as long as you put a reference back to http://github.com/KixPanganiban/2048Battle and http://github.com/gabrielecirulli/2048

2048's original licensing clauses apply.

## Troubleshooting
If the game fails to run after issuing `npm start`, chances are you are missing dependencies. Check if you have Express.io, or just type `npm install -g express.io`. Users on Linux might need to add `sudo` before the command.

Make sure that your browser have cookies and Javascript enabled.

If the game runs but the lobby is empty, your browser might be blocking WebSockets or UDP connections. Please confirm that this is not the case.
