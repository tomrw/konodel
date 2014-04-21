var ToolCrop = (function() {
	
	return new Class({

		Extends: Tool,

		crop:null,
		timer:null,
		timer_ref:null,
		name:'Crop',

		left:0,
		top:0,
		width:0,
		height:0,

		initialize: function() {
			// this.parent();

			// $('canvas-container').setStyle('cursor', 'default');

			this.crop = new Cropper('canvas-container', {
				maskOpacity: false,
				mini: {
					x:10,
					y:10
				},
				start: {
					x:200,
					y:50
				},
				doubleClik: false,
				onComplete: this.crop.bind(this)
			});

			this.parent();
		},

		activate: function() {
			$('canvas-container').setStyle('cursor', 'default');
			MousePointer.getInstance().hide();

			this.crop.resize();
			this.crop.autoSize();
			this.crop.show();

			this.timer_ref = this.resize.bind(this);
			this.map_ref = this.mapDragged.bind(this);
			window.addEvent('resize', this.timer_ref);
			window.addEvent('mapDrag', this.map_ref);
		},

		deactivate: function() {
			$('canvas-container').setStyle('cursor', 'none');
			this.crop.hide();

			resizeLayout();

			window.removeEvent('resize', this.timer_ref);
			window.removeEvent('mapDrag', this.map_ref);
		},

		refresh: function() {
			this.crop.resize();
			this.crop.autoSize();
			this.crop.show();
		},

		mapDragged: function() {
			var coords = $$('.cropperResize')[0].getCoordinates($$('#canvas-container canvas.canvas')[0]);

			this.left = coords.left;
			this.top = coords.top;
			this.width = coords.width - 2;
			this.height = coords.height - 2;
		},

		mousemove: function(e) {
			MousePointer.getInstance().hide();
		},

		crop: function(top, left, width, height) {

			var canvasOffset = $$('#canvas-container canvas.canvas')[0];
			var manager = LayerManager.getInstance();

			this.top = top - canvasOffset.getStyle('top').toInt();
			this.left = left - canvasOffset.getStyle('left').toInt();
			this.width = width - 2;
			this.height = height - 2;

			if(this.width > manager.width) this.width = manager.width;
			if(this.height > manager.height) this.height = manager.height;
		},

		resize: function() {
			this.crop.resize();
			this.crop.autoSize();
		},

		getToolInfo: function() {
			return '<button id="btnCrop" class="btn">Crop</button>';
		},

		initToolInfo: function() {
			$('btnCrop').addEvent('click', function() {

				var manager = LayerManager.getInstance();

				if(this.layer.isHidden()) {
					manager.layerHiddenWarning(this.layer);
					return;
				}

				if(this.width == manager.width && this.height == manager.height) return;

				var layers = LayerManager.getInstance().getLayers();
				
				layers.each(function(layer) {

					var canvas = layer.get('canvas');
					var context = canvas.getContext('2d');
					var data = context.getImageData(this.left, this.top, this.width, this.height);

					canvas.width = this.width;
					canvas.height = this.height;

					layer.set('width', this.width);
					layer.set('height', this.height);

					context.putImageData(data, 0, 0);

					canvas.setStyles({
						top:0,
						left:0
					});

				}.bind(this));

				resizeLayout(this.width, this.height);
				this.crop.setSize(Math.max(this.width / 4 * 3, 10), Math.max(this.height / 4 * 3, 10));

				UndoManager.getInstance().saveState();

			}.bind(this));
		}
	});
})();

var ToolRotate = (function() {

	var rotate;
	var currentAngle = 0;
	var tmpCanvas;

	return new Class({

		Extends: Tool,

		name:'Rotate',

		initialize: function() {
			// tmpCanvas = new Element('canvas', { styles: {position:'absolute', top:100, left:100, 'background-color':'orange'}});
			tmpCanvas = new Element('canvas');
			this.parent();
		},

		activate: function() {

		},

		getToolInfo: function() {
			return '<button id="btnLeft" class="btn">Left 90</button><button id="btnRight" class="btn">Right 90</button><button id="btn180" class="btn">180</button><button id="btnFlipVertical" class="btn">Flip Vertical</button><button id="btnFlipHorizontal" class="btn">Flip Horizontal</button>';
		},

		initToolInfo: function() {

			$('btnLeft').addEvent('click', function() {
				this.rotate(-90);
			}.bind(this));

			$('btnRight').addEvent('click', function() {
				this.rotate(90);
			}.bind(this));

			$('btn180').addEvent('click', function() {
				this.rotate(90);
				this.rotate(90);
			}.bind(this));

			$('btnFlipHorizontal').addEvent('click', function() {
				this.flip(false);
			}.bind(this));

			$('btnFlipVertical').addEvent('click', function() {
				this.flip(true);
			}.bind(this));
		},

		rotate: function(angle) {

			if(this.layer.isHidden()) {
				LayerManager.getInstance().layerHiddenWarning(this.layer);
				return;
			}

			if(angle != 90 && angle != -90 && angle != 180) return;

			var manager = LayerManager.getInstance();
			var width = manager.width;
			var height = manager.height;
			var ref;

			$$('#layers-container li').each(function(el) {
				ref = el.retrieve('ref');

				var canvas = ref.get('canvas');
				var context = canvas.getContext('2d');
				var context_temp = tmpCanvas.getContext('2d');
				var w = ref.get('width');
				var h = ref.get('height');
				
				tmpCanvas.width = h;
				tmpCanvas.height = w;
				
				context_temp.save();
				context_temp.translate(h/2, w/2);
				context_temp.rotate(angle * (Math.PI / 180));
				context_temp.translate(-w/2, -h/2);
				context_temp.drawImage(canvas, 0, 0);
				context_temp.restore();

				canvas.width = h;
				canvas.height = w;

				ref.set('width', h);
				ref.set('height', w);
				
				context.drawImage(tmpCanvas, 0, 0);

				canvas.setStyles({
					top:0,
					left:0
				});

			}.bind(this));

			manager.width = height;
			manager.height = width;

			resizeLayout(height, width);
			Map.getInstance().resize();

			UndoManager.getInstance().saveState();
		},

		flip: function(vertical) {

			$$('#layers-container li').each(function(el) {
				ref = el.retrieve('ref');

				var canvas = ref.get('canvas');
				var context = canvas.getContext('2d');
				var context_temp = tmpCanvas.getContext('2d');
				var w = ref.get('width');
				var h = ref.get('height');
				
				tmpCanvas.width = w;
				tmpCanvas.height = h;

				context_temp.save();
				
				if(vertical) {
					context_temp.scale(1, -1);
					// context_temp.drawImage(canvas, 0, 0, w, -h);
					context_temp.drawImage(canvas, 0, -h);
				}
				else {
					context_temp.scale(-1, 1);
					// context_temp.drawImage(canvas, 0, 0, -w, h);
					context_temp.drawImage(canvas, -w, 0);
				}
				
				context_temp.restore();

				context.clearRect(0, 0, w, h);
				context.drawImage(tmpCanvas, 0, 0);
			});

			Map.getInstance().draw();
			UndoManager.getInstance().saveState();	
		}
	});
})();

var ToolResize = (function() {

	return new Class({

		Extends: Tool,

		name:'Resize',

		getToolInfo: function() {
			var manager = LayerManager.getInstance();
			return 'Width: <input type="text" id="txtCanvasWidth" value="' + manager.width + '"><br />Height: <input type="text" id="txtCanvasHeight" value="' + manager.height + '"><br />Scale Image: <input type="checkbox" id="scale-image" /><br /><button id="btnCanvasResize" class="btn">Resize</button>';
		},

		initToolInfo: function() {

			$('txtCanvasWidth').focus();

			$('btnCanvasResize').addEvent('click', function() {

				if(this.layer.isHidden()) {
					LayerManager.getInstance().layerHiddenWarning(this.layer);
					return;
				}

				var width = $('txtCanvasWidth').get('value').toInt() || 0;
				var height = $('txtCanvasHeight').get('value').toInt() || 0;
				var manager = LayerManager.getInstance();
				var scale = $('scale-image').get('checked');
				var resize = true;
				var currentWidth = manager.width;
				var currentHeight = manager.height;

				if(width <= 0 || height <= 0) return;
				if(width == currentWidth && height == currentHeight) return;

				if(width < currentWidth || height < currentHeight) {
					if(!scale && !confirm('By resizing the canvas down, data may be lost. Continue?')) {
						resize = false;
					}
				}

				if(resize) {
					resizeLayout(width, height);
					var loaded = true;
					
					if(!scale) {
						resizeCanvas(width, height);
					}
					else {

						var ratio = currentWidth / currentHeight;

						// if(manager.width > manager.height) {
						if(currentWidth > currentHeight) {
							var imageWidth = width > MAX_WIDTH ? MAX_WIDTH : width;
							var imageHeight = imageWidth / ratio;

							if(imageHeight > height) {
								imageHeight = height;
								imageWidth = height * ratio;
							}
						}
						else {
							var imageHeight = height > MAX_HEIGHT ? MAX_HEIGHT : height;
							var imageWidth = imageHeight * ratio;
						}

						var loaded = false;

						manager.getLayers().each(function(layer) {
							var canvas = layer.get('canvas');
							var context = canvas.getContext('2d');
							
							var img = new Image();
							img.width = imageWidth;
							img.height = imageHeight;
							img.src = canvas.toDataURL();

							loaded = false;

							img.onload = function() {

								canvas.width = width > MAX_WIDTH ? MAX_WIDTH : width;
								canvas.height = height > MAX_HEIGHT ? MAX_HEIGHT : height;
								layer.set('width', canvas.width);
								layer.set('height', canvas.height);

								context.clearRect(0, 0, manager.width, manager.height);
								context.drawImage(img, 0, 0, imageWidth, imageHeight);

								loaded = true;
							};

						});
					}

					// this was moved up a level
					$('txtCanvasWidth').set('value', manager.width);
					$('txtCanvasHeight').set('value', manager.height);

					var interval = setInterval(function() {
						if(loaded) {
							UndoManager.getInstance().saveState();
							clearInterval(interval);
						}	
					}, 100);
				}

				

			}.bind(this));
		},

		refresh: function() {
			var manager = LayerManager.getInstance();
			$('txtCanvasWidth').set('value', manager.width);
			$('txtCanvasHeight').set('value', manager.height);
		},

		removeToolInfo: function() {

		}
	});
})();

var ToolSelect = (function() {

	return new Class({

		Extends: Tool,

		startX:0,
		startY:0,
		endX:0,
		endY:0,
		clicked:false,
		name:'Select',

		view:null,
		entered:false,
		data:null,
		drag:null,

		tmpCanvas:null,
		
		initialize: function() {
			this.parent();

			var self = this;

			this.view = new Element('div', { 
				id: 'selectArea',
				events: {
					mouseenter: function() {
						this.entered = true;
					}.bind(this),

					mouseleave: function() {
						this.entered = false;
					}.bind(this)
				}
			});

			this.tmpCanvas = new Element('canvas', { styles: { top:0, left:0, position:'absolute', display:'none' }}).setOpacity(0.8);

			this.drag = new Drag.Move(this.view, {
				container: $('canvas-container'),
				onStart: function() {

					var coords = this.view.getCoordinates($$('#canvas-container canvas.canvas')[0]);

					this.data = this.context.getImageData(coords.left, coords.top, coords.width, coords.height);					
					this.tmpCanvas.width = this.data.width;
					this.tmpCanvas.height = this.data.height;

					this.tmpCanvas.getContext('2d').putImageData(this.data, 0, 0);
					
					this.tmpCanvas.setStyles({
						display:'none'
					});

				}.bind(this),

				onDrag: function() {

					if(Math.abs(this.endX - this.startX) == 0) return;

					var pos = $('canvas-container').getPosition();

					this.tmpCanvas.setStyles({
						left: this.view.getStyle('left').toInt() + pos.x,
						top: this.view.getStyle('top').toInt() + pos.y,
						display: 'inline'
					})
				}.bind(this),

				onComplete: function(el) {

					if(!this.data) return;

					var coords = el.getCoordinates($$('#canvas-container canvas.canvas')[0]);

					var offset = $$('#canvas-container canvas.canvas')[0];
					var x = this.startX + offset.getStyle('left').toInt();
					var y = this.startY + offset.getStyle('top').toInt();
					var w = Math.abs(this.endX - this.startX);
					var h = Math.abs(this.endY - this.startY);

					this.context.fillStyle = "rgba(255,255,255,0.01)";
					this.context.clearRect(this.startX, this.startY, w, h);
					// this.context.fillRect(this.startX, this.startY, w, h);
					this.context.putImageData(this.data, coords.left, coords.top);

					this.startX = coords.left;
					this.startY = coords.top;
					this.endX = coords.left + coords.width;
					this.endY = coords.top + coords.height;

					this.data = this.context.getImageData(coords.left, coords.top, this.endX, this.endY);

					this.fixClear();
					this.tmpCanvas.setStyle('display', 'none');

					UndoManager.getInstance().saveState();

				}.bind(this)
			});

			$('canvas-container').adopt(this.view);
			$(document.body).adopt(this.tmpCanvas);
		},

		activate: function() {

			$('canvas-container').setStyle('cursor', 'default');
			MousePointer.getInstance().hide();

			this.parent();

			$('canvas-container').addEvents({
				mousedown: function(e) {

					if(this.layer.isHidden()) {

						this.view.setStyle('display', 'none');

						this.startX = this.startY = this.endX = this.endY = 0;
						this.clicked = this.entered = false;
						this.data = null;

						LayerManager.getInstance().layerHiddenWarning(this.layer);
						return;
					}

					if(!this.entered) {
						this.view.setStyle('display', 'none');
						this.startX = this.startY = this.endX = this.endY = 0;
						// this.clicked = false;
					}

					if(this.clicked || this.entered) return;

					var pos = this.canvas.getPosition();
					var offset = $$('#canvas-container canvas.canvas')[0];
					
					this.startX = e.page.x - pos.x;
					this.startY = e.page.y - pos.y;
					this.clicked = true;

				}.bind(this),

				mouseup: function() {
					this.clicked = false;

					if(this.endX < this.startX) {
						var tmp = this.endX;
						this.endX = this.startX;
						this.startX = tmp;
					}

					if(this.endY < this.startY) {
						var tmp = this.endY;
						this.endY = this.startY;
						this.startY = tmp;
					}

				}.bind(this)
			});

			this.timer_ref = this.resize.bind(this);
			this.del_ref = this.deleteSelection.bind(this);
			this.map_ref = this.mapDragged.bind(this);
			window.addEvent('resize', this.timer_ref);
			window.addEvent('keydown', this.del_ref);
			window.addEvent('mapDrag', this.map_ref);
		},

		deactivate: function() {
			this.parent();
			this.view.setStyle('display', 'none');

			this.startX = this.startY = this.endX = this.endY = 0;
			this.clicked = this.entered = false;
			this.data = null;

			$('canvas-container').setStyle('cursor', 'none');

			window.removeEvent('resize', this.timer_ref);
			window.removeEvent('keydown', this.del_ref);
			window.removeEvent('mapDrag', this.map_ref);
		},

		refresh: function() {

			var size = this.view.getSize();
			var container = $('canvas-container').getSize();

			if(size.x > container.x || size.y > container.y) this.resize();
		},

		mousemove: function(e) {

			MousePointer.getInstance().hide();

			if(!this.clicked) return;

			var pos = this.canvas.getPosition();
			var offset = $$('#canvas-container canvas.canvas')[0];

			this.endX = e.page.x - pos.x;
			this.endY = e.page.y - pos.y;

			var x = offset.getStyle('left').toInt();
			var y = offset.getStyle('top').toInt();

			this.view.setStyles({
				left: Math.min(this.startX, this.endX) + x,
				top: Math.min(this.startY, this.endY) + y,
				width: Math.abs(this.endX - this.startX),
				height: Math.abs(this.endY - this.startY),
				display: 'inline'
			});
		},

		getToolInfo: function() {
			return '';
		},

		resize: function() {

			if(this.view.getStyle('display') == 'none') return;
			
			var size = $('canvas-container').getSize();

			this.view.setStyles({
				left:size.x * 0.125,
				top:size.y * 0.125,
				width:size.x * 0.75,
				height:size.y * 0.75
			});

			this.startX = size.x * 0.125;
			this.startY = size.y * 0.125;
			this.endX = this.startX + (size.x * 0.75);
			this.endY = this.startY + (size.y * 0.75);
		},

		mapDragged: function() {

			if(this.view.getStyle('display') == 'none') return;

			var coords = this.view.getCoordinates($$('#canvas-container canvas.canvas')[0]);

			this.data = this.context.getImageData(coords.left, coords.top, coords.width, coords.height);
			this.tmpCanvas.width = this.data.width;
			this.tmpCanvas.height = this.data.height;

			this.tmpCanvas.getContext('2d').putImageData(this.data, 0, 0);

			this.tmpCanvas.setStyles({
				display:'none'
			});

			this.startX = coords.left;
			this.startY = coords.top;
			this.endX = coords.left + coords.width;
			this.endY = coords.top + coords.height;
		},

		deleteSelection: function(e) {

			if(this.layer.isHidden()) {

				this.view.setStyle('display', 'none');

				this.startX = this.startY = this.endX = this.endY = 0;
				this.clicked = this.entered = false;
				this.data = null;

				LayerManager.getInstance().layerHiddenWarning(this.layer);
				return;
			}

			if(e.code == 46) {
				
				var coords = this.view.getCoordinates($$('#canvas-container canvas.canvas')[0]);

				if(!coords.width || !coords.height) return;

				this.context.fillStyle = "rgba(255,255,255,0.01)";
				this.context.clearRect(coords.left, coords.top, coords.width, coords.height);

				this.fixClear();

				UndoManager.getInstance().saveState();

				this.view.setStyle('display', 'none');
				this.startX = this.startY = this.endX = this.endY = 0;
				this.clicked = this.entered = false;
				this.data = null;
			}
			else if(e.code == 65 && e.control) {

				var size = $('canvas-container').getSize();

				this.view.setStyles({
					left:0,
					top:0,
					width:size.x - 4,
					height:size.y - 4,
					display:'inline'
				});

				this.startX = 0;
				this.startY = 0;
				this.endX = size.x - 2;
				this.endY = size.y - 2;
			}
		},

		fixClear: function() {
			var layer = LayerManager.getInstance();
			var data = this.context.getImageData(0, 0, layer.width, layer.height);
			var it = layer.width * layer.height * 4;

			for(var i = 0; i < it; i += 4) {
				if(data.data[i + 3] == 0) {
					data.data[i] = 255;
					data.data[i + 1] = 255;
					data.data[i + 2] = 255;
					data.data[i + 3] = 1;
				}
			}

			this.context.putImageData(data, 0, 0);
		}
	});
})();