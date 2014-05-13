define(['events', 'layer-manager', 'tool/tool'],
	function(Events, LayerManager, Tool) {

	function Paint() {
		this.currentX = 0;
		this.currentY = 0;
		this.drawing = false;
		this.lastX = 10;
		this.lastY = 0;
		this.name = 'Paint';
		this.undo = true;

		this.brushWidth = 10;
		this.brushColour = "#000000";
		this.points = [];
	}

	Paint.prototype = Object.create(Tool.prototype);
	Paint.prototype.constructor = Paint;

	Paint.prototype.init = function() {
		Tool.prototype.init.call(this);
		Events.on(Events.COLOUR_PICKER_CHANGED, this.pickerChanged.bind(this));
	};

	Paint.prototype.activate = function() {
		Events.trigger(Events.SHOW_MOUSE_OUTLINE);
		Events.trigger(Events.SET_MOUSE_OUTLINE_WIDTH, this.brushWidth);

		$('canvas-container').addEvents({
			mousedown: function(e) {

				if(this.layer.isHidden()) {
					LayerManager.layerHiddenWarning(this.layer);
					return;
				}

				var pos = this.canvas.getPosition();

				this.drawing = true;
				this.lastX = e.page.x - pos.x;
				this.lastY = e.page.y - pos.y;

				this.context.beginPath();
				this.context.arc(this.lastX, this.lastY, this.brushWidth / 2, 0, 2 * Math.PI, false);
				this.context.lineWidth = 1;
				this.context.strokeStyle = this.brushColour;
				this.context.fillStyle = this.brushColour;
				this.context.fill();
				this.context.stroke();

				if(this.brushWidth < 3) {
					this.points = [[this.lastX, this.lastY]];
				}

			}.bind(this),

			mouseenter: function() {
				this.undo = true;
			}.bind(this)
		});

		this.mouseup_ref = this.mouseup.bind(this);
		$(window).addEvent('mouseup', this.mouseup_ref);
	};

	Paint.prototype.deactivate = function() {
		Tool.prototype.deactivate.call(this);
		$(window).removeEvent('mouseup', this.mouseup_ref);
	};

	Paint.prototype.bresenham = function() {
		var data = this.context.getImageData(0, 0, LayerManager.width, LayerManager.height);
		var x0, y0, x1, y1;
		var colour = new Color(this.brushColour);

		for(var i = 1; i < this.points.length; ++i) {
			x0 = this.points[i - 1][0];
			x1 = this.points[i][0];
			y0 = this.points[i - 1][1];
			y1 = this.points[i][1];

			this.drawBresenhamLine(data, x0, y0, x1, y1, colour[0], colour[1], colour[2]);
		}

		this.context.putImageData(data, 0, 0);
	};

	Paint.prototype.drawBresenhamLine = function(data, x0, y0, x1, y1, r, g, b) {
		var dx = Math.abs(x1 - x0);
		var dy = Math.abs(y1 - y0);
		var sx = x0 < x1 ? 1 : -1;
		var sy = y0 < y1 ? 1 : -1;
		var error = dx - dy;
		var e2, index;
		var width = LayerManager.width;

		while(true) {
			index = (x0 + y0 * width) * 4;

			data.data[index] = r;
			data.data[index + 1] = g;
			data.data[index + 2] = b;
			data.data[index + 3] = 255;

			if (x0 == x1 && y0 == y1) break;

			e2 = error * 2;

			if(e2 > -dy) { 
				error -= dy;
				x0 += sx;
			}

			if(e2 < dx) {
				error += dx;
				y0 += sy;
			}
		}
	};

	Paint.prototype.mousemove = function(e) {

		if(!this.drawing) return;

		var pos = this.canvas.getPosition();

		this.currentX = e.page.x - pos.x;
		this.currentY = e.page.y - pos.y;

		if(this.lastX == -1) {
			this.lastX = this.currentX;
			this.lastY = this.currentY;
		}

		this.context.beginPath();
		this.context.lineWidth = this.brushWidth;
		this.context.lineCap = "round";
		this.context.strokeStyle = this.brushColour;
		this.context.moveTo(this.lastX, this.lastY);

		var x = (this.lastX + this.currentX) / 2;
		var y = (this.lastY + this.currentY) / 2;

		this.context.quadraticCurveTo(x, y, this.currentX, this.currentY);

		this.context.stroke();

		if(this.brushWidth < 3) {
			this.points.push([this.currentX, this.currentY]);
		}

		this.lastX = this.currentX;
		this.lastY = this.currentY;
	};

	Paint.prototype.mouseleave = function(e) {
		this.lastX = -1;
		this.lastY = -1;
		this.undo = false;

		if(this.brushWidth < 3) {
			this.bresenham();
			this.points = [];
		}
	};

	Paint.prototype.mouseup = function() {
		this.drawing = false;

		if(this.brushWidth < 3) {
			this.bresenham();
			this.points = [];
		}

		if(this.undo) {
			Events.trigger(Events.SAVE_STATE);
		}
	};

	Paint.prototype.getToolInfo = function() {
		return '<a id="choose-colour" class="colour-preview-text"><div class="colour-preview" style="background-color:' + this.brushColour + '"></div>Choose colour</a><br />' + 
			'<h3>Brush Size</h3>' +
			'<div id="brush-size" class="slider"><div class="knob"></div></div>';
	};

	Paint.prototype.initToolInfo = function() {
		$('choose-colour').addEvent('click', function(e) {
			$('colour-picker').fireEvent('click', e);
		});

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

	Paint.prototype.removeToolInfo = function() {
		$('choose-colour').removeEvents();
	};

	Paint.prototype.pickerChanged = function(colour) {
		this.brushColour = colour.hex;
	};

	return Paint;
});
