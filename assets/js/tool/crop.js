define(['events', 'layout', 'layer-manager', 'tool/tool', '../../../lib/uvumicrop'],
	function(Events, Layout, LayerManager, Tool) {

	function Crop() {
		this.cropper = null;
		this.timer = null;
		this.timer_ref = null;
		this.name = 'Crop';
		this.left = 0;
		this.top = 0;
		this.width = 0;
		this.height = 0;
	}

	Crop.prototype = Object.create(Tool.prototype);
	Crop.prototype.constructor = Crop;

	Crop.prototype.init = function() {
		this.cropper = new Cropper('canvas-container', {
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

		Tool.prototype.init.call(this);
	};

	Crop.prototype.activate = function() {
		$('canvas-container').setStyle('cursor', 'default');
		Events.trigger(Events.HIDE_MOUSE_POINTER);

		this.cropper.resize();
		this.cropper.autoSize();
		this.cropper.show();

		this.map_ref = this.mapDragged.bind(this);
		this.domListeners.addListener(window, 'resize', this.resize.bind(this));

		Events.on(Events.MAP_DRAGGED, this.map_ref);
	};

	Crop.prototype.deactivate = function() {
		$('canvas-container').setStyle('cursor', 'none');
		this.cropper.hide();
		Events.off(Events.MAP_DRAGGED, this.map_ref);
	};

	Crop.prototype.refresh = function() {
		this.cropper.resize();
		this.cropper.autoSize();
		this.cropper.show();
	};

	Crop.prototype.mapDragged = function() {
		var coords = $$('.cropperResize')[0].getCoordinates($$('#canvas-container canvas.canvas')[0]);

		this.left = coords.left;
		this.top = coords.top;
		this.width = coords.width - 2;
		this.height = coords.height - 2;
	};

	Crop.prototype.mousemove = function(e) {
		Events.trigger(Events.HIDE_MOUSE_POINTER);
	};

	Crop.prototype.crop = function(top, left, width, height) {
		var canvasOffset = $$('#canvas-container canvas.canvas')[0];

		this.top = top - canvasOffset.getStyle('top').toInt();
		this.left = left - canvasOffset.getStyle('left').toInt();
		this.width = width - 2;
		this.height = height - 2;

		if(this.width > LayerManager.width) {
			this.width = LayerManager.width;
		}
		if(this.height > LayerManager.height) {
			this.height = LayerManager.height;
		}
	};

	Crop.prototype.resize = function() {
		this.cropper.resize();
		this.cropper.autoSize();
	};

	Crop.prototype.getToolInfo = function() {
		return '<button id="btnCrop" class="btn">Crop</button>';
	};

	Crop.prototype.initToolInfo = function() {
		$('btnCrop').addEvent('click', function() {
			if(this.layer.isHidden()) {
				LayerManager.layerHiddenWarning(this.layer);
				return;
			}

			if(this.width == LayerManager.width && this.height == LayerManager.height) {
				return;
			}

			var layers = LayerManager.getLayers();

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
			this.cropper.setSize(Math.max(this.width / 4 * 3, 10), Math.max(this.height / 4 * 3, 10));

			Events.trigger(Events.SAVE_STATE);

		}.bind(this));
	};

	return Crop;
});
