define(['layer-manager', 'filter/base'], function(LayerManager, Filter) {

	function ThresholdFilter() {
		this.name = 'Threshold';
		this.timer = null;
		this.threshold = 128;
		this.pixels = null;
		this.tmpCanvas = null;
	}

	ThresholdFilter.prototype = Object.create(Filter.prototype);
	ThresholdFilter.prototype.constructor = ThresholdFilter;

	ThresholdFilter.prototype.init = function() {
		Filter.prototype.init.call(this);
	};

	ThresholdFilter.prototype.run = function() {
		var self = this;
		this.getPixels().each(function(context) {
			self.runFilter(context);
		});

		this.drawPreview(this.getTempCanvas());
	};

	ThresholdFilter.prototype.runFilter = function(context) {
		var pixels, index, colour;
		var threshold = this.threshold;

		pixels = context.getImageData(0, 0, LayerManager.width, LayerManager.height);

		for(var i = 0, l = pixels.data.length; i < l; i += 4) {
			colour = ((pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3) >= threshold ? 255 : 0;

			pixels.data[i] = colour;
			pixels.data[i + 1] = colour;
			pixels.data[i + 2] = colour;
		}

		context.putImageData(pixels, 0, 0);
	};

	ThresholdFilter.prototype.getInfo = function() {
		return '<div id="threshold-slider" class="slider"><div class="knob"></div></div>';
	};

	ThresholdFilter.prototype.initInfo = function() {
		this.getTempCanvas();

		new Slider($('threshold-slider'), $('threshold-slider').getElement('.knob'), {
			initialStep:this.threshold,
			range: [0, 255],
			onChange: function(step) {
				this.threshold = step;

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

	ThresholdFilter.prototype.removeInfo = function() {
		this.getTempCanvas().destroy();
		this.tmpCanvas = null;
	};

	return ThresholdFilter;
});
