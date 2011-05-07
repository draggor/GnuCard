#!/usr/local/bin/node

var 	gnucard = require('./src/nodejs/server'),
	repl = require('repl'),
	spoiler = require('./src/nodejs/spoiler'),
	game = require('./src/nodejs/game');

process.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});

gnucard.startServer(9000);

spoiler.loadSpoiler();


var r = repl.start();
r.context.spoiler = spoiler;
r.context.game = game;

