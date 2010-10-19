var socket;
var COMMANDS = {};

function init() {
	$("#library").hide().contextMenu([
		{"Draw 1 Card":function(menuItem,menu){
			send_message(['draw', {num:1}]);
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
	$("#graveyard").hide()
	$("#addcard").hide().bind("click", ev_create_card);
	$("#logon").bind("click", ev_logon);
	$("#deckselector").hide().bind("click", ev_get_deck_list);
	$("#draw").hide().bind("click", ev_draw_one);
	$("div.cardPlay").live("dblclick", ev_toggle_tap);
	$("div.card").draggable();
	$("#playarea").droppable({
		drop: ev_move_to_play
	});
	$("#hand").droppable({
		drop: ev_move_to_hand
	});
	$(window).unload(function() {
        	send_message(['disconnect', {}]);
        });
}

function runCmd(json) {
	var func = COMMANDS[json[0]];

	if(func) {
		func(json[1]);
	} else {
		COMMANDS.notify({message: 'Function ' + funcName + ' not found!'});
	}
}



function notify(json) {
	$("#msgs").text(json.message);
}

COMMANDS.notify = notify;

function send_message(msg) {
	socket.send(JSON.stringify(msg));
}

function ev_draw_one(event, ui) {
	send_message(['draw', {num:1}]);
}

function ev_draw_n(event, ui) {
	var msg = "draw ";
	send_message(msg);
}

function ev_get_deck_list(event, ui) {
	send_message(['getDeckList', {}]);
}

function deck_selector(json) {
	var list = json.list;
	var popups = $("#popups");
	var bg = $("<div>").css({"width": "100%",
	                         "height": "100%",
				 "background-color": "#000000",
				 "z-index": "9999",
				 "position": "absolute",
				 "opacity": "0.5"}).appendTo(popups);
	var fg = $("<div>").css({"width": "70%",
	                         "height": "70%",
				 "z-index": "10000",
				 "position": "absolute",
				 "margin": "2em",
				 "background-color": "#FFFFFF"}).appendTo(popups);
	var form = $("<form>");
	var sel = $("<select>").attr({"size": "5",
	                              "multiple": "false"}).appendTo(form);
	for(var deck = 0; deck < list.length; deck++) {
		$("<option>").attr("value", list[deck]).text(list[deck]).appendTo(sel);
	}
	form.appendTo(fg);
	var selfn = function(event, ui) {
		send_message(['selectDeck', {deck: $(sel + ":selected").text()}]);
		$(popups).empty();
		$("#deckselector").hide();
		$("#draw").show();
	};
	$("<input type='button'>").attr("value", "Select Deck").bind("click", selfn).appendTo(form);
}

COMMANDS.deck_selector = deck_selector;

function view_library(json) {
	var list = json.list;
	var popups = $("#popups");
	var bg = $("<div>").css({"width": "100%",
	                         "height": "100%",
				 "background-color": "#000000",
				 "z-index": "9999",
				 "position": "absolute",
				 "opacity": "0.5"}).appendTo(popups);
	var fg = $("<div>").css({"width": "70%",
	                         "height": "70%",
				 "z-index": "10000",
				 "position": "absolute",
				 "margin": "2em",
				 "background-color": "#FFFFFF"}).appendTo(popups);
	var sel = $("<select>").attr({"size":"20",
				      "multiple":"false"}).appendTo(fg);
	for(var card = 0; card < list.length; card++) {
		$("<option>").attr({"value":list[card].id,
		                    "img":list[card].img}).text(list[card].name).appendTo(sel);
	}
	var selfn = function(event, ui) {
		$(popups).empty();
	}
	$("<input type='button'>").attr("value", "Close").bind("click", selfn).appendTo(fg);
}

COMMANDS.view_library = view_library;


function ev_move_to_play(event, ui) {
	if($(ui.draggable).hasClass("cardHand")) {
		send_message(['moveToPlay', {id: $(ui.draggable).attr("ID")}]);
	}
}

function move_to_play(json) {
	var card = "#" + json.id;
	$(card).prependTo($("#playarea"));
	$(card).removeClass("cardHidden cardHand");
	$(card).addClass("cardPlay cardUntapped");
}

COMMANDS.move_to_play = move_to_play;

function ev_move_to_hand(event, ui) {
	if($(ui.draggable).hasClass("cardPlay")) {
		send_message(['moveToHand', {id: $(ui.draggable).attr("ID")}]);
	}
}

function move_to_hand(json) {
	var card = "#" + json.id;
	$(card).appendTo($("#hand"));
	$(card).removeClass("cardHidden cardPlay");
	$(card).addClass("cardHand");
}

COMMANDS.move_to_hand = move_to_hand;

function hide_card(json) {
	var card = "#" + json.id;
	$(card).removeClass("cardPlay cardUntapped cardTapped");
	$(card).addClass("cardHidden");
}

COMMANDS.hide_card = hide_card;

function ev_toggle_tap(event) {
	send_message(['toggleTap', {id: $(this).attr("ID")}]);
}

function toggle_tap(json) {
	var card = "#" + json.id;
	$(card).toggleClass("cardUntapped");
	$(card).toggleClass("cardTapped");
}

COMMANDS.toggle_tap = toggle_tap;

function ev_logon(event) {
	socket = new io.Socket($('#server').val(), {rememberTransport: false, port:9000});
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
		$("#addcard").show();
		$("#library").show();
		$("#graveyard").show();
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

var SRC_magiccards_info = "http://magiccards.info/scans/";
var SRC_dracolair = "http://mtgimg.dracolair.net/scans/";
var SRC_local = "file///home/draggor/Programming/compojure/magiccards.info/scans/";

function show_image(img) {
	var cardimg = $("<img>").attr("src", SRC_magiccards_info + img).attr("ID", "cardimg");
	$("#cardinfo").html(cardimg);
}

function remove_image() {
	$("#cardinfo").children().remove();
}

function create_card(json) {
	var id = json.id, img = json.img;
	var card = $("<div>").addClass("card cardHidden cardPlay cardUntapped").attr("ID", id).attr("img", img).css({top: 0, left:0, position:'absolute'}).html("C");
	$(card).draggable({ grid: [12, 12], 
	                    zIndex: 9999,
			    containment: 'window',
			    stop: ev_move_card });
	$(card).hover(
		function(e) {
			show_image(img);
		},
		function(e) {
		//	remove_image();
		}
	);
	$(card).prependTo($("#playarea"));
	$(card).contextMenu([
		{"Move to Hand":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("moveToHand " + id);
			send_message("moveCard " + id + " 468 24");
		}},
		{"Move to TOP of Deck":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("moveToTopOfDeck " + id);
		}},
		{"Move to BOTTOM of Deck":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("moveToBottomOfDeck " + id);
		}},
		{"Move to Graveyard":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("moveToGraveyard " + id);
		}},
		{"Remove From Game":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("removeFromGame " + id);
		}},
		$.contextMenu.separator,
		{"Bees":function(menuItem,menu) { alert("OH GOD NOT THE BEES!"); }}
	]);
	return card;
}

COMMANDS.create_card = create_card;

function reverseStr(str) {
	sp = str.split("");
	spt = sp.reverse();
	return spt.join("");
}

function pxToInt(px) {
	pxr = reverseStr(px);
	pxrs = pxr.substring(2);
	return parseInt(reverseStr(pxrs));
}

function ev_move_card(event, ui) {
	send_message(['moveCard', {id: $(this).attr("ID"), top: ui.offset.top, left: ui.offset.left}]);
}

function move_card(json) {
	var card = $("#" + json.id);
	var to = pxToInt($(card).css("top"));
	var lo = pxToInt($(card).css("left"));
	var tm = parseInt(json.top) - to;
	var lm = parseInt(json.left) - lo;
	if(tm > 0)
		var tpx = "+=" + tm;
	else
		var tpx = "-=" + Math.abs(tm);
	if(lm > 0)
		var lpx = "+=" + lm;
	else
		var lpx = "-=" + Math.abs(lm);
	$(card).animate({ left: lpx,
	  		  top: tpx },
		        100);
}

COMMANDS.move_card = move_card;

function show_card(json) {
	var card = $("#" + json.id);
	if ($(card).hasClass("cardHidden")) {
		$(card).removeClass("cardHidden");
	}
	return card;
}

COMMANDS.show_card = show_card;
