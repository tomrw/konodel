define(['events', 'layout', 'layer-manager', 'tool/tool'],
	function(Events, Layout, LayerManager, Tool) {

	function Rotate() {
		this.name = 'Rotate';
		this.tmpCanvas = null;
		// this.rotate = null;
	}

	Rotate.prototype = Object.create(Tool.prototype);
	Rotate.prototype.constructor = Rotate;

	Rotate.prototype.init = function() {
		this.tmpCanvas = new Element('canvas');
		Tool.prototype.init.call(this);
	};

	Rotate.prototype.getToolInfo = function() {
		return '<button id="btnLeft" class="btn">Left 90</button><button id="btnRight" class="btn">Right 90</button><button id="btn180" class="btn">180</button><button id="btnFlipVertical" class="btn">Flip Vertical</button><button id="btnFlipHorizontal" class="btn">Flip Horizontal</button>';
	};

	Rotate.prototype.initToolInfo = function() {
		var self = this;
		$('btnLeft').addEvent('click', function() {
			self.rotate(-90);
		});

		$('btnRight').addEvent('click', function() {
			self.rotate(90);
		});

		$('btn180').addEvent('click', function() {
			self.rotate(90);
			self.rotate(90);
		});

		$('btnFlipHorizontal').addEvent('click', function() {
			self.flip(false);
		});

		$('btnFlipVertical').addEvent('click', function() {
			self.flip(true);
		});
	};

	Rotate.prototype.rotate = function(angle) {
		if(this.layer.isHidden()) {
			LayerManager.layerHiddenWarning(this.layer);
			return;
		}

		if(angle != 90 && angle != -90 && angle != 180) return;

		var width = LayerManager.width;
		var height = LayerManager.height;
		var ref;

		$$('#layers-container li').each(function(el) {
			ref = el.retrieve('ref');

			var canvas = ref.canvas;
			var context = canvas.getContext('2d');
			var context_temp = this.tmpCanvas.getContext('2d');
			var w = ref.width;
			var h = ref.height;

			this.tmpCanvas.width = h;
			this.tmpCanvas.height = w;

			context_temp.save();
			context_temp.translate(h/2, w/2);
			context_temp.rotate(angle * (Math.PI / 180));
			context_temp.translate(-w/2, -h/2);
			context_temp.drawImage(canvas, 0, 0);
			context_temp.restore();

			canvas.width = h;
			canvas.height = w;

			ref.width = h;
			ref.height = w;

			context.drawImage(this.tmpCanvas, 0, 0);

			canvas.setStyles({
				top:0,
				left:0
			});

		}.bind(this));

		LayerManager.width = height;
		LayerManager.height = width;

		Layout.resizeLayout(height, width);
		Events.trigger(Events.RESIZE_MAP);
		Events.trigger(Events.SAVE_STATE);
	};

	Rotate.prototype.flip = function(vertical) {
		var self = this;
		$$('#layers-container li').each(function(el) {
			ref = el.retrieve('ref');

			var canvas = ref.canvas;
			var context = canvas.getContext('2d');
			var context_temp = self.tmpCanvas.getContext('2d');
			var w = ref.width;
			var h = ref.height;

			self.tmpCanvas.width = w;
			self.tmpCanvas.height = h;

			context_temp.save();

			if(vertical) {
				context_temp.scale(1, -1);
				context_temp.drawImage(canvas, 0, -h);
			}
			else {
				context_temp.scale(-1, 1);
				context_temp.drawImage(canvas, -w, 0);
			}

			context_temp.restore();

			context.clearRect(0, 0, w, h);
			context.drawImage(self.tmpCanvas, 0, 0);
		});

		Events.trigger(Events.DRAW_MAP);
		Events.trigger(Events.SAVE_STATE);
	};

	return Rotate;
});
