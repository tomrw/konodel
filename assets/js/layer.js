var LayerManager = (function() {
	var layers = [];
	var activeLayer;
	var layerLimit = 10;
	
	var draggableLayers;
	var scroll;
	var opacitySlider;

	// Canvas dimensions
	var height;
	var width;

	return new Class ({

		Static: {
			instance: null,
			getInstance: function() {
				if(this.instance == null) {
					this.instance = new LayerManager();
					this.instance.init();
				}

				return this.instance;
			}
		},

		addLayer: function(name) {
			$('layer-new').disabled = false;

			if(layerLimit != 0 && layers.length == layerLimit - 1) {
				$('layer-new').disabled = true;
			}

			if(layerLimit != 0 && layers.length == layerLimit) return;

			var layer = new Layer(name);

			if(activeLayer != null) {
				activeLayer.deactivate();
			}
			
			layers.push(layer);

			draggableLayers.addItems(layer.get('menu'));
			this.setActiveLayer(layer);
			this.update();

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

			opacitySlider.set(activeLayer.get('opacity') * 100);

			window.fireEvent('canvasChanged');
		},

		removeLayer: function(layer) {
			if(layers.length == 1) return;

			draggableLayers.removeItems(layer.get('menu'));
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
			this.update();

			UndoManager.getInstance().saveState();
		},

		init: function() {
			$('layer-new').addEvent('click', function() {
				var layer = this.addLayer('Layer ' + (layers.length + 1));
				// UndoManager.getInstance().addLayer(layer);
				UndoManager.getInstance().saveState();
			}.bind(this));

			$('layer-delete').addEvent('click', function() {
				this.removeLayer(this.getActiveLayer());
			}.bind(this));

			scroll = new ScrollBars('layer-scrollbar', {
				scrollBarSize:10,
				barOverContent:true,
				fade:false
			});

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
							canvas = ref.get('canvas');
							
							canvas.setStyles({
								width: ref.get('width'),
								height: ref.get('height')
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
						layer.get('canvas').setOpacity(step / 100);
						layer.set('opacity', step / 100);

						Toolbar.getInstance().refreshTool();
					}

				}.bind(this)
			});
		},

		update: function() {
			if(scroll != null) scroll.updateScrollBars();
		},

		clear: function() {
			for(var i = 0; i < layers.length; ++i) {
				layers[i].remove();
				// this.removeLayer(layers[i]);
			}

			layers = [];
			activeLayer = null;
			this.update();
		},

		resize: function(w, h) {
			width = w;
			height = h;
		},

		flatten: function(width, height, type) {

			if(type == undefined) {
				type = 'png';
			}

			var w = activeLayer.get('width').toInt();
			var h = activeLayer.get('height').toInt();
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
				context.globalAlpha = layer.get('opacity') || 1;
				context.drawImage(layer.get('canvas'), 0, 0, width, height);
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
	});	
})();

var Layer = (function() {

	var data = {};
	
	return new Class({

		initialize: function(name) {

			this.uid = String.uniqueID();
			data[this.uid] = {};
			
			var layerManager = LayerManager.getInstance();

			var canvas = new Element('canvas', {'class': 'canvas', width: layerManager.width, height: layerManager.height});
			var li = new Element('li');
			var li_text = new Element('div', { html: name, 'class': 'text' });
			// var li_hide = new Element('span', {text: 'hide', 'class': 'hide'});
			var li_hide = new Element('div', { 'class': 'hide layer-visible'});
			// var li_del = new Element('span', {text: 'x', 'class': 'delete'});
			var li_del = new Element('div', { 'class': 'delete'});
			var container = $('layers-container');

			canvas.width = layerManager.width;
			canvas.height = layerManager.height;

			$('canvas-container').adopt(canvas);
			li.adopt(li_text);
			li.adopt(li_del);
			li.adopt(li_hide);
			container.insertBefore(li, container.getFirst());

			this.clickRef = this.clickEvent.bind(this);
			this.delRef = this.deleteEvent.bind(this);
			this.hideRef = this.hide.bind(this);
			this.dblClickRef = this.dblClickEvent.bind(this);

			li_text.addEvent('click', this.clickRef);
			li_text.addEvent('dblclick', this.dblClickRef);
			li_del.addEvent('click', this.delRef);
			li_hide.addEvent('click', this.hideRef);
			li.store('ref', this);

			this.set('name', name);
			this.set('menu', li);
			this.set('canvas', canvas);
			this.set('data', '');
			this.set('width', layerManager.width);
			this.set('height', layerManager.height);
			this.set('hidden', false);
			this.set('opacity', 1.0);

			this.draw();
		},

		get: function(key) {
			return data[this.uid][key] || null;
		},

		set: function(key, value) {
			data[this.uid][key] = value;
		},

		activate: function() {
			this.get('menu').addClass('selected');
		},

		deactivate: function() {
			this.get('menu').removeClass('selected');
		},

		remove: function() {

			var manager = LayerManager.getInstance();

			this.get('menu').getChildren('div.hide')[0].removeEvent('click', this.hideRef);
			this.get('menu').getChildren('div.delete')[0].removeEvent('click', this.delRef);
			this.get('menu').getChildren('div.text')[0].removeEvent('dblclick', this.dblClickRef);
			this.get('menu').getChildren('div.text')[0].removeEvent('click', this.clickRef);
			// this.get('menu').removeEvent('click', this.clickRef);

			delete this.clickRef;
			delete this.delRef;
			delete this.hideRef;
			delete this.dblClickRef;

			this.get('canvas').getContext('2d').clearRect(0, 0, manager.width, manager.height);
			this.get('canvas').width = this.get('canvas').height = 1;

			this.get('menu').eliminate('ref');
			this.get('menu').destroy();
			this.get('canvas').destroy();
		},

		draw: function() {

			var context = this.get('canvas').getContext('2d');
			var layer = LayerManager.getInstance();
			
			context.fillStyle = "rgba(255,255,255,0.01)";
			context.fillRect(0, 0, layer.width, layer.height);
			// context.clearRect(0, 0, layer.width, layer.height);
		},

		hide: function() {

			if(!this.get('hidden')) {
				this.set('hidden', true);
				this.get('menu').getChildren('div.hide').addClass('layer-hidden').removeClass('layer-visible');
				this.get('canvas').setStyle('visibility', 'hidden');
			}
			else {
				this.set('hidden', false);
				this.get('menu').getChildren('div.hide').addClass('layer-visible').removeClass('layer-hidden');
				this.get('canvas').setStyle('visibility', null);
			}
		},

		isHidden: function() {
			return this.get('hidden');
		},

		clickEvent: function() {
			clearTimeout(this.clickTimer);

			this.clickTimer = setTimeout(function() {
				LayerManager.getInstance().setActiveLayer(this);
			}.bind(this), 100);
		},

		deleteEvent: function() {
			LayerManager.getInstance().removeLayer(this);
		},

		dblClickEvent: function() {
			clearTimeout(this.clickTimer);
			
			this.get('menu').getChildren('div.text')[0].set('html', '<input type="text" id="rename-layer" value="' + this.get('name') + '" maxlength="30" />');
			this.renameEventRef = this.renameEvent.bind(this);

			var rename = $('rename-layer');

			rename.focus();
			rename.addEvent('keydown', this.renameEventRef);
		},

		renameEvent: function(e) {

			var text = this.get('menu').getChildren('div.text')[0];
			var rename = $('rename-layer');

			if(e.code == 13) {
				this.set('name', rename.get('value'));
				text.set('text', this.get('name'));

				rename.removeEvent('keydown', this.renameEventRef);
				rename.destroy();

				UndoManager.getInstance().saveState();
			}
		}
	});
})();