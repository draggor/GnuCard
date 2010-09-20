juiElement = {
	init: function(params){
		this.params = params || {};
	
		if(!this.params.container){
			this.container = new $('<div>',
				{
					class : 'juiElement'	
				});
		}else{
			this.container = this.params.container; 
		}
		
		return this;
	}
};
