var namesToPlayers = {};
var clientsToPlayers = {};
var decks = {};
var cards = {};
var db = {};

exports.namesToPlayers = namesToPlayers;
exports.clientsToPlayers = clientsToPlayers;
exports.decks = decks;
exports.cards = cards;

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
	play: [],
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

var Card = exports.Card = function() {};

Card.prototype.img = '';
Card.prototype.artist = '';
Card.prototype.set = '';
Card.prototype.rarity = '';
Card.prototype.cc = '';
Card.prototype.name = '';

function Deck(name, list) {
	this.name = name;
	this.list = list;
}

exports.Deck = Deck;

function reset() {
	cards = {};
	clientsToPlayers = {};
	namesToPlayers = {};
	decks = {};
}

exports.reset = reset;
