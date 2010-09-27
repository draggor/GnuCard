function card(params){
	
	var defaults = {
			cardWidth : 100,
			cardHeight : 150
		};
	
	this.init(params);
	
	this.container
		.addClass('card droppable')
		.height(this.params.height || defaults.cardHeight)
		.width(this.params.width || defaults.cardWidth)
		.draggable()
		
	
	return this;
}

card.prototype = juiElement;