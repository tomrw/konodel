define(['events', 'layer-manager', 'tool/tool'],
	function(Events, LayerManager, Tool) {

	return new Class({

		Extends: Tool,

		currentX:0,
		currentY:0,
		lastX:10,
		lastY:0,
		drawing:false,
		undo:true,
		name:'Eraser',

		brushWidth:10,

		activate: function() {
			Events.trigger(Events.SHOW_MOUSE_OUTLINE);
			Events.trigger(Events.SET_MOUSE_OUTLINE_WIDTH, this.brushWidth);

			$('canvas-container').addEvents({
				mousedown: function(e) {

					if(this.layer.isHidden()) {
						LayerManager.getInstance().layerHiddenWarning(this.layer);
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
		},

		deactivate: function() {
			this.parent();
			$(window).removeEvent('mouseup', this.mouseup_ref);
		},

		mousemove: function(e) {

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
		},

		mouseleave: function(e) {
			this.lastX = -1;
			this.lastY = -1;
			this.undo = false;
		},

		mouseup: function() {
			this.drawing = false;

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

			if(this.undo) {
				Events.trigger(Events.SAVE_STATE);
			}
		},

		getToolInfo: function() {
			return '<h3>Brush Size</h3>' +
				'<div id="brush-size" class="slider"><div class="knob"></div></div>';
		},

		initToolInfo: function() {
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
		}
	});
});
