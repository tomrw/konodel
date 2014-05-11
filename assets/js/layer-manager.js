define(['events', 'layer', 'tools'], function(Events, Layer, Toolbar) {
	var layers = [];
	var activeLayer;
	var layerLimit = 10;

	var draggableLayers;
	var opacitySlider;

	// Canvas dimensions
	var height;
	var width;

	return (function() {
		var instance;

		return {
			getInstance: function() {
				if (!instance) {
					instance = true;
					this.init();
				}

				return this;
			},

			addLayer: function(name) {
				$('layer-new').disabled = false;

				if(layerLimit != 0 && layers.length == layerLimit - 1) {
					$('layer-new').disabled = true;
				}

				if(layerLimit != 0 && layers.length == layerLimit) return;

				var layer = new Layer(name, this);
				layer.init();

				if(activeLayer != null) {
					activeLayer.deactivate();
				}

				layers.push(layer);

				draggableLayers.addItems(layer.menu);
				this.setActiveLayer(layer);

				return layer;
			},

			getLayers: function() {
				return layers;
			},

			getActiveLayer: function() {
				return activeLayer;
			},

			setActiveLayer: function(layer) {

				if(activeLayer == layer) return;
				if(activeLayer != null) activeLayer.deactivate();

				layer.activate();
				activeLayer = layer;

				opacitySlider.set(activeLayer.opacity * 100);

				Events.trigger(Events.CANVAS_CHANGED);
			},

			removeLayer: function(layer) {
				if(layers.length == 1) return;

				draggableLayers.removeItems(layer.menu);
				$('layer-new').disabled = false;

				for(var i = 0; i < layers.length; ++i) {
					if(layers[i] == layer) {
						layer.remove();
						layers.splice(i, 1);
						break;
					}
				}

				if(activeLayer == layer || layers.length == 1) {
					this.setActiveLayer($$('#layers-container li')[0].retrieve('ref'));
				}

				delete layer;
				Events.trigger(Events.SAVE_STATE);
			},

			init: function() {
				$('layer-new').addEvent('click', function() {
					var layer = this.addLayer('Layer ' + (layers.length + 1));
					Events.trigger(Events.SAVE_STATE);
				}.bind(this));

				$('layer-delete').addEvent('click', function() {
					this.removeLayer(this.getActiveLayer());
				}.bind(this));

				draggableLayers = new Sortables('#layers-container', {
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

				opacitySlider = new Slider($('layer-opacity'), $('layer-opacity').getElement('.knob'), {
					range: [1, 100],
					onChange: function(step) {

						var layer = this.getActiveLayer();

						if(layer != null) {
							layer.canvas.setOpacity(step / 100);
							layer.opacity = step / 100;

							Toolbar.getInstance().refreshTool();
						}

					}.bind(this)
				});
			},

			clear: function() {
				for(var i = 0; i < layers.length; ++i) {
					layers[i].remove();
				}

				layers = [];
				activeLayer = null;
			},

			resize: function(w, h) {
				width = w;
				height = h;
			},

			flatten: function(width, height, type) {

				if(type == undefined) {
					type = 'png';
				}

				var w = parseInt(activeLayer.width);
				var h = parseInt(activeLayer.height);
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

				var canvas = new Element('canvas', {width:width, height:height});
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
			},

			layerHiddenWarning: function(layer) {
				alert('You cannot edit a hidden layer');
			},

			getOpacitySlider: function() {
				return opacitySlider;
			},

			getLayerLimit: function() {
				return layerLimit;
			}
		}
	})();
});
