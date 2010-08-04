var game = require('./game');
var util = require('./util');

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

function runCmd(client, funcName, args) {
	var func = COMMANDS[funcName];

	if(func) {
		func(client, args);
	} else {
		calljs(client, 'notify', 'Function ' + funcName + ' not found!');
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
			calljs(client, 'notify', "WRONG PASS!");
		}
	} else {
		var player = new game.Player(args.client, args.name, args.pass);
		game.clientsToPlayers[args.client] = player;
		game.namesToPlayers[args.name] = player;
		callalljs(client, 'notify', args.name + ' logged on!');
		runCmd(client, 'updateCards', args);
	}
};

COMMANDS.updateCards = function(client, args) {
	var player = game.clientsToPlayers[client];
	for(card in game.cards) {
		calljs(client, 'create_card', card.id, card.pic);
		if(card.place === 'play') {
			calljs(client, 'show_card', card.id);
		}
		if(card.place === 'hand') {
			if(card.owner === player.name) {
				calljs(client, 'move_to_hand', card.id);
				calljs(client, 'show_card', card.id);
			}
		}
		calljs(client, 'move_card', card.id, card.top, card.left);
		if(card.tapped) {
			callalljs(client, 'toggle_tap', card.id);
		}
	}
	calljs(client, 'notify', "Cards Updated");
};

COMMANDS.createCard = function(client, args) {
	var	id = util.getUniqueId(),
		c = new game.CardStub(id),
		p = game.clientsToPlayers[client],
		img = util.getRandomCard();
	
	c.pic = img.pic;
	c.place = 'play';
	c.owner = p.name;
	game.cards[id] = c;

	callalljs(client, 'create_card', id + ', ' +c.pic);
	callalljs(client, 'show_card', id);
};

COMMANDS.moveCard = function(client, args) {
	var card = game.cards[args.id];

	card.top = args.top;
	card.left = args.left;

	callalljs(client, 'move_card', args.id + ', ' + args.top + ', ' args.left);
};

COMMANDS.disconnect = function(client, args) {
	delete game.clientsToPlayers[client];
};

COMMANDS.toggleTap = function(client, args) {
	var card = game.cards[args.id];

	card.tapped = !card.tapped;

	callalljs(client, 'toggle_tap', args.id);
};

COMMANDS.moveToHand = function(client, args) {
	var 	card = game.cards[args.id],
		player = game.namesToPlayers[card.owner];
	
	card.place = 'hand';
	card.tapped = false;
	player.hand.push(card);

	callalljs(client, 'hide_card', card.id);
	calljs(player.client, 'move_to_hand', card.id);
};

COMMANDS.moveToPlay = function(client, args) {
	var	card = game.cards[args.id],
		player = game.clientsToPlayers[client],
		index = player.hand.indexOf(card);
	
	card.place = 'play';
	delete player.hand[index];
};

COMMANDS.moveToTopOfDeck = function(client, args) {
	var	card = game.cards[args.id],
		player = game.namesToPlayers[card.owner];
	
	player.hand = player.hand.filter(function(e) {
		return e != card;
	});
	player.deck.unshift(card);
	card.place = 'deck';
	
	callalljs(client, 'hide_card', card.id);
};

COMMANDS.moveToBottomOfDeck = function(client, args) {
	var	card = game.cards[args.id],
		player = game.namesToPlayers[card.owner];
	
	player.hand = player.hand.filter(function(e) {
		return e != card;
	});
	player.deck.push(card);
	card.place = 'deck';

	callalljs(client, 'hide_card', card.id);
};

COMMANDS.getDeckList = function(client, args) {
	calljs(client, 'deck_selector', Object.keys(game.decks));
};

function createAndShuffleDeck(owner, deckName) {
	var deck = game.decks[owner];

	deck = explodeDeck(deck);
	deck = util.shuffle(deck);
	deck = deck.map(function(img) {
		var	id = util.getUniqueId(),
			card = new game.Card(id);

		card.pic = img;
		card.owner = card.controller = owner;
		game.cards[id] = card;
	});
	return deck;
}

COMMANDS.selectDeck = function(client, args) {
	var	player = game.clientsToPlayers[client],
		deck = createAndShuffleDeck(player.name, args.deck);
	
	player.deck = deck;
	callalljs(client, 'notify', args.deck + ' selected!');	
};

COMMANDS.draw = function(client, args) {
	var	player = game.clients.ToPlayers[client],
		deck = player.deck;
	
	for(var i = 0; i < parseInt(args.num); i++) {
		var card = deck.shift();
		player.hand.push(card);
		calljs(client, 'move_card', card.id + ', ' + (456 + i * 12) + ', ' + (12 + i * 12));
		calljs(client, 'move_to_hand', card.id);
	}
	callalljs(client, 'notify', player.name + ' drew ' + args.num + (args.num === 1 ? ' card.' : ' cards.'));
};
