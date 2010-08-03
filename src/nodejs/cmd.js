var COMMANDS = {};

exports.dispatch = function (client, json) {
	var func = COMMANDS[json[0]];
	var args = json[1];
	args['client'] = client;

	if(func) {
		func(args);
	} else {
		args['message'] = "Function " + json[0] + " not found!";
		COMMANDS.notify(args);
	}
};

COMMANDS.notify = function(args) {
	var msg = 'notify("' + args.message + '");';
	args.client.send(msg);
};

COMMANDS.logon = function(args) {
	var p = namesToPlayers[args.name];
	var player = new Player(args.client, args.name, args.pass);
