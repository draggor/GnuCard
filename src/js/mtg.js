var socket = 'NOT_SET';
var COMMANDS = {};

function send_message(msg) {
	if(socket !== 'NOT_SET') {
		socket.send(JSON.stringify(msg));
	}
}

function reverseStr(str) {
	var sp = str.split("");
	var spt = sp.reverse();
	return spt.join("");
}

function pxToInt(px) {
	var pxr = reverseStr(px);
	var pxrs = pxr.substring(2);
	return parseInt(reverseStr(pxrs), 10);
}

function pxToInt(px) {
	return parseInt(px.substring(0, px.length - 2), 10);
}

var BUTTONS = {
	'View Top N': function() {
		var i = parseInt($(input).val(), 10);
		if(isNaN(i) || i <= 0) {
			alert('Enter a number greater than 0!');
		} else {
			send_message(['viewTopN', {num: i, name: 'View Top N'}]);
			$(this).dialog('close');
			$(this).children().remove();
		}
	},
	Cancel: function() {
		$(this).dialog('close');
		$(this).children().remove();
	},
	'Upload Deck': function() {
		$('#uploadform').submit();
		$(this).dialog('close');
		$(this).children().remove();
	},
	'Move Card Up': function() {
		send_message(['moveCardUp', {id: c.id}]);
	}
};

function top_n_dialog() {
	var dialog = $('#viewtopndialog'),
	    input = $('<input type="text">').val(0);
	
	$(dialog).append($('<p>').append($(input)));

	$(dialog).dialog({
		modal: true,
		buttons: {
			"View Top N": function() {
				var i = parseInt($(input).val(), 10);
				if(isNaN(i) || i <= 0) {
					alert('Enter a number greater than 0!');
				} else {
					send_message(['viewTopN', {num: i, name: 'View Top N'}]);
					$(this).dialog('close');
					$(this).children().remove();
				}
			},
			Cancel: function() {
				$(this).dialog('close');
				$(this).children().remove();
			}
		}
	});
}

var SRC_magiccards_info = "http://magiccards.info/scans/";
var SRC_dracolair = "http://mtgimg.dracolair.net/scans/";
var SRC_local = "file///home/draggor/Programming/compojure/magiccards.info/scans/";

function show_image(img) {
	var cardimg = $("<img>").attr("src", $('#imgsrc').val() + img).attr("id", "cardimg");
	$("#cardinfo").html(cardimg);
}

function remove_image() {
	$("#cardinfo").children().remove();
}

function ev_move_card(event, ui) {
	send_message(['moveCard', {id: $(event.target).attr("id"), top: ui.offset.top, left: ui.offset.left}]);
}

function cardAttrs(card) {
	return {
		id: $(card).attr('id'),
		img: $(card).attr('img'),
		name: $(card).attr('name')
	};
}

function makeDraggable(card) {
	return $(card).draggable({
		grid: [12, 12],
		zIndex: 9999,
		helper: 'clone',
		appendTo: 'body',
		containment: 'document',
		revert: 'invalid'
	});
}

/*
 * Currently not used, though should go into a util lib somewhere
 */
function modifyClass(classname, property, value) {
	for(var i = 0; i < document.styleSheets.length; i++) {
		var rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
		for(var j = 0; j < rules.length; j++) {
			if(rules[j].selectorText === classname) {
				if(value) {
					rules[j].style[property] = value;
				} else {
					delete rules[j].style[property];
				}
				return;
			}
		}
	}
}

function makeHover(card) {
	var img = $(card).attr('img');
	return $(card).hover(
		function(e) {
			show_image(img);
		},
		function(e) {
		//	remove_image();
		}
	);
}

function makeContextMenu(card) {
	$(card).contextMenu([
		{"Move to Hand":function(menuItem,menu) {
			var id = $(this).attr("id");
			send_message("moveToHand " + id);
			send_message("moveCard " + id + " 468 24");
		}},
		{"Move to TOP of Deck":function(menuItem,menu) {
			var id = $(this).attr("id");
			send_message("moveToTopOfDeck " + id);
		}},
		{"Move to BOTTOM of Deck":function(menuItem,menu) {
			var id = $(this).attr("id");
			send_message("moveToBottomOfDeck " + id);
		}},
		{"Move to Graveyard":function(menuItem,menu) {
			var id = $(this).attr("id");
			send_message("moveToGraveyard " + id);
		}},
		{"Remove From Game":function(menuItem,menu) {
			var id = $(this).attr("id");
			send_message("removeFromGame " + id);
		}},
		$.contextMenu.separator,
		{"Bees":function(menuItem,menu) { alert("OH GOD NOT THE BEES!"); }}
	]);
	return card;
}

function makeCard(json) {
	var id = json.id, img = json.img;
	var card = $("<div>").addClass("card cardHidden cardPlay cardUntapped").attr("id", id).attr("img", img).css({
		top: json.top || 0, 
		left: json.left || 0, 
		position: 'absolute'
	}).html("C");
	return makeContextMenu(makeDraggable(makeHover(card)));
}

function runCmd(json) {
	var func = COMMANDS[json[0]];

	if(func) {
		func(json[1]);
	} else {
		COMMANDS.notify({message: 'Function ' + func + ' not found!'});
	}
}

COMMANDS.notify = function(json) {
	$("#msgs").text(json.message);
};

function ev_draw_one(event, ui) {
	send_message(['draw', {num:1}]);
}

function ev_draw_n(event, ui) {
	var msg = "draw ";
	send_message(msg);
}

function ev_deck_upload(event, ui) {
	var startCallback = function() {
		return true;
	};
	var completeCallback = function(response) {
		alert(response);
	};
	var dialog = $('#deckuploaddialog');
	var form = $('<form>').attr({enctype:"multipart/form-data", method:"post", action:"upload", id:"uploadform"}).submit(function() {
		 return AIM.submit(this, {
			 'onStart' : startCallback, 
			 'onComplete' : completeCallback
		 });
	});
	$(form).append($('<span>').text('Choose a .txt deck list to upload: '));
	$(form).append($('<input type="file" name="deck" device="files" accept="text/*">'));
	
	$(dialog).append($('<p>').append($(form)));
	$(dialog).dialog({
		modal: true,
		buttons: {
			'Upload Deck': function() {
				$('#uploadform').submit();
				$(this).dialog('close');
				$(this).children().remove();
			},
			Cancel: function() {
				$(this).dialog('close');
				$(this).children().remove();
			}
		}
	});
	event.preventDefault();
}

function ev_get_deck_list(event, ui) {
	send_message(['getDeckList', {}]);
}

COMMANDS.deck_selector = function(json) {
	var dialog = $('#deckselectordialog');

	var form = $('<form>');
	var sel = $('<select>').attr({
		'size': '5',
		'multiple': 'false'
	}).appendTo(form);

	for(var deck = 0; deck < json.list.length; deck++) {
		$('<option>').attr('value', json.list[deck]).text(json.list[deck]).appendTo(sel);
	}

	$(dialog).append($('<p>').append($(form)));

	$(dialog).dialog({
		modal: true,
		buttons: {
			'Select Deck': function() {
				send_message(['selectDeck', {deck: $(sel + ':selected').text()}]);
				$('#draw').show();
				$(this).dialog('close');
				$(this).children().remove();
			},
			Cancel: function() {
				$(this).dialog('close');
				$(this).children().remove();
			}
		}
	});
}

COMMANDS.view_dialog = function(json) {
	var list = json.list;
	var dialog = $('#viewdialog');
	var ul = $('<ul>');

	for(var c = 0; c < list.length; c++) {
		ul.append(makeHover($('<li>').addClass('ui-state-default').attr({id: list[c].id, img: list[c].img}).text(list[c].name)));
	}

	$(ul).sortable({
		revert: true
	});

	$(dialog).append($('<p>').append($(ul)));
	$(dialog).dialog({
		title: json.name,
		buttons: {
			Ok: function() {
				$(this).dialog('close');
				$(this).children().remove();
			}
		}
	});
};

function makeListCard(json) {
	return makeDraggable(makeHover($('<li>').addClass('ui-state-default').attr({id: json.id, img: json.img}).text(json.name)));
}

function makeRadioListCard(json) {
	return makeDraggable(makeHover($('<li>').addClass('ui-state-default').attr({id: json.id, img: json.img}).html($('<input type="radio" name="cardRadio">').val(json.id)).append(json.name)));
}

COMMANDS.view_dialog = function(json) {
	var list = json.list;
	var dialog = $('#viewdialog');
	var ul = $('<ul>');

	for(var c = 0; c < list.length; c++) {
		ul.append($(makeListCard(list[c])).addClass('cardDeck'));
	}

	$(dialog).append($('<p>').append($(ul)));
	var details = {
		title: json.name,
		buttons: {
			Ok: function() {
				$(this).dialog('close');
				$(this).children().remove();
			}
		}
	};
	$(dialog).dialog(details);
};

COMMANDS.view_top_n = function(json) {
	var list = json.list;
	var dialog = $('#viewdialog');
	var ul = $('<ul>');

	for(var c = 0; c < list.length; c++) {
		ul.append($(makeRadioListCard(list[c])).addClass('cardDeck'));
	}
	$(dialog).append($('<form>').append($(ul)));
	var details = {
		title: json.name,
		buttons: {
			Ok: function() {
				$(this).dialog('close');
				$(this).children().remove();
			},
			Up: function() {
				var sel = $('#viewdialog form ul li input:radio:checked');
				alert($(sel).val());
			}
		}
	};
	$(dialog).dialog(details);
};

function ev_move_to_play(event, ui) {
	var func;
	if($(ui.draggable).hasClass("cardHand")) {
		func = 'moveToPlay';
	} else if($(ui.draggable).hasClass("cardPlay")) {
		func = 'moveCard';
	} else if($(ui.draggable).hasClass("cardDeck")) {
		func = 'moveToPlay';
	}
	if(func) {
		send_message([func, {id: $(ui.draggable).attr("id"), top: ui.offset.top, left: ui.offset.left}]);
	} else {
		event.preventDefault();
	}
}

COMMANDS.move_to_play = function(json) {
	var card = "#" + json.id;
	var attrs = cardAttrs(card);
	attrs.top = json.top;
	attrs.left = json.left;
	var newcard = makeCard(attrs);
	$(card).remove();
	$(newcard).prependTo($("#playarea"));
	$(newcard).removeClass("cardHidden cardHand");
	$(newcard).addClass("cardPlay cardUntapped");
};

function ev_move_to_hand(event, ui) {
	if($(ui.draggable).hasClass("cardPlay") || $(ui.draggable).hasClass("cardDeck")) {
		send_message(['moveToHand', {id: $(ui.draggable).attr("id")}]);
	}
}

COMMANDS.move_to_hand = function(json) {
	var card = '#' + json.id;
	var attrs = cardAttrs(card);
	var img = $(card).attr('img');
	attrs.name = img;
	var li = makeListCard(attrs);
	
	$(li).addClass('cardHand').unbind('dragstop');

	$(card).remove();
	$('#hand').append($(li)); //.draggable('option', 'revert', true).unbind('dragstop'));
};

COMMANDS.hide_card = function(json) {
	var card = "#" + json.id;
	$(card).removeClass("cardPlay cardUntapped cardTapped");
	$(card).addClass("cardHidden");
};

function ev_toggle_tap(event) {
	send_message(['toggleTap', {id: $(event.target).attr("id")}]);
}

COMMANDS.toggle_tap = function(json) {
	var card = "#" + json.id;
	$(card).toggleClass("cardUntapped");
	$(card).toggleClass("cardTapped");
};

function ev_logon(event) {
	socket = new io.Socket($('#server').val(), {/*transports: ['websocket'],*/ rememberTransport: false, port:9000});
	socket.on('message', function(data) {
		runCmd(JSON.parse(data));
	});
	socket.on('connect', function() {
		send_message(['logon', {name: $("#logon_name").val(), pass: $("#logon_pass").val()}]);
		$("#logon_name").hide();
		$("#logon_pass").hide();
		$("#logon").hide();
		$("#server").hide();
		$("#deckselector").show();
		$("#deckupload").show();
		$("#addcard").show();
		$("#library").show();
		$("#graveyard").show();
		$("#rfg").show();
		$("#imgsrc").show();
	});
	socket.on('disconnect', function() {
		alert("Ya dun got boot'd!");
	});
	socket.connect();
	event.preventDefault();
}

function update_cards() {
	send_message(['updateCards', {}]);
}

function ev_create_card(event) {
	send_message(['createCard', {}]);
	event.preventDefault();
}

COMMANDS.create_card = function(json) {
	var card = makeCard(json);

	$(card).prependTo($('#playarea'));
};

COMMANDS.move_card = function(json) {
	var card = "#" + json.id;
	var to = pxToInt($(card).css("top"));
	var lo = pxToInt($(card).css("left"));
	var tm = parseInt(json.top, 10) - to;
	var lm = parseInt(json.left, 10) - lo;
	var m = {};
	if(tm > 0) {
		m.tpx = "+=" + tm;
	} else {
		m.tpx = "-=" + Math.abs(tm);
	}
	if(lm > 0) {
		m.lpx = "+=" + lm;
	} else {
		m.lpx = "-=" + Math.abs(lm);
	}
	$(card).animate({left: m.lpx, top: m.tpx }, 100);
};

COMMANDS.show_card = function(json) {
	var card = $("#" + json.id);
	if ($(card).hasClass("cardHidden")) {
		$(card).removeClass("cardHidden");
	}
	return card;
};

function init() {
	$("#library").hide().contextMenu([
		{"Draw 1 Card":function(menuItem,menu){
			send_message(['draw', {num:1}]);
		}},
		{"View Top Card":function(menuItem,menu) {
			send_message(['viewTopN', {num: 1, name: 'View Top Card'}]);
		}},
		{"View Top N Cards":function(menuItem,menu) {
			top_n_dialog();
		}},
		{"View Library":function(menuItem,menu){
			send_message(['viewLibrary', {}]);
		}},
		{"Show Library to a player...":function(menuItem,menu){
			send_message(['showLibrary', {}]);
		}},
		{"Shuffle":function(menuItem,menu){
			send_message(['shuffle', {}]);
		}}
	]);
	$("#imgsrc").hide();
	$("#graveyard").hide().contextMenu([
		{"View Graveyard":function(menuItem,menu) {
			send_message(['viewGraveyard', {}]);
		}}
	]);	
	$('#rfg').hide().contextMenu([
		{"View RFG":function(menuItem,menu) {
			send_message(['viewRfg', {}]);
		}}
	]);
	$("#addcard").hide().bind("click", ev_create_card);
	$("#logon").bind("click", ev_logon);
	$("#deckselector").hide().bind("click", ev_get_deck_list);
	$("#deckupload").hide().bind("click", ev_deck_upload);
	$("#draw").hide().bind("click", ev_draw_one);
	$("div.cardPlay").live("dblclick", ev_toggle_tap);
	$("div.card").draggable();
	$("#playarea").droppable({
		drop: ev_move_to_play
	});
	$("#hand").droppable({
		drop: ev_move_to_hand
	});
	$('#header').dialog({position: 'bottom'});
	$('#handdialog').dialog({
		position: 'right', 
		stack: 'false',
		resizeStop: function(event, ui) {
			$('#hand').css({
				height: (ui.size.height - 80),
				width: (ui.size.width - 75)
			});
		}
	}).css('overflow', 'visible');
	$('#cardinfodialog').dialog({
		position: 'left',
		height: 510,
		width: 350
	});
	$(window).unload(function() {
		send_message(['disconnect', {}]);
	});
}
