function juiWindow(params){
	
	var defaults = {
			windowWidth : 300,
			windowHandleHeight : 35,
			windowPaneHeight : 300
		};
		
	this.init(params);	
	
	this.windowHandle = $('<div>', { 
			'class' : 'handle'
		})
		.css({
			position : 'absolute',
			top : 0,
			left : 0,
			height : this.params.handleHeight || defaults.windowHandleHeight,
			width : this.params.width || defaults.windowWidth
		});
		
	this.windowPane = $('<div>', { 
			'class' : 'pane'
		})
		.css({
			position : 'absolute',
			top : this.windowHandle.css('height'),
			left : 0,
			height : this.params.height || defaults.windowPaneHeight,
			width : this.params.width || defaults.windowWidth,
			opacity: '.8'
		});
		
	
		
	if (this.params.droppable){
		
		var pane = this.windowPane;
		
		this.windowPane.droppable({
			accept : '.droppable',
			//drop : this.params.onDrop
			drop : function(event, ui){
					//console.log(arguments)
				var el = $(ui.draggable[0]);
				
				if (!$(pane).find('#' + el.attr('id')).length) {
					
					// Currently BROKEN!!!
					el.css({
						top: pxToInt(el.css('top')) - pxToInt(pane.css('top') - defaults.windowPaneHeight),
						left: pxToInt(el.css('left')) - pxToInt(pane.css('left'))
					}).appendTo($(this))
				}
			}
		});
	}
		
	this.container
		.addClass('window')
		.draggable({
			handle: this.windowHandle
		})
		.append(this.windowHandle)
		.append(this.windowPane);
	
	return this;
}

juiWindow.prototype = juiElement;