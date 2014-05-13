define(['events', 'layer-manager'], function(Events, LayerManager) {

	function Tool() {
		this.canvas = null;
		this.context = null;
		this.layer = null;
		this.name = '';
	}

	var ToolPrototype = Tool.prototype;

	ToolPrototype.init = function() {
		this.canvasChanged();
		Events.on(Events.CANVAS_CHANGED, this.canvasChanged.bind(this));
	};

	ToolPrototype.activate = function() {
	};

	ToolPrototype.deactivate = function() {
		$('canvas-container').removeEvents();
	};

	ToolPrototype.canvasChanged = function() {
		this.layer = LayerManager.getActiveLayer();
		this.canvas = this.layer.canvas;
		this.context = this.canvas.getContext('2d');
	};

	ToolPrototype.getToolInfo = function() {
		return '';
	};

	ToolPrototype.getName = function() {
		return this.name;
	};

	ToolPrototype.mousemove = function(e) {
	};

	ToolPrototype.mouseleave = function(e) {
	};

	ToolPrototype.initToolInfo = function() {
	};

	ToolPrototype.removeToolInfo = function() {
	};

	ToolPrototype.refresh = function() {
	};

	ToolPrototype.pickerChanged = function(colour) {
		this.fillRGB = colour.rgb;
	};

	return Tool;
});
