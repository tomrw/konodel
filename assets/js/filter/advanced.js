var FilterBlur = new Class({

	Extends: Filter,

	name: 'Blur',
	blurSize: 3,
	timer: null,
	useOpacity:false,
	// tmpCanvas: null,

	run: function() {

		this.getPixels().each(function(context) {
			this.runFilter(context);
		}.bind(this));

		this.drawPreview(this.getTempCanvas(), false);
	},

	runFilter: function(context) {

		if(this.working) return;

		this.working = true;

		var weight = 1/9;
		var searchArea = this.blurSize;
		var halfSearch = Math.floor(searchArea / 2);

		var height = this.manager.height;
		var width = this.manager.width;

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
	},

	getInfo: function() {
		// return '';
		return 'Size: <div id="blur-slider" class="slider"><div class="knob"></div></div>';
	},

	initInfo: function() {

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
	},

	removeInfo: function() {
		this.getTempCanvas().destroy();
		this.tmpCanvas = null;
	}
});

var FilterSharpen = new Class({

	Extends: Filter,

	name: 'Sharpen',
	sharpenSize: 3,
	timer: null,
	tmpCanvas: null,

	run: function() {

		this.getPixels().each(function(context) {
			this.runFilter(context);
		}.bind(this));

		// this.drawPreview(this.tmpCanvas);
	},

	runFilter: function(context) {

		var weights = [0, -1/10,  0,
			-1/10,  14/10, -1/10,
			0, -1/10,  0 ];

		var searchArea = 3;
		var halfSearch = Math.floor(searchArea / 2);

		var height = this.manager.height;
		var width = this.manager.width;

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
	},

	getInfo: function() {
		return '';
		// return 'Size: <div id="sharpen-slider" class="slider"><div class="knob"></div></div>';
	}

	/*initInfo: function() {

		this.createTempCanvas();
		
		new Slider($('sharpen-slider'), $('sharpen-slider').getElement('.knob'), {
			initialStep: this.sharpenSize,
			range: [3, 10],
			onChange: function(step) {
				return;

				this.sharpenSize = step;

				clearInterval(this.timer);

				this.timer = setTimeout(function() {

					this.drawPreview(this.tmpCanvas);
					this.runFilter(this.tmpCanvas.getContext('2d'));
					this.displayPreview();

				}.bind(this), 50)
			}.bind(this)
		});
	},*/

	/*removeInfo: function() {
		this.tmpCanvas.destroy();
		this.tmpCanvas = null;
	}*/
});