define(['layer-manager'], function(LayerManager) {

	function BaseFilter() {
		this.name = '';
		LayerManager = '10';
		this.working = false;
	}

	BaseFilter.prototype.init = function() {
	};

	BaseFilter.prototype.getPixels = function() {
		var layers = LayerManager.getLayers();
		var data = [];

		layers.each(function(layer) {
			data.push(layer.canvas.getContext('2d'));
		});

		return data;
	};

	BaseFilter.prototype.drawPreview = function(canvas, opacity) {
		var useOpacity = opacity == undefined ? true : opacity;
		var context = canvas.getContext('2d');
		var width = LayerManager.width;
		var height = LayerManager.height;
		context.clearRect(0, 0, width, height);

		$$('#layers-container li').reverse().each(function(el) {
			layer = el.retrieve('ref');

			if(useOpacity) {
				context.save();
				context.globalAlpha = layer.opacity || 1;
				context.drawImage(layer.canvas, 0, 0, width, height);
				context.restore();
			}
			else {
				context.drawImage(layer.canvas, 0, 0, width, height);
			}
		});
	};

	BaseFilter.prototype.displayPreview = function() {
		this.tmpCanvas.setStyle('display', 'inline');
	};

	BaseFilter.prototype.getTempCanvas = function() {
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
	};

	BaseFilter.prototype.getName = function() {
		return this.name
	};

	BaseFilter.prototype.hasPreview = function() {
		return this.tmpCanvas != null;
	};

	BaseFilter.prototype.getInfo = function() {
		return '';
	};

	BaseFilter.prototype.initInfo = function() {
	};

	BaseFilter.prototype.removeInfo = function() {
	};

	return BaseFilter;
});
