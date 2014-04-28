define(['filter/base'], function(Filter) {

	return new Class({
		Extends: Filter,

		name:'Threshold',
		timer:null,
		threshold:128,
		pixels:null,
		tmpCanvas:null,

		run: function() {

			this.getPixels().each(function(context) {
				this.runFilter(context);
			}.bind(this));

			this.drawPreview(this.getTempCanvas());
		},

		runFilter: function(context) {

			var pixels, i, index, colour;
			var threshold = this.threshold;

			pixels = context.getImageData(0, 0, this.manager.width, this.manager.height);

			for(i = 0; i < (pixels.data.length); i += 4) {

				colour = ((pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3) >= threshold ? 255 : 0;

				pixels.data[i] = colour;
				pixels.data[i + 1] = colour;
				pixels.data[i + 2] = colour;
			}

			context.putImageData(pixels, 0, 0);
		},

		getInfo: function() {
			return '<div id="threshold-slider" class="slider"><div class="knob"></div></div>';
		},

		initInfo: function() {

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
		},

		removeInfo: function() {
			this.getTempCanvas().destroy();
			this.tmpCanvas = null;
		}
	});
});
