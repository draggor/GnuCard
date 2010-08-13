var	libxml = require('libxmljs'),
	sys = require('sys'),
	util = require('./util'),
	game = require('./game'),
	repl = require('repl'),
	http = require('http');

var DB = {};

function getResponseHandler(xmlParser) {
	return function(response) {
		var fullResp = '';
		response.setEncoding('utf8');
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

function cardDetailSetter(doc) {
	var	imgNname = doc.get('td/a'),
		typesNpt = doc.get('td[2]'),
		cc = doc.get('td[3]'),
		rarity = doc.get('td[4]'),
		artist = doc.get('td[5]'),
		set = doc.get('td[6]');

	var c = new game.Card();

	c.img = imgNname.attr('href').value();
	c.name = imgNname.text();
	c.rarity = rarity.text();
	c.artist = artist.text();
	c.set = set.text();
	c.cc = cc.text();

	return c;
}

function cardMainXmlParser(xml) {
	var 	doc = libxml.parseHtmlString(xml),
		trs = doc.find('/html/body/table[3]/tr');
	
	for(var i = 1; i < trs.length; i++) {
		var c = cardDetailSetter(trs[i]);
		DB[c.img] = c;
	}
}

function spoilerXmlParser(xml) {
	var	doc = libxml.parseHtmlString(xml),
		options = doc.find('/html/body/form/table/tr[18]/td/table/tr/td[1]/select/optgroup/option');

	var i = 0;
	setInterval(function() {
		if(i < options.length) {
			sys.log(options[i++]);
		} else {
			sys.log(options[i = 0]);
		}
	}, 250);
//	util.delayMap(options, function(opt) { sys.log(opt); }, 3000);
/*
	var i = 1;
	var f = function(xml) {
		cardMainXmlParser(xml);
		if(i < options.length) {
			get(formatQueryString(options[i++].attr('value').value().split('/')[0]), cardMainResponseHandler);
		}
	};

	var cardMainResponseHandler = getResponseHandler(f);
	
	get(formatQueryString(options[0].attr('value').value().split('/')[0]), cardMainResponseHandler);
	*/
}

function formatQueryString(set) {
	return '/query?q=e%3A' + set + '%2Fen&v=olist&s=cname';
}

var cardTextResponseHandler = getResponseHandler(cardTextXmlParser);

var cardMainResponseHandler = getResponseHandler(cardMainXmlParser);

var spoilerResponseHandler = getResponseHandler(spoilerXmlParser);

get('/search.html', spoilerResponseHandler);
//get(formatQueryString('zen'), cardMainResponseHandler);

var r = repl.start();
r.context.DB = DB;
r.context.game = game;
