var	game = require('./game'),
	sys = require('sys'),
	util = require('./util');

var COMMANDS = {};

function calljs(client, msg) {
	var msg = JSON.stringify(msg);
	sys.log('One: ' + msg);
	client.send(msg);
}

/* TODO: Fix this to use map or some other more functional way. */
function callalljs(clients, msg) {
	var msg = JSON.stringify(msg);
	sys.log('All: ' + msg);
	
	for(c in game.clientsToPlayers) {
		game.clientsToPlayers[c].client.send(msg);
	}
}

function runCmd(client, funcName, args) {
	var func = COMMANDS[funcName];

	if(func) {
		func(client, args);
	} else {
		calljs(client, ['notify', {message: 'Function ' + funcName + ' not found!'}]);
	}
}

exports.calljs = calljs;

exports.callalljs = callalljs;

exports.dispatch = function (client, json) {
	var funcName = json[0];
	var args = json[1];
	args['client'] = client;

	runCmd(client, funcName, args);
};

COMMANDS.logon = function(client, args) {
	var p = game.namesToPlayers[args.name];

	if(p) {
		if(args.pass === p.pass) {
			game.clientsToPlayers[client] = p;
			p.client = client;
		} else {
			calljs(client, ['notify', {message: "WRONG PASS!"}]);
		}
	} else {
		var player = new game.Player(args.client, args.name, args.pass);
		game.clientsToPlayers[args.client] = player;
		game.namesToPlayers[args.name] = player;
		callalljs(client, ['notify', {message: args.name + ' logged on!'}]);
		runCmd(client, 'updateCards', args);
	}
};

COMMANDS.updateCards = function(client, args) {
	var player = game.clientsToPlayers[client];
	for(k in game.cards) {
		var card = game.cards[k];
		calljs(client, ['create_card', {id: card.id, img: card.img}]);
		if(card.place === 'play') {
			calljs(client, ['show_card', {id: card.id}]);
		}
		if(card.place === 'hand') {
			if(card.owner === player.name) {
				calljs(client, ['move_to_hand', {id: card.id}]);
				calljs(client, ['show_card', {id: card.id}]);
			}
		}
		calljs(client, ['move_card', {id: card.id, top: card.top, left: card.left}]);
		if(card.tapped) {
			callalljs(client, ['toggle_tap', {id: card.id}]);
		}
	}
	calljs(client, ['notify', {message: "Cards Updated"}]);
};

COMMANDS.createCard = function(client, args) {
	var	id = util.getUniqueId(),
		cs = new game.CardStub(id),
		p = game.clientsToPlayers[client],
		c = game.getRandomCard();
	
	cs.img = c.img;
	cs.place = 'play';
	cs.owner = p.name;
	game.cards[id] = cs;
	
	callalljs(client, ['create_card', {id: id,  img: cs.img, name: game.db[cs.img].name}]);
	callalljs(client, ['show_card', {id: id}]);
};

COMMANDS.moveCard = function(client, args) {
	var card = game.cards[args.id];

	card.top = args.top;
	card.left = args.left;

	callalljs(client, ['move_card', {id: args.id, top: args.top, left: args.left}]);
};

COMMANDS.disconnect = function(client, args) {
	delete game.clientsToPlayers[client];
};

COMMANDS.toggleTap = function(client, args) {
	var card = game.cards[args.id];

	card.tapped = !card.tapped;

	callalljs(client, ['toggle_tap', {id: args.id}]);
};

COMMANDS.moveToHand = function(client, args) {
	var 	card = game.cards[args.id],
		player = game.namesToPlayers[card.owner],
		index = player.zones[card.place].indexOf(card);

	player.zones[card.place].splice(index, 1);
	card.place = 'hand';
	card.tapped = false;
	player.zones.hand.push(card);

	callalljs(client, ['hide_card', {id: args.id}]);
	calljs(player.client, ['move_to_hand', {id: args.id}]);
};

COMMANDS.moveToPlay = function(client, args) {
	var	card = game.cards[args.id],
		player = game.clientsToPlayers[client],
		index = player.zones[card.place].indexOf(card);
	
	player.zones[card.place].splice(index, 1);
	card.place = 'play';
	card.top = args.top;
	card.left = args.left;
	callalljs(client, ['move_to_play', {id: card.id, top: card.top, left: card.left}]);
};

COMMANDS.moveToTopOfDeck = function(client, args) {
	var	card = game.cards[args.id],
		player = game.namesToPlayers[card.owner];
	
	player.zones.hand = player.zones.hand.filter(function(e) {
		return e != card;
	});
	player.zones.deck.unshift(card);
	card.place = 'deck';
	
	callalljs(client, ['hide_card', {id: card.id}]);
};

COMMANDS.moveToBottomOfDeck = function(client, args) {
	var	card = game.cards[args.id],
		player = game.namesToPlayers[card.owner];
	
	player.zones.hand = player.zones.hand.filter(function(e) {
		return e != card;
	});
	player.zones.deck.push(card);
	card.place = 'deck';

	callalljs(client, ['hide_card', {id: card.id}]);
};

COMMANDS.getDeckList = function(client, args) {
	calljs(client, ['deck_selector', {list: Object.keys(game.decks)}]);
};

function createAndShuffleDeck(owner, deckName) {
	var deck = game.decks[deckName];

	deck = util.explodeDeck(deck);
	deck = util.shuffle(deck);
	deck = deck.map(function(img) {
		var	id = util.getUniqueId(),
			card = new game.CardStub(id);
		
		card.img = img;
		card.owner = card.controller = owner;
		card.name = game.db[img].name;
		card.place = 'deck';
		game.cards[id] = card;
		return card;
	});
	return deck;
}

COMMANDS.selectDeck = function(client, args) {
	var	player = game.clientsToPlayers[client],
		deck = createAndShuffleDeck(player.name, args.deck);
	
	player.zones.deck = deck;
	callalljs(client, ['notify', {message: args.deck + ' selected!'}]);	
};

COMMANDS.draw = function(client, args) {
	var	player = game.clientsToPlayers[client],
		deck = player.zones.deck;
	
	for(var i = 0; i < parseInt(args.num); i++) {
		var card = deck.shift();
		player.zones.hand.push(card);
		card.place = 'hand';
		callalljs(client, ['create_card', {id: card.id, img: card.img}]);
		calljs(client, ['move_card', {id: card.id, top: (456 + i * 12), left: (12 + i * 12)}]);
		calljs(client, ['move_to_hand', {id: card.id}]);
		calljs(client, ['show_card', {id: card.id}]);
	}
	callalljs(client, ['notify', {message: player.name + ' drew ' + args.num + (args.num === 1 ? ' card.' : ' cards.')}]);
};

COMMANDS.shuffle = function(client, args) {
	var player = game.clientsToPlayers[client];

	util.shuffle(player.zones.deck);

	callalljs(client, ['notify', {message: player.name + ' shuffled its deck.'}]);
};

function viewListCard(c) {
	return {
		id: c.id, 
		img: c.img, 
		name: game.db[c.img].name
	};
}

COMMANDS.viewLibrary = function(client, args) {
	var	player = game.clientsToPlayers[client];

	calljs(client, ['view_top_n', {list: player.zones.deck.map(viewListCard)}]);
	callalljs(client, ['notify', {message: player.name + ' is looking at its library.'}]);
};

COMMANDS.viewTopN = function(client, args) {
	var	player = game.clientsToPlayers[client];

	calljs(client, ['view_dialog', {list: player.zones.deck.slice(0, args.num).map(viewListCard), name: args.name}]);
	callalljs(client, ['notify', {message: player.name + ' is looking at the top ' + args.num + ' cards of its library.'}]);
};
