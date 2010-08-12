var	libxml = require('libxmljs'),
	util = require('./util'),
	game = require('./game'),
	repl = require('repl'),
	http = require('http');

var DB = {};

function getResponseHandler(xmlParser) {
	return function(response) {
		var fullResp = '';
		response.on('data', function(chunk) {
			fullResp += chunk;
		});
		response.on('end', function() {
			xmlParser(fullResp);
			fullResp = '';
		});
	};
}

function get(path, responseHandler) {
	var req = http.createClient(80, 'magiccards.info').request('GET', path, {'host': 'magiccards.info'});
	req.on('response', responseHandler);
	req.end();
}

function cardTextXmlParser(xml) {
	var doc = libxml.parseHtmlString(xml);
	var text = doc.get('/html/body/table[3]/tr/td[2]/p[2]/b').toString();
	text = text.substring(3, text.length - 4);
	console.log(text);
}

/*  
 *  This needs to be adjusted when iterating over the internal table of the page
 *  That, or we'll use get requests on the set selector from the advanced page and scour that way.
 */
function cardMainXmlParser(xml) {
	var 	doc = libxml.parseHtmlString(xml),
		imgNname = doc.get('/html/body/table[3]/tr[2]/td/a'),
		typesNpt = doc.get('/html/body/table[3]/tr[2]/td[2]'),
		cc = doc.get('/html/body/table[3]/tr[2]/td[2]'),
		rarity = doc.get('/html/body/table[3]/tr[2]/td[4]'),
		artist = doc.get('/html/body/table[3]/tr[2]/td[5]'),
		set = doc.get('/html/body/table[3]/tr[2]/td[6]');
	
	var c = new game.Card();

	c.img = imgNname.attr('href').value();
	c.name = imgNname.text();
	c.rarity = rarity.text();
	c.artist = artist.text();
	c.set = set.text();
	c.cc = cc.text();
	console.log(c.name + c.img + c.rarity);
}

function spoilerXmlParser(xml) {
	var	doc = libxml.parseHtmlString(xml),
		options = doc.find('/html/body/form/table/tr[18]/td/table/tr/td[1]/select/optgroup/option');
}

function formatQueryString(set) {
	return '/query?q=e%3A' + set + '%2Fen&v=olist&s=cname';
}

var cardTextResponseHandler = getResponseHandler(cardTextXmlParser);

var cardMainResponseHandler = getResponseHandler(cardMainXmlParser);

var spoilerResponseHandler = getResponseHandler(spoilerXmlParser);

//get('/roe/en/14.html', cardTextResponseHandler);
//get(formatQueryString('roe'), cardMainResponseHandler);
get('/search.html', spoilerResponseHandler);

var r = repl.start();
r.context.DB = DB;
r.context.game = game;
