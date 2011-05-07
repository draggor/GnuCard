exports.getUniqueId = (function() {
	var id = 0;
	return function() {
		if(arguments[0] === 0) {
			id = 1;
			return 0;
		} else {
			return id++;
		}
	};
})();

exports.shuffle = function(deck) {
	for(var i = 0; i < deck.length; i++) {
		var j = Math.floor(Math.random() * deck.length);
		var tempi = deck[i];
		deck[i] = deck[j];
		deck[j] = tempi;
	}
	return deck;
};

exports.explodeDeck = function(deck) {
	var exploded = [];
	for(var i = 0; i < deck.length; i++) {
		for(var j = 0; j < parseInt(deck[i][0]); j++) {
			exploded.push(deck[i][1]);
		}
	}
	return exploded;
}

exports.delayMap = function(items, callback, delay) {
	var o = new function() {};
	var i = 0;
	var f = function() {
		if(i < items.length) {
			callback(items[i++]);
			return o.id = setTimeout(f, delay);
		}
	};
	o.id = f();
	return o;
}

function doto(obj) {
	for(var i = 1; i < arguments.length; i++) {
		for(var j = 1; j < arguments[i].length; j++) {
			arguments[i][j].apply(obj, [obj].concat(arguments[i][j]));
		}
	}
}

/*
function f1(obj, a1, a2) {
	obj.f1 = a1+a2;
}

function f2(obj, a1) {
	obj.f2 = a1;
}

function f3() {
	this.f3 = "yay?";
}

var m = {};
doto(m,
	[f1, [3, 5]],
	[f2, ["asdf"]]);

doto(m,
	[f1,
		[3, 5],
		[4, 6]],
	[f2,
		["asfd"]]);

doto(m, f1,
	[3, 5],
	[2, 4],
	[9, 8]);

doto(canvas, drawSquare,
	[23, 44],
	[45, 88],
	[12, 9],
	[355, 655]);
*/
