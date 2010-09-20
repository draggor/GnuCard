function juiWindow(params){
	
	var defaults = {
			windowWidth : 300,
			windowHandleHeight : 35,
			windowPaneHeight : 300,
		},
		juiId;
	
	this.init(params);
	
	juiId = this.juiId;
	
	this.windowHandle = $('<div>', { 
			class : 'window handle'
		})
		.css({
			position : 'absolute',
			top : 0,
			left : 0,
			height : this.params.handleHeight || defaults.windowHandleHeight,
			width : this.params.width || defaults.windowWidth
		});
		
	this.windowPane = $('<div>', { 
			class : 'window pane'
		})
		.css({
			position : 'absolute',
			top : this.windowHandle.css('height'),
			left : 0,
			height : this.params.height || defaults.windowPaneHeight,
			width : this.params.width || defaults.windowWidth,
			opacity: .8
		});
		
	this.container.draggable({
			handle: this.windowHandle
		})
		.append(this.windowHandle)
		.append(this.windowPane);
	
	return this;
}

juiWindow.prototype = juiElement;