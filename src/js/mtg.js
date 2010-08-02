var socket;

function init() {
	io.setPath('/js/Socket.IO/');
	socket = new io.Socket('localhost', {port:9000});
	socket.connect();
	socket.on('message', function(data) {
	      alert(data);
	      eval(data);
	});

	$("#library").hide().contextMenu([
		{"Draw 1 Card":function(menuItem,menu){
			send_message("draw 1");
		}},
		{"View Library":function(menuItem,menu){
			send_message("view_library");
		}},
		{"Show Library to a player...":function(menuItem,menu){
			send_message("show_library");
		}},
		{"Shuffle":function(menuItem,menu){
			send_message("shuffle");
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
        	send_message("disconnect");
        });
}

function notify(msg) {
	$("#msgs").text(msg);
}

function send_message(msg) {
	socket.send(msg);
}

function ev_draw_one(event, ui) {
	var msg = "draw 1";
	send_message(msg);
}

function ev_draw_n(event, ui) {
	var msg = "draw ";
	send_message(msg);
}

function ev_get_deck_list(event, ui) {
	var msg = "get_deck_list";
	send_message(msg);
}

function deck_selector(list) {
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
		var msg = "select_deck " + $(sel + ":selected").text();
		send_message(msg);
		$(popups).empty();
		$("#deckselector").hide();
		$("#draw").show();
	};
	$("<input type='button'>").attr("value", "Select Deck").bind("click", selfn).appendTo(form);
}

function view_library(list) {
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
		$("<option>").attr({"value":list[card][0],
		                    "pic":list[card][1]}).text(list[card][2]).appendTo(sel);
	}
	var selfn = function(event, ui) {
		$(popups).empty();
	}
	$("<input type='button'>").attr("value", "Close").bind("click", selfn).appendTo(fg);
}


function ev_move_to_play(event, ui) {
	if($(ui.draggable).hasClass("cardHand")) {
		var msg = "move_to_play " + $(ui.draggable).attr("ID");
		send_message(msg);
	}
}

function move_to_play(id) {
	var card = "#" + id;
	$(card).prependTo($("#playarea"));
	$(card).removeClass("cardHidden cardHand");
	$(card).addClass("cardPlay cardUntapped");
}

function ev_move_to_hand(event, ui) {
	if($(ui.draggable).hasClass("cardPlay")) {
		var msg = "move_to_hand " + $(ui.draggable).attr("ID");
		send_message(msg);
	}
}

function move_to_hand(id) {
	var card = "#" + id;
	$(card).appendTo($("#hand"));
	$(card).removeClass("cardHidden cardPlay");
	$(card).addClass("cardHand");
}

function hide_card(id) {
	var card = "#" + id;
	$(card).removeClass("cardPlay cardUntapped cardTapped");
	$(card).addClass("cardHidden");
}

function ev_toggle_tap(event) {
	var msg = "toggle_tap " + $(this).attr("ID");
	send_message(msg);
}

function toggle_tap(id) {
	var card = "#" + id;
	$(card).toggleClass("cardUntapped");
	$(card).toggleClass("cardTapped");
}

function ev_logon(event) {
	var msg = "logon " + $("#logon_name").val() + " " + $("#logon_pass").val();
	send_message(msg);
	$("#logon_name").hide();
	$("#logon_pass").hide();
	$("#logon").hide();
	$("#deckselector").show();
	$("#addcard").show();
	$("#library").show();
	$("#graveyard").show();
	event.preventDefault();
}

function update_cards() {
	send_message("update_cards");
}

function ev_create_card(event) {
	send_message("create_card");
	event.preventDefault();
}

var SRC_magiccards_info = "http://magiccards.info/scans/";
var SRC_dracolair = "http://mtgimg.dracolair.net/scans/";
var SRC_local = "file///home/draggor/Programming/compojure/magiccards.info/scans/";

function show_image(img) {
	var cardimg = $("<img>").attr("src", SRC_dracolair + img).attr("ID", "cardimg");
	$("#cardinfo").html(cardimg);
}

function remove_image() {
	$("#cardinfo").children().remove();
}

function create_card(id, img) {
	var card = $("<div>").addClass("card cardHidden cardPlay cardUntapped").attr("ID", id).attr("pic", img).css({top: 0, left:0}).html("C");
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
			send_message("move_to_hand " + id);
			send_message("move_card " + id + " 468 24");
		}},
		{"Move to TOP of Deck":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("move_to_top_of_deck " + id);
		}},
		{"Move to BOTTOM of Deck":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("move_to_bottom_of_deck " + id);
		}},
		{"Move to Graveyard":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("move_to_graveyard " + id);
		}},
		{"Remove From Game":function(menuItem,menu) {
			var id = $(this).attr("ID");
			send_message("remove_from_game " + id);
		}},
		$.contextMenu.separator,
		{"Bees":function(menuItem,menu) { alert("OH GOD NOT THE BEES!"); }}
	]);
	return card;
}

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
	var msg = "move_card " + $(this).attr("ID") + " " + ui.offset.top + " " + ui.offset.left;
	send_message(msg);
}

function move_card(id, td, ld) {
	var card = $("#" + id);
	var to = pxToInt($(card).css("top"));
	var lo = pxToInt($(card).css("left"));
	var tm = parseInt(td) - to;
	var lm = parseInt(ld) - lo;
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

function show_card(id) {
	var card = $("#" + id);
	if ($(card).hasClass("cardHidden")) {
		$(card).removeClass("cardHidden");
	}
	return card;
}

function hide_card(id) {
	var card = $("#" + id);
	if ($(card).hasClass("cardHidden")) {
	} else {
		$(card).addClass("cardHidden");
	}
	return card;
}