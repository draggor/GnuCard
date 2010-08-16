var	net = require('net'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	io = require('../../lib/Socket.IO-node/'),
	cmd = require('./cmd');

var SRC = {
	html: './src/html/',
	css: './src/css/',
	js: './src/js/'
};

var HEAD_INFO = {
	html: {encoding: 'utf8', contentType: 'text/html'},
	css: {encoding: 'utf8', contentType: 'text/css'},
	js: {encoding: 'utf8', contentType: 'text/javascript'},
	swf: {encoding: 'binary', contentType: 'application/x-shockwave-flash'}
};

var index = fs.readFileSync(SRC.html + "index.html");

var server = http.createServer(function(req, res) {
	var path = url.parse(req.url).pathname;
	console.log('Request path: ' + path);
	var pieces = path.split('/');
	
	if(path === '/') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(index);
		res.end();
	} else if(pieces[2] != null) {
		dispatchURL(path, pieces, res);
	} else {
		res.end();
		console.log('Request null: ' + path);
	}
});

function dispatchURL(path, pieces, res) {
	var	head = HEAD_INFO[path.split('.').pop()],
		type = pieces[1];

	res.writeHead(200, {'Content-Type': head.contentType});
	fs.readFile('./src' + path, head.encoding, function(err, data) {
		if(err) {
			res.end();
			throw err;
		} else {
			res.write(data, head.encoding);
			res.end();
		}
	});
}

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
