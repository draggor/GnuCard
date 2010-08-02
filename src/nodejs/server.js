var	net = require('net'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	io = require('../../lib/Socket.IO-node/');

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
}

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
	var head = HEAD_INFO[path.split('.').pop()];
	switch(pieces[1]) {
		case 'css':
			res.writeHead(200, {'Content-Type': head.contentType});
			fs.readFile(SRC.css + path.substring(4), head.encoding, function(err, data) {
				if(err) {
					throw err;
				} else {
					res.write(data, head.encoding);
					res.end();
//					console.log('Request Done: ' + path);
				}
			});
			break;
		case 'js':
			res.writeHead(200, {'Content-Type': head.contentType});
			fs.readFile(SRC.js + path.substring(3), head.encoding, function(err, data) {
				if(err) {
					throw err;
				} else {
					res.write(data, head.encoding);
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
		client.send('alert("' + message + '");');
	});
});
