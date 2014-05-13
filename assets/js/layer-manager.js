define(['events', 'layer', 'tools'], function(Events, Layer, Toolbar) {
	var layerLimit = 10;

	function LayerManager() {
		this.layers = [];
		this.activeLayer = null;
		this.draggableLayers = null;
		this.opacitySlider = null;
		this.init();
	}

	LayerManager.height = 0;
	LayerManager.width = 0;

	var LayerManagerPrototype = LayerManager.prototype;

	LayerManagerPrototype.addLayer = function(name) {
		$('layer-new').disabled = false;

		if(layerLimit != 0) {
			if (this.layers.length == layerLimit - 1) {
				$('layer-new').disabled = true;
			}
			if(this.layers.length == layerLimit) {
				return;
			}
		}

		var layer = new Layer(name, this);
		layer.init();

		if(this.activeLayer != null) {
			this.activeLayer.deactivate();
		}

		this.layers.push(layer);
		this.draggableLayers.addItems(layer.menu);
		this.setActiveLayer(layer);

		return layer;
	};

	LayerManagerPrototype.getLayers = function() {
		return this.layers;
	};

	LayerManagerPrototype.getActiveLayer = function() {
		return this.activeLayer;
	};

	LayerManagerPrototype.setActiveLayer = function(layer) {
		if(this.activeLayer == layer) return;
		if(this.activeLayer != null) this.activeLayer.deactivate();

		layer.activate();
		this.activeLayer = layer;
		this.opacitySlider.set(this.activeLayer.opacity * 100);

		Events.trigger(Events.CANVAS_CHANGED);
	};

	LayerManagerPrototype.removeLayer = function(layer) {
		if(this.layers.length == 1) return;

		this.draggableLayers.removeItems(layer.menu);
		$('layer-new').disabled = false;

		for (var i = 0, l = this.layers.length; i < l; ++i) {
			if(this.layers[i] == layer) {
				layer.remove();
				this.layers.splice(i, 1);
				break;
			}
		}

		if(this.activeLayer == layer || this.layers.length == 1) {
			this.setActiveLayer($$('#layers-container li')[0].retrieve('ref'));
		}

		delete layer;
		Events.trigger(Events.SAVE_STATE);
	};

	LayerManagerPrototype.init = function() {
		var self = this;
		$('layer-new').addEvent('click', function() {
			var layer = self.addLayer('Layer ' + (self.layers.length + 1));
			Events.trigger(Events.SAVE_STATE);
		});

		$('layer-delete').addEvent('click', function() {
			self.removeLayer(self.getActiveLayer());
		});

		this.draggableLayers = new Sortables('#layers-container', {
			clone:true,
			onSort: function() {
				// Re-order canvas's.
				var container = $('canvas-container');
				var ref, canvas;
				container.getChildren('canvas').destroy();

				$$('#layers-container li').reverse().each(function(el) {
					ref = el.retrieve('ref');

					if(ref != null) {
						canvas = ref.canvas;

						canvas.setStyles({
							width: ref.width,
							height: ref.height
						});

						container.adopt(canvas);
					}
				});
			}
		});

		this.opacitySlider = new Slider($('layer-opacity'), $('layer-opacity').getElement('.knob'), {
			range: [1, 100],
			onChange: function(step) {
				var layer = self.getActiveLayer();
				if(layer != null) {
					layer.canvas.setOpacity(step / 100);
					layer.opacity = step / 100;

					Toolbar.getInstance().refreshTool();
				}
			}
		});
	};

	LayerManagerPrototype.clear = function() {
		for (var i = 0, l = this.layers.length; i < l; ++i) {
			this.layers[i].remove();
		}

		this.layers = [];
		this.activeLayer = null;
	};

	LayerManagerPrototype.resize = function(width, height) {
		LayerManager.width = width;
		LayerManager.height = height;
	};

	LayerManagerPrototype.flatten = function(width, height, type) {
		if(type == undefined) {
			type = 'png';
		}

		var w = parseInt(this.activeLayer.width);
		var h = parseInt(this.activeLayer.height);
		var ratio = w / h;

		if(ratio == 1) {
			if(width > w) {
				width = w;
				height = h;
			}
		}
		else if(ratio > 1) {
			width = width > w ? w : width;
			height = width / ratio;
		}
		else {
			height = height > h ? h : height;
			width = height * ratio;
		}

		var canvas = new Element('canvas', {
			width: width,
			height: height
		});
		var context = canvas.getContext('2d');
		var layer;

		if(type != 'png') {
			context.fillStyle = "#fff";
			context.fillRect(0, 0, width, height);
		}

		$$('#layers-container li').reverse().each(function(el) {
			layer = el.retrieve('ref');

			context.save();
			context.globalAlpha = layer.opacity || 1;
			context.drawImage(layer.canvas, 0, 0, width, height);
			context.restore();
		});

		return canvas.toDataURL('image/' + type);
	};

	LayerManagerPrototype.layerHiddenWarning = function(layer) {
		alert('You cannot edit a hidden layer');
	};

	LayerManagerPrototype.getOpacitySlider = function() {
		return this.opacitySlider;
	};

	LayerManagerPrototype.getLayerLimit = function() {
		return layerLimit;
	};

	return new LayerManager();
});
