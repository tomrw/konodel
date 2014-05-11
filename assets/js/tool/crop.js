define(['events', 'layout', 'layer-manager', 'tool/tool', '../../../lib/uvumicrop'],
	function(Events, Layout, LayerManager, Tool) {

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
			Events.trigger(Events.HIDE_MOUSE_POINTER);

			this.crop.resize();
			this.crop.autoSize();
			this.crop.show();

			this.timer_ref = this.resize.bind(this);
			this.map_ref = this.mapDragged.bind(this);
			window.addEvent('resize', this.timer_ref);
			Events.on(Events.MAP_DRAGGED, this.map_ref);
		},

		deactivate: function() {
			$('canvas-container').setStyle('cursor', 'none');
			this.crop.hide();

			window.removeEvent('resize', this.timer_ref);
			Events.off(Events.MAP_DRAGGED, this.map_ref);
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
			Events.trigger(Events.HIDE_MOUSE_POINTER);
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

					var canvas = layer.canvas;
					var context = canvas.getContext('2d');
					var data = context.getImageData(this.left, this.top, this.width, this.height);

					canvas.width = this.width;
					canvas.height = this.height;
					layer.width = this.width;
					layer.height = this.height;

					context.putImageData(data, 0, 0);

					canvas.setStyles({
						top:0,
						left:0
					});

				}.bind(this));

				Layout.resizeLayout(this.width, this.height);
				this.crop.setSize(Math.max(this.width / 4 * 3, 10), Math.max(this.height / 4 * 3, 10));

				Events.trigger(Events.SAVE_STATE);

			}.bind(this));
		}
	});
});
