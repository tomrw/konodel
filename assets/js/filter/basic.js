var Filter = new Class({

	name:'',
	manager:null,
	working:false,

	initialize: function() {
		this.manager = LayerManager.getInstance();
	},

	getPixels: function() {
		var layers = this.manager.getLayers();
		var data = [];

		layers.each(function(layer) {
			data.push(layer.get('canvas').getContext('2d'));
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
				context.globalAlpha = layer.get('opacity') || 1;
				context.drawImage(layer.get('canvas'), 0, 0, this.manager.width, this.manager.height);
				context.restore();
			}
			else {
				context.drawImage(layer.get('canvas'), 0, 0, this.manager.width, this.manager.height);
			}
		}.bind(this));
	},

	displayPreview: function() {
		this.tmpCanvas.setStyle('display', 'inline');
	},

	/*createTempCanvas: function() {
		this.tmpCanvas = new Element('canvas', { id: 'tmp-canvas', styles: { display: 'none', position:'absolute', 'background-color':'#fff' }, width: this.manager.width, height: this.manager.height} );
		$('canvas-container').adopt(this.tmpCanvas);
	},*/

	getTempCanvas: function() {
		if(!this.tmpCanvas) {
			// var offset = $$('#canvas-container canvas.canvas')[0].getCoordinates();
			var offset = $('canvas-container').getCoordinates($$('#canvas-container canvas.canvas')[0]);
			// this.tmpCanvas = new Element('canvas', { id: 'tmp-canvas', styles: { display: 'none', position:'absolute', 'background-color':'#fff', 'z-index': 765 }, width: this.manager.width, height: this.manager.height} );
			this.tmpCanvas = new Element('canvas', { id: 'tmp-canvas', styles: { display: 'none', position:'absolute', 'background-color':'#fff', 'z-index': 765, top: -(offset.top + 1), left: -(offset.left + 1) }, width: this.manager.width, height: this.manager.height} );
			
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

	/*getTempCanvas: function() {
		return this.tmpCanvas;
	},*/

	getInfo: function() {
		return '';
	},

	initInfo: function() {},
	removeInfo: function() {}
});

var FilterGrayscale = new Class ({

	Extends: Filter,

	name:'Grayscale',

	run: function() {
		var pixels, i, index, colour;
		var width = this.manager.width;
		var height = this.manager.height;

		this.getPixels().each(function(context) {
			pixels = context.getImageData(0, 0, width, height);

			for(i = 0; i < (pixels.data.length); i += 4) {

				// colour = (pixels.data[i] * 0.2126) + (pixels.data[i + 1] * 0.7152) + (pixels.data[i + 2] * 0.0722);
				colour = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;

				pixels.data[i] = colour;
				pixels.data[i + 1] = colour;
				pixels.data[i + 2] = colour;
				// pixels.data[i + 3] = 255;
			}

			context.putImageData(pixels, 0, 0);
		});
	}
});

var FilterBrightness = new Class({

	Extends: Filter,

	name:'Brightness',
	percent:0,
	timer:null,
	pixels:null,
	tmpCanvas:null,

	run: function() {

		this.getPixels().each(function(context) {
			this.runFilter(context);
		}.bind(this));

		// this.drawPreview(this.tmpCanvas);
		this.drawPreview(this.getTempCanvas());
	},

	getInfo: function() {
		return '<div id="brightness-slider" class="slider"><div class="knob"></div></div>';
	},

	initInfo: function() {

		// this.createTempCanvas();
		this.getTempCanvas();
		
		new Slider($('brightness-slider'), $('brightness-slider').getElement('.knob'), {
			initialStep: this.percent,
			range: [-100, 100],
			onChange: function(step) {
				this.percent = step;

				clearInterval(this.timer);

				this.timer = setTimeout(function() {

					/*this.drawPreview(this.tmpCanvas);
					this.runFilter(this.tmpCanvas.getContext('2d'));
					this.displayPreview();*/

					var canvas = this.getTempCanvas();

					this.drawPreview(canvas);
					this.runFilter(canvas.getContext('2d'));
					this.displayPreview();

				}.bind(this), 50)
			}.bind(this)
		});
	},

	removeInfo: function() {
		/*this.tmpCanvas.destroy();
		this.tmpCanvas = null;*/

		this.getTempCanvas().destroy();
		this.tmpCanvas = null;
	},

	runFilter: function(context) {

		var pixels, i, index, colour, r, g, b;
		var percent = this.percent;

		pixels = context.getImageData(0, 0, this.manager.width, this.manager.height);

		for(i = 0; i < (pixels.data.length); i += 4) {

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
	}
});

var FilterThreshold = new Class({

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

		// this.drawPreview(this.tmpCanvas);
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

		// this.createTempCanvas();
		this.getTempCanvas();

		new Slider($('threshold-slider'), $('threshold-slider').getElement('.knob'), {
			initialStep:this.threshold,
			range: [0, 255],
			onChange: function(step) {
				this.threshold = step;

				clearInterval(this.timer);

				this.timer = setTimeout(function() {

					/*this.drawPreview(this.tmpCanvas);
					this.runFilter(this.tmpCanvas.getContext('2d'));
					this.displayPreview();*/

					var canvas = this.getTempCanvas();

					this.drawPreview(canvas);
					this.runFilter(canvas.getContext('2d'));
					this.displayPreview();

				}.bind(this), 50)
			}.bind(this)
		});
	},

	removeInfo: function() {
		/*this.tmpCanvas.destroy();
		this.tmpCanvas = null;*/

		this.getTempCanvas().destroy();
		this.tmpCanvas = null;
	}
});