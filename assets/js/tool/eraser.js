define(['events', 'layer-manager', 'tool/tool'],
	function(Events, LayerManager, Tool) {

	function Eraser() {
		this.brushWidth = 10;
		this.currentX = 0;
		this.currentY = 0;
		this.drawing = false;
		this.lastX = 10;
		this.lastY = 0;
		this.name = 'Eraser';
		this.undo = true;
	}

	Eraser.prototype = Object.create(Tool.prototype);
	Eraser.prototype.constructor = Eraser;

	Eraser.prototype.init = function() {
		Tool.prototype.init.call(this);
	};

	Eraser.prototype.activate = function() {
		Events.trigger(Events.SHOW_MOUSE_OUTLINE);
		Events.trigger(Events.SET_MOUSE_OUTLINE_WIDTH, this.brushWidth);

		$('canvas-container').addEvents({
			mousedown: function(e) {

				if(this.layer.isHidden()) {
					LayerManager.layerHiddenWarning(this.layer);
					return;
				}

				var pos = this.canvas.getPosition();
				var orig = this.context.globalCompositeOperation;

				this.drawing = true;
				this.lastX = e.page.x - pos.x;
				this.lastY = e.page.y - pos.y;

				this.context.globalCompositeOperation = "destination-out";
				this.context.beginPath();
				this.context.arc(this.lastX, this.lastY, this.brushWidth / 2, 0, 2 * Math.PI, false);
				this.context.strokeStyle = "rgba(0,0,0,1)";
				this.context.fill();
				this.context.lineWidth = 1;
				this.context.lineCap = "round";
				this.context.stroke();

				this.context.globalCompositeOperation = orig;

			}.bind(this),

			mouseenter: function() {
				this.undo = true;
			}.bind(this)
		});

		this.mouseup_ref = this.mouseup.bind(this);
		$(window).addEvent('mouseup', this.mouseup_ref);
	};

	Eraser.prototype.deactivate = function() {
		Tool.prototype.deactivate.call(this);
		$(window).removeEvent('mouseup', this.mouseup_ref);
	};

	Eraser.prototype.mousemove = function(e) {

		if(!this.drawing) return;

		var pos = this.canvas.getPosition();
		var orig = this.context.globalCompositeOperation;

		this.currentX = e.page.x - pos.x;
		this.currentY = e.page.y - pos.y;

		if(this.lastX == -1) {
			this.lastX = this.currentX;
			this.lastY = this.currentY;
		}

		this.context.globalCompositeOperation = "destination-out";
		this.context.beginPath();

		this.context.strokeStyle = "rgba(0,0,0,1)";
		this.context.lineWidth = this.brushWidth;
		this.context.lineCap = "round";
		this.context.moveTo(this.lastX, this.lastY);
		this.context.lineTo(this.currentX, this.currentY);
		this.context.stroke();

		this.context.globalCompositeOperation = orig;

		this.lastX = this.currentX;
		this.lastY = this.currentY;
	};

	Eraser.prototype.mouseleave = function(e) {
		this.lastX = -1;
		this.lastY = -1;
		this.undo = false;
	};

	Eraser.prototype.mouseup = function() {
		this.drawing = false;

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

		if(this.undo) {
			Events.trigger(Events.SAVE_STATE);
		}
	};

	Eraser.prototype.getToolInfo = function() {
		return '<h3>Brush Size</h3>' +
			'<div id="brush-size" class="slider"><div class="knob"></div></div>';
	};

	Eraser.prototype.initToolInfo = function() {
		new Slider($('brush-size'), $('brush-size').getElement('.knob'), {
			initialStep: this.brushWidth,
			range: [1, 100],
			onChange: function(step) {
				this.brushWidth = step;

				if(step > 10) {
					Events.trigger(Events.SET_MOUSE_OUTLINE_WIDTH, step);
					Events.trigger(Events.SHOW_MOUSE_OUTLINE);
				}
				else {
					Events.trigger(Events.HIDE_MOUSE_OUTLINE);
				}

			}.bind(this)
		});
	};

	return Eraser;
});
