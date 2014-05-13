define(['layer-manager', 'filter/base'], function(LayerManager, Filter) {

	function BrightnessFilter() {
		this.name = 'Brightness';
		this.percent = 0;
		this.timer = null;
		this.pixels = null;
		this.tmpCanvas = null;
	}

	BrightnessFilter.prototype = Object.create(Filter.prototype);
	BrightnessFilter.prototype.constructor = BrightnessFilter;

	BrightnessFilter.prototype.init = function() {
		Filter.prototype.init.call(this);
	};

	BrightnessFilter.prototype.run = function() {
		var self = this;
		this.getPixels().each(function(context) {
			self.runFilter(context);
		});

		this.drawPreview(this.getTempCanvas());
	};

	BrightnessFilter.prototype.getInfo = function() {
		return '<div id="brightness-slider" class="slider"><div class="knob"></div></div>';
	};

	BrightnessFilter.prototype.initInfo = function() {
		this.getTempCanvas();

		new Slider($('brightness-slider'), $('brightness-slider').getElement('.knob'), {
			initialStep: this.percent,
			range: [-100, 100],
			onChange: function(step) {
				this.percent = step;

				clearInterval(this.timer);

				this.timer = setTimeout(function() {

					var canvas = this.getTempCanvas();

					this.drawPreview(canvas);
					this.runFilter(canvas.getContext('2d'));
					this.displayPreview();

				}.bind(this), 50)
			}.bind(this)
		});
	};

	BrightnessFilter.prototype.removeInfo = function() {
		this.getTempCanvas().destroy();
		this.tmpCanvas = null;
	};

	BrightnessFilter.prototype.runFilter = function(context) {
		var pixels, index, colour, r, g, b;
		var percent = this.percent;

		pixels = context.getImageData(0, 0, LayerManager.width, LayerManager.height);

		for(var i = 0, l = pixels.data.length; i < l; i += 4) {
			r = (pixels.data[i]) + 0;
			g = (pixels.data[i + 1]) + 0;
			b = (pixels.data[i + 2]) + 0;

			r = r + ((r / 100) * percent);
			g = g + ((g / 100) * percent);
			b = b + ((b / 100) * percent);

			if(r > 255) r = 255;
			if(r < 0) r = 0;
			if(g > 255) g = 255;
			if(g < 0) g = 0;
			if(b > 255) b = 255;
			if(b < 0) b = 0;

			pixels.data[i] = r;
			pixels.data[i + 1] = g;
			pixels.data[i + 2] = b;
		}

		context.putImageData(pixels, 0, 0);
	};

	return BrightnessFilter;
});
