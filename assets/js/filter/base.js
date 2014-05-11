define(['layer-manager'], function(LayerManager) {

	return new Class({
		name:'',
		manager:null,
		working:false,

		initialize: function() {
			this.manager = LayerManager;
		},

		getPixels: function() {
			var layers = this.manager.getLayers();
			var data = [];

			layers.each(function(layer) {
				data.push(layer.canvas.getContext('2d'));
			});

			return data;
		},

		drawPreview: function(canvas, opacity) {
			var useOpacity = opacity == undefined ? true : opacity;
			var context = canvas.getContext('2d');
			context.clearRect(0, 0, this.manager.width, this.manager.height);

			$$('#layers-container li').reverse().each(function(el) {
				layer = el.retrieve('ref');

				if(useOpacity) {
					context.save();
					context.globalAlpha = layer.opacity || 1;
					context.drawImage(layer.canvas, 0, 0, this.manager.width, this.manager.height);
					context.restore();
				}
				else {
					context.drawImage(layer.canvas, 0, 0, this.manager.width, this.manager.height);
				}
			}.bind(this));
		},

		displayPreview: function() {
			this.tmpCanvas.setStyle('display', 'inline');
		},

		getTempCanvas: function() {
			if(!this.tmpCanvas) {
				var offset = $('canvas-container').getCoordinates($$('#canvas-container canvas.canvas')[0]);
				this.tmpCanvas = new Element('canvas', {
					id: 'tmp-canvas',
					styles: {
						'background-color':'#fff',
						display: 'none',
						left: -(offset.left + 1),
						position:'absolute',
						top: -(offset.top + 1),
						'z-index': 765
					},
					width: LayerManager.width,
					height: LayerManager.height
				});

				$('canvas-container').adopt(this.tmpCanvas);
			}

			return this.tmpCanvas;
		},

		getName: function() {
			return this.name
		},

		hasPreview: function() {
			return this.tmpCanvas != null;
		},

		getInfo: function() {
			return '';
		},

		initInfo: function() {},
		removeInfo: function() {}
	});
});
