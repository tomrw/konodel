Class.Mutators.Static = function(items) {
	this.extend(items);
};

var Tool = new Class({

	canvas:null,
	context:null,
	layer:null,
	name:'',

	initialize: function() {
		this.canvasChanged();

		window.addEvent('canvasChanged', function() {
			this.canvasChanged();
		}.bind(this));
	},

	activate: function() {},

	deactivate: function() {
		$('canvas-container').removeEvents();
	},

	canvasChanged: function() {
		this.layer = LayerManager.getInstance().getActiveLayer();
		this.canvas = this.layer.get('canvas');
		this.context = this.canvas.getContext('2d');
	},

	getToolInfo: function() {
		return '';
	},

	getName: function() {
		return this.name;
	},

	mousemove: function(e) {},
	mouseleave: function(e) {},
	initToolInfo: function() {},
	removeToolInfo: function() {},
	refresh: function() {},

	pickerChanged: function(colour) {
		this.fillRGB = colour.rgb;
	}
});

function initGlobal() {

	new MooRainbow('colour-picker', {
		onChange: function(colour) { 
			$$('.colour-preview').setStyle('background-color', colour.hex);
			window.fireEvent('pickerChanged', colour);
		},
		onComplete: function(colour) {
			$$('.colour-preview').setStyle('background-color', colour.hex);
			window.fireEvent('pickerChanged', colour);
		}
	});
}

function resize(width, height, maxWidth, maxHeight) {
	var ratio = width / height;

	if(ratio == 1) {

		if(width > maxWidth) {
			w = maxWidth;
			h = maxHeight;
		}
		else {
			w = width;
			h = height;
		}
	}
	else if(ratio > 1) {
		w = width > maxWidth ? maxWidth : width;
		h = w / ratio;

		if(h > maxHeight) {
			h = maxHeight;
			w = h * ratio;
		}
	}
	else {
		h = height > maxHeight ? maxHeight : height;
		w = h * ratio;

		if(w > maxWidth) {
			w = maxWidth;
			h = w / ratio;
		}
	}

	return { width: w, height: h };
}