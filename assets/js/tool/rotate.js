define(['events', 'layout', 'layer-manager', 'tool/tool'],
	function(Events, Layout, LayerManager, Tool) {

	var rotate;
	var currentAngle = 0;
	var tmpCanvas;

	return new Class({

		Extends: Tool,
		name:'Rotate',

		initialize: function() {
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
				var context_temp = tmpCanvas.getContext('2d');
				var w = ref.width;
				var h = ref.height;

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

				ref.width = h;
				ref.height = w;

				context.drawImage(tmpCanvas, 0, 0);

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
		},

		flip: function(vertical) {

			$$('#layers-container li').each(function(el) {
				ref = el.retrieve('ref');

				var canvas = ref.canvas;
				var context = canvas.getContext('2d');
				var context_temp = tmpCanvas.getContext('2d');
				var w = ref.width;
				var h = ref.height;

				tmpCanvas.width = w;
				tmpCanvas.height = h;

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
				context.drawImage(tmpCanvas, 0, 0);
			});

			Events.trigger(Events.DRAW_MAP);
			Events.trigger(Events.SAVE_STATE);
		}
	});
});
