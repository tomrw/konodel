define(['events', 'layer-manager', 'tool/tool'],
	function(Events, LayerManager, Tool) {

	function Select() {
		this.startX = 0;
		this.startY = 0;
		this.endX = 0;
		this.endY = 0;
		this.clicked = false;
		this.name = 'Select';
		this.view = null;
		this.entered = false;
		this.data = null;
		this.drag = null;
		this.tmpCanvas = null;
	}

	Select.prototype = Object.create(Tool.prototype);
	Select.prototype.constructor = Select;

	Select.prototype.init = function() {
		Tool.prototype.init.call(this);

		var self = this;

		this.view = new Element('div', { 
			id: 'selectArea',
			events: {
				mouseenter: function() {
					self.entered = true;
				},

				mouseleave: function() {
					self.entered = false;
				}
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
				this.context.putImageData(this.data, coords.left, coords.top);

				this.startX = coords.left;
				this.startY = coords.top;
				this.endX = coords.left + coords.width;
				this.endY = coords.top + coords.height;

				this.data = this.context.getImageData(coords.left, coords.top, this.endX, this.endY);

				this.fixClear();
				this.tmpCanvas.setStyle('display', 'none');

				Events.trigger(Events.SAVE_STATE);

			}.bind(this)
		});

		$('canvas-container').adopt(this.view);
		$(document.body).adopt(this.tmpCanvas);
	};

	Select.prototype.activate = function() {
		$('canvas-container').setStyle('cursor', 'default');
		Events.trigger(Events.HIDE_MOUSE_POINTER);

		Tool.prototype.activate.call(this);

		$('canvas-container').addEvents({
			mousedown: function(e) {

				if(this.layer.isHidden()) {

					this.view.setStyle('display', 'none');

					this.startX = this.startY = this.endX = this.endY = 0;
					this.clicked = this.entered = false;
					this.data = null;

					LayerManager.layerHiddenWarning(this.layer);
					return;
				}

				if(!this.entered) {
					this.view.setStyle('display', 'none');
					this.startX = this.startY = this.endX = this.endY = 0;
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

		this.map_ref = this.mapDragged.bind(this);
		this.domListeners.addListener(window, 'resize', this.resize.bind(this));
		this.domListeners.addListener(window, 'keydown', this.deleteSelection.bind(this));

		Events.on(Events.MAP_DRAGGED, this.map_ref);
	};

	Select.prototype.deactivate = function() {
		Tool.prototype.deactivate.call(this);
		this.view.setStyle('display', 'none');

		this.startX = this.startY = this.endX = this.endY = 0;
		this.clicked = this.entered = false;
		this.data = null;

		$('canvas-container').setStyle('cursor', 'none');

		Events.off(Events.MAP_DRAGGED, this.map_ref);
	};

	Select.prototype.refresh = function() {

		var size = this.view.getSize();
		var container = $('canvas-container').getSize();

		if(size.x > container.x || size.y > container.y) this.resize();
	};

	Select.prototype.mousemove = function(e) {
		Events.trigger(Events.HIDE_MOUSE_POINTER);

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
	};

	Select.prototype.getToolInfo = function() {
		return '';
	};

	Select.prototype.resize = function() {
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
	};

	Select.prototype.mapDragged = function() {
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
	};

	Select.prototype.deleteSelection = function(e) {
		if(this.layer.isHidden()) {
			this.view.setStyle('display', 'none');
			this.startX = this.startY = this.endX = this.endY = 0;
			this.clicked = this.entered = false;
			this.data = null;

			LayerManager.layerHiddenWarning(this.layer);
			return;
		}

		if(e.code == 46) {
			var coords = this.view.getCoordinates($$('#canvas-container canvas.canvas')[0]);

			if(!coords.width || !coords.height) return;

			this.context.fillStyle = "rgba(255,255,255,0.01)";
			this.context.clearRect(coords.left, coords.top, coords.width, coords.height);

			this.fixClear();

			Events.trigger(Events.SAVE_STATE);

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
	};

	Select.prototype.fixClear = function() {
		var width = LayerManager.width;
		var height = LayerManager.height;
		var data = this.context.getImageData(0, 0, width, height);
		var it = width * height * 4;

		for(var i = 0; i < it; i += 4) {
			if(data.data[i + 3] == 0) {
				data.data[i] = 255;
				data.data[i + 1] = 255;
				data.data[i + 2] = 255;
				data.data[i + 3] = 1;
			}
		}

		this.context.putImageData(data, 0, 0);
	};

	return Select;
});
