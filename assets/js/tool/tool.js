define(['layer-manager'], function(LayerManager) {

	return new Class({
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
			this.canvas = this.layer.canvas;
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
});