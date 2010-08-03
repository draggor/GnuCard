exports.namesToPlayers = {};
exports.clientsToPlayers = {};
exports.decks = {};

function Player(client, name, pass) {
	this.client = client;
	this.name = name;
	this.pass = pass;
}

Player.prototype.zones = {
	deck: [],
	hand: [],
	grave: [],
	rfg: [],
	play: []
};

exports.Player = Player;

function CardStub(id) {
	this.id = id;
}

CardStub.prototype.top = 0;
CardStub.prototype.left = 0;
CardStub.prototype.place = 'hidden';
CardStub.prototype.tapped = false;
CardStub.prototype.owner = '';
CardStub.prototype.controller = '';
CardStub.prototype.pic = '';

exports.CardStub = CardStub;
