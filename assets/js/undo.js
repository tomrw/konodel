define(['events', 'layer-manager', 'layout', 'tools'],
	function(Events, LayerManager, Layout, Toolbar) {

	var queue = [];
	var index = 0;
	var maxLength = 15;
	var layer;
	var Persistance;

	require(['persistence'], function(persistence) {
		Persistance = persistence;
	});

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

			init: function() {

				$('btnUndo').addEvent('click', function(e) {
					this.undo();
					e.stop();
				}.bind(this));

				$('btnRedo').addEvent('click', function(e) {
					this.redo();
					e.stop();
				}.bind(this));

				this.layer = LayerManager.getInstance();

				Events.on(Events.SAVE_STATE, this.saveState.bind(this));
				Events.on(Events.UNDO, this.undo.bind(this));
				Events.on(Events.REDO, this.redo.bind(this));
				Events.on(Events.RESET_UNDO, this.reset.bind(this));
			},

			saveState: function(callback) {

				var currentImage = Persistance.getInstance().getCurrentImage();

				var queueData = {
					width: this.layer.width,
					height: this.layer.height,
					layers: [],
					callback: false,
					currentImage: {
						id: currentImage.id,
						name: currentImage.name,
						desc: currentImage.desc,
						publish: currentImage.publish
					}
				};

				var layers = [];
				var ref;

				$$('#layers-container li').reverse().each(function(el) {
					ref = el.retrieve('ref');

					var layer = {
						name: ref.name,
						opacity: ref.opacity,
						data: this.cloneCanvas(ref.canvas)
					};

					queueData.layers.push(layer);
				}.bind(this));

				if(this.sameState(layers)) return;

				if(index == queue.length) {
					index++;
					queue.push(queueData);
				}
				else {
					for(var i = index + 1; i < queue.length - index; ++i) {

						queue[i].layers.each(function(item) {
							delete item;
						});

						queue[i] = null;
					}

					queue.splice(index + 1, queue.length - index);
					queue.push(queueData);

					index = queue.length;
				}

				if(queue.length > maxLength + 1) {
					queue.splice(0, 1);
					index--;
				}
			},

			undo: function() {
				if(!index) return;

				if(queue[index] == undefined && index > 1) {
					index--;
				}

				this.draw(index - 1);
				index--;

				Toolbar.getInstance().refreshTool();
			},

			redo: function() {

				if(index >= queue.length - 1) return;

				index++;

				this.draw(index);
				Toolbar.getInstance().refreshTool();
			},

			getList: function() {
				return queue;
			},

			reset: function() {
				index = 0;
				queue = [];
			},

			getIndex: function() {
				return index;
			},

			cloneCanvas: function(canvas) {

				var newCanvas = new Element('canvas');
				var context = newCanvas.getContext('2d');

				newCanvas.width = canvas.width;
				newCanvas.height = canvas.height;

				context.drawImage(canvas, 0, 0);

				return newCanvas;
			},

			sameState: function(state) {
				var same = true;
				var currentState = queue[index - 1];

				if(currentState == undefined || currentState.length != state.length) return false;

				state.each(function(layer, index) {
					if(currentState[index].data.toDataURL() != layer.data.toDataURL()) {
						same = false;
					}
				});

				return same;
			},

			draw: function(index) {

				var data = queue[index];

				this.layer.clear();

				Layout.resizeLayout(data.width, data.height);

				data.layers.each(function(item) {
					var newLayer = this.layer.addLayer(item.name);
					newLayer.opacity = item.opacity;

					newLayer.canvas.getContext('2d').drawImage(item.data, 0, 0);

				}.bind(this));

				var opacity = this.layer.getActiveLayer().opacity * 100;
				this.layer.getOpacitySlider().set(opacity);

				var currentImage = data.currentImage;
				Persistance.getInstance().setCurrentImage(currentImage.id, currentImage.name, currentImage.desc, currentImage.publish);
			}
		}
	})();
});
