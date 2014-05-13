define(['layer-manager','filter/base'], function(LayerManager, Filter) {

	function SharpenFilter() {
		this.name = 'Sharpen';
		this.sharpenSize = 3;
		this.timer = null;
		this.tmpCanvas = null;
	}

	SharpenFilter.prototype = Object.create(Filter.prototype);
	SharpenFilter.prototype.constructor = SharpenFilter;

	SharpenFilter.prototype.init = function() {
		Filter.prototype.init.call(this);
	};

	SharpenFilter.prototype.run = function() {
		var self = this;
		this.getPixels().each(function(context) {
			self.runFilter(context);
		});
	};

	SharpenFilter.prototype.runFilter = function(context) {
		var weights = [0, -1/10, 0,
			-1/10, 14/10, -1/10,
			0, -1/10, 0 ];

		var searchArea = 3;
		var halfSearch = Math.floor(searchArea / 2);
		var height = LayerManager.height;
		var width = LayerManager.width;

		var pixels = context.getImageData(0, 0, width, height);
		var tmpCanvas = new Element('canvas', { width: width, height: height });
		var output = tmpCanvas.getContext('2d').createImageData(width, height);
		var offset, r, g, b, a, i, j, xLocation, yLocation, pixelOffset;

		for(var y = 0; y < height; ++y) {
			for(var x = 0; x < width; ++x) {

				offset = (y * width + x) * 4;
				r = g = b = a = 0;

				for(j = 0; j < searchArea; ++j) {
					for(i = 0; i < searchArea; ++i) {

						xLocation = x + i - halfSearch;
						yLocation = y + j - halfSearch;

						if(xLocation >= 0 && xLocation < width && yLocation >= 0 && yLocation < height) {
							pixelOffset = (yLocation * width + xLocation) * 4;

							weight = weights[j * searchArea + i];

							r += pixels.data[pixelOffset] * weight;
							g += pixels.data[pixelOffset + 1] * weight;
							b += pixels.data[pixelOffset + 2] * weight;
							a += pixels.data[pixelOffset + 3] * weight;
						}
					}
				}

				output.data[offset] = r;
				output.data[offset + 1] = g;
				output.data[offset + 2] = b;
				output.data[offset + 3] = a + (255 - a);
			}
		}

		context.putImageData(output, 0, 0);
	};

	SharpenFilter.prototype.getInfo = function() {
		return '';
	};

	return SharpenFilter;
});
