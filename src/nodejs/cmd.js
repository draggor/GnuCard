var game = require('./game');

var COMMANDS = {};

function calljs(client, func, args) {
	client.send(prepJS(func, args));
}

function callalljs(client, func, args) {
	client.broadcast(prepJS(func, args));
}

function prepJS(funcName, message) {
	return funcName + '("' + message + '");';
}

exports.calljs = calljs;
exports.callalljs = callalljs;

exports.dispatch = function (client, json) {
	var func = COMMANDS[json[0]];
	var args = json[1];
	args['client'] = client;

	if(func) {
		func(client, args);
	} else {
		calljs(client, 'notify', 'Function ' + json[0] + ' not found!');
	}
};

COMMANDS.logon = function(client, args) {
	var p = game.namesToPlayers[args.name];

	if(p) {
		if(args.pass === p.pass) {
			game.clientsToPlayers[client] = p;
			p.client = client;
		} else {
			calljs(client, 'notify', "WRONG PASS!");
		}
	} else {
		var player = new Player(args.client, args.name, args.pass);
		game.clientsToPlayers[args.client] = player;
		game.namesToPlayers[args.name] = player;
		callalljs(client, 'notify', args.name + ' logged on!');
		COMMANDS.updateCards(client);
	}
};
