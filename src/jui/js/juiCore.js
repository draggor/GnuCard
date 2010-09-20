juiElement = {
	init: function(params){
		this.juiId = 'juiId' + (window.juiId ? window.juiId++ : window.juiId = 0);
		
		this.params = params || {};
	
		if(!this.params.container){
			this.container = new $('<div>',
				{
					'class' : 'juiElement'	
				});
		}else{
			this.container = this.params.container; 
		}
		
		this.container.css({
				position : 'absolute',
				top : 0,
				left : 0
			})
			.attr('id', this.juiId);
		
		return this;
	},
	
	generate: function(){
		return this.container;
	}
};
