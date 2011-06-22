var	net = require('net'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	sys = require('sys'),
	formidable = require('formidable'),
	express = require('express'),
	io = require('socket.io'),
	game = require('./game'),
	util = require('./util'),
	cmd = require('./cmd');

var SRC = {
	html: './src/web/',
	css: './src/web/',
	js: './src/web/'
};

var HEAD_INFO = {
	html: {encoding: 'utf8', contentType: 'text/html'},
	css: {encoding: 'utf8', contentType: 'text/css'},
	js: {encoding: 'utf8', contentType: 'text/javascript'},
	png: {encoding: 'binary', contentType: 'images/png'},
	swf: {encoding: 'binary', contentType: 'application/x-shockwave-flash'}
};

var index = fs.readFileSync(SRC.html + "index.html");

var server = http.createServer(function(req, res) {
	var path = url.parse(req.url).pathname;
	console.log('Request path: ' + path);
	var pieces = path.split('/');
	
	if(path === '/') {
		res.writeHead(200, {'Content-Type': 'text/html'});
	/*	res.write(index);
		res.end();
	*/
		fs.readFile(SRC.html + 'index.html', function(err, data) {
			res.write(data);
			res.end();
		});
	} else if(path === '/upload') {
		handleUpload(req, res);
	} else if(path === '/upload.html') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(fs.readFileSync(SRC.html + 'upload.html'));
		res.end();
	} else if(pieces[1] != null) {
		dispatchURL(path, pieces, res);
	} else {
		res.end();
		console.log('Request null: ' + path);
	}
});

function handleUpload(req, res) {
	var	form = new formidable.IncomingForm(),
		deck;

	form.uploadDir = './upload/';

	form.addListener('file', function(field, file) {
		deck = file;
	});
	form.addListener('end', function() {
		res.writeHead(200, {'content-type': 'text/html'});
		res.write('<h1>Deck Upload\'d</h1>');
		res.end();
		openFile(deck);
	});
	form.parse(req);
}

function openFile(file) {
	/* TODO: Write the parser, add to game.decks!
	 */
	sys.log(sys.inspect(file));
	var rs = fs.createReadStream(file.path);
	var deck = "";
	rs.on('data', function(data) {
		deck += data;
	});
	rs.on('end', function() {
		parseDeck(file.filename, deck);
	});
}

function parseDeck(deckName, deck) {
	game.decks[deckName] = deck.split('\n').map(function(line) { return line.split(' '); });
}

function dispatchURL(path, pieces, res) {
	var	head = HEAD_INFO[path.split('.').pop()],
		type = pieces[1];
	
	res.writeHead(200, {'Content-Type': head.contentType});
	fs.readFile('./src/web' + path, head.encoding, function(err, data) {
		if(err) {
			res.end();
			throw err;
		} else {
			res.write(data, head.encoding);
			res.end();
		}
	});
}

var app, s2;

exports.startServer = function(port) {
	port = port || 80;
	app = express.createServer();
	app.listen(port);
	s2 = io.listen(app);
	s2.sockets.on('connection', function(client) {
		client.toString = function() { return client.sessionId; };
		client.on('message', function(message) {
			console.log('Socket ' + client + ': ' + message);
			var json = JSON.parse(message);
			cmd.dispatch(client, json);
		});
	});
	app.get('*', function(req, res) {
		var path = url.parse(req.url).pathname;
		console.log('Request path: ' + path);
		var pieces = path.split('/');
		
		if(path === '/') {
			res.writeHead(200, {'Content-Type': 'text/html'});
		/*	res.write(index);
			res.end();
		*/
			fs.readFile(SRC.html + 'index.html', function(err, data) {
				res.write(data);
				res.end();
			});
		} else if(path === '/upload') {
			handleUpload(req, res);
		} else if(path === '/upload.html') {
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write(fs.readFileSync(SRC.html + 'upload.html'));
			res.end();
		} else if(pieces[1] != null) {
			dispatchURL(path, pieces, res);
		} else {
			res.end();
			console.log('Request null: ' + path);
		}
	});
}
/*
exports.startServer = function(port) {
	port = port || 80;
	server.listen(port);

	var socket = io.listen(server);

	socket.on('connection', function(client) {
		client.toString = function() { return client.sessionId; };

		client.on('message', function(message) {
			console.log('Socket ' + client + ': ' + message);
			var json = JSON.parse(message);
			cmd.dispatch(client, json);
		});
	});
}
*/
