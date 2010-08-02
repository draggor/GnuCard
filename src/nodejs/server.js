var	net = require('net'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	io = require('../../lib/Socket.IO-node/');

var SRC = {
	html: '../../src/html/',
	css: '../../src/css/',
	js: '../../src/js/'
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
//		console.log('Request Done: ' + path);
	} else if(pieces[2] != null) {
		dispatch(path, pieces, res);
	} else {
		res.end();
		console.log('Request null: ' + path);
	}
});

function dispatch(path, pieces, res) {
	switch(pieces[1]) {
		case 'css':
			res.writeHead(200, {'Content-Type': 'text/css'});
			fs.readFile(SRC.css + path.substring(4), 'utf8', function(err, data) {
				if(err) {
					throw err;
				} else {
					res.write(data);
					res.end();
//					console.log('Request Done: ' + path);
				}
			});
			break;
		case 'js':
			res.writeHead(200, {'Content-Type': 'text/javascript'});
			fs.readFile(SRC.js + path.substring(3), 'utf8', function(err, data) {
				if(err) {
					throw err;
				} else {
					res.write(data);
					res.end();
//					console.log('Request Done: ' + path);
				}
			});
			break;
		default:
			res.end();
			break;
	}
}

server.listen(9000);

var socket = io.listen(server);

socket.on('connection', function(client) {
	console.log('websocket shit');
	client.on('message', function(message) {
		console.log(message);
		client.broadcast('alert(' + message + ');');
	});
});
