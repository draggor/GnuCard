var	xml2js = require('xml2js'),
	sys = require('sys'),
	fs = require('fs'),
	game = require('./game'),
	http = require('http');

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
	return req;
}

/*
 * FIX THIS
 */
function cardTextXmlParser(xml) {
	var doc = libxml.parseHtmlString(xml);
	var text = doc.get('/html/body/table[3]/tr/td[2]/p[2]/b').toString();
	text = text.substring(3, text.length - 4);
	console.log(text);
}

function cardDetailSetter(cj) {
	var c = new game.Card();

	c.img = cj.td[0].a['@'].href;
	c.name = cj.td[0].a['#'];
	c.rarity = cj.td[3];
	c.artist = cj.td[4];
	c.set = cj.td[5].img['#'];
	c.cc = cj.td[2];

	var s = cj.td[1];
	s = s.split(' - ');

	if(s.length === 1) {
		c.types = s[0];
	} else {
		var types = s[0];
		var other = s[1];

		other = other.split(' ');
		if(other.length === 1) {
			c.subtypes = other;
		} else {
			var pt = other.pop();
			pt = pt.split('/');
			if(pt.length === 1) {
				c.loyalty = pt[0];
			} else {
				c.power = pt[0];
				c.toughness = pt[1];
			}
			c.subtypes = other;
			c.types = types;
		}
	}

	return c;
}

function cardMainXmlParser(xml) {
	var parser = new xml2js.Parser();
	parser.addListener('end', function(result) {
		var cardjson = result.body.hr.br.br.table.tr;

		if(cardjson) {
			cardjson.shift();

			var cards = cardjson.map(cardDetailSetter);

			for(i in cards) {
				game.db[cards[i]['img']] = cards[i];
				game.dba.push(cards[i].img);
			}
			sys.puts('Done');
		} else {
			sys.puts('Error: Couldn\'t parse!');
		}
	});

	parser.parseString(xml);
}

function spoilerXmlParser(xml) {
	var	parser = new xml2js.Parser();
	parser.addListener('end', function(result) {
		var setjson = result.body.hr.form.table.tr[17].td.table.tr.td[0].br.select.optgroup;
		var sets = [];
		for(i in setjson) {
			if(Array.isArray(setjson[i].option)) {
				for(k in setjson[i].option) {
					sets.push(setjson[i].option[k]['@'].value.split('/')[0]);
				}
			} else {
				sets.push(setjson[i].option['@'].value.split('/')[0]);
			}
		}
	
		var i = 1;
		var f = function(xml) {
			sys.log('Parsing set: ' + sets[i]);
			cardMainXmlParser(xml);
			if(i < sets.length) {
				setTimeout(get, 1000, formatQueryString(sets[i++]), cardMainResponseHandler);
			}
		};
	
		var cardMainResponseHandler = getResponseHandler(f);
		get(formatQueryString(sets[0]), cardMainResponseHandler);
	});

	parser.parseString(xml);
}

function formatQueryString(set) {
	return '/query?q=e%3A' + set + '%2Fen&v=olist&s=cname';
}

var cardTextResponseHandler = getResponseHandler(cardTextXmlParser);

var cardMainResponseHandler = getResponseHandler(cardMainXmlParser);

var spoilerResponseHandler = getResponseHandler(spoilerXmlParser);

exports.getSpoiler = function() {
	get('/search.html', spoilerResponseHandler);
};

exports.saveSpoiler = function() {
	fs.writeFile('./spoiler_map.js', JSON.stringify(game.db));
	fs.writeFile('./spoiler_array.js', JSON.stringify(game.dba));
};

exports.loadSpoiler = function() {
	fs.readFile('./spoiler_map.js', function(err, data) {
		game.db = JSON.parse(data);
		sys.puts('Done loading spoiler_map.js');
	});
	fs.readFile('./spoiler_array.js', function(err, data) {
		game.dba = JSON.parse(data);
		sys.puts('Done loading spoiler_array.js');
	});
};
