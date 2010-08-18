var namesToPlayers = {};
var clientsToPlayers = {};
var decks = {};
var cards = {};
var db = {};
var dba = [];

exports.namesToPlayers = namesToPlayers;
exports.clientsToPlayers = clientsToPlayers;
exports.decks = decks;
exports.cards = cards;
exports.db = db;
exports.dba = dba;

function Player(client, name, pass) {
	this.client = client;
	this.name = name;
	this.pass = pass;
	this.zones = {
		deck: [],
		hand: [],
		grave: [],
		rfg: [],
		play: [],
	};
};

exports.Player = Player;

function CardStub(id) {
	this.id = id;
	this.top = 0;
	this.left = 0;
	this.place = 'hidden';
	this.tapped = false;
	this.owner = '';
	this.controller = '';
	this.pic = '';
}

exports.CardStub = CardStub;

var Card = exports.Card = function() {
	this.img = '';
	this.artist = '';
	this.set = '';
	this.rarity = '';
	this.cc = '';
	this.name = '';
	this.types = [];
	this.supertype = '';
	this.subtypes = [];
	this.power = '';
	this.toughness = '';
};

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

exports.getRandomCard = function() {
	return exports.db[exports.dba[Math.floor(Math.random() * exports.dba.length)]];
};
