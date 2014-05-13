define(['layer-manager','filter/base'], function(LayerManager, Filter) {

	function BlurFilter() {
		this.name = 'Blur';
		this.blurSize = 3;
		this.timer = null;
		this.useOpacity = false;
	}

	BlurFilter.prototype = Object.create(Filter.prototype);
	BlurFilter.prototype.constructor = BlurFilter;

	BlurFilter.prototype.init = function() {
		Filter.prototype.init.call(this);
	};

	BlurFilter.prototype.run = function() {
		var self = this;
		this.getPixels().each(function(context) {
			self.runFilter(context);
		});

		this.drawPreview(this.getTempCanvas(), false);
	};

	BlurFilter.prototype.runFilter = function(context) {
		if(this.working) return;
		this.working = true;

		var weight = 1/9;
		var searchArea = this.blurSize;
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
		this.working = false;
	};

	BlurFilter.prototype.getInfo = function() {
		return 'Size: <div id="blur-slider" class="slider"><div class="knob"></div></div>';
	};

	BlurFilter.prototype.initInfo = function() {
		this.getTempCanvas();

		new Slider($('blur-slider'), $('blur-slider').getElement('.knob'), {
			initialStep: this.blurSize,
			range: [3, 10],
			onChange: function(step) {

				this.blurSize = step;

				if(this.working) return;

				clearInterval(this.timer);

				this.timer = setTimeout(function() {

					var canvas = this.getTempCanvas();

					this.drawPreview(canvas, this.useOpacity);
					this.runFilter(canvas.getContext('2d'));
					this.displayPreview();

				}.bind(this), 250)
			}.bind(this)
		});
	};

	BlurFilter.prototype.removeInfo = function() {
		this.getTempCanvas().destroy();
		this.tmpCanvas = null;
	};

	return BlurFilter;
});
