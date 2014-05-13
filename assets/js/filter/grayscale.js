define(['layer-manager', 'filter/base'], function(LayerManager, Filter) {

	function GrayscaleFilter() {
		this.name = 'Grayscale';
	}

	GrayscaleFilter.prototype = Object.create(Filter.prototype);
	GrayscaleFilter.prototype.constructor = GrayscaleFilter;

	GrayscaleFilter.prototype.init = function() {
		Filter.prototype.init.call(this);
	};

	GrayscaleFilter.prototype.run = function() {
		var pixels, index, colour;
		var width = LayerManager.width;
		var height = LayerManager.height;

		this.getPixels().each(function(context) {
			pixels = context.getImageData(0, 0, width, height);

			for (var i = 0, l = pixels.data.length; i < l; i += 4) {
				colour = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;

				pixels.data[i] = colour;
				pixels.data[i + 1] = colour;
				pixels.data[i + 2] = colour;
			}

			context.putImageData(pixels, 0, 0);
		});
	};

	return GrayscaleFilter;
});
