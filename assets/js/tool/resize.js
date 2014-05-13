define(['events', 'layout', 'layer-manager', 'tool/tool'],
	function(Events, Layout, LayerManager, Tool) {

	function Resize() {
		this.name = 'Resize';
	}

	Resize.prototype = Object.create(Tool.prototype);
	Resize.prototype.constructor = Resize;

	Resize.prototype.init = function() {
		Tool.prototype.init.call(this);
	};

	Resize.prototype.getToolInfo = function() {
		return 'Width: <input type="text" id="txtCanvasWidth" value="' + LayerManager.width + '"><br />Height: <input type="text" id="txtCanvasHeight" value="' + LayerManager.height + '"><br />Scale Image: <input type="checkbox" id="scale-image" /><br /><button id="btnCanvasResize" class="btn">Resize</button>';
	};

	Resize.prototype.initToolInfo = function() {
		$('txtCanvasWidth').focus();

		$('btnCanvasResize').addEvent('click', function() {

			if(this.layer.isHidden()) {
				LayerManager.layerHiddenWarning(this.layer);
				return;
			}

			var width = $('txtCanvasWidth').get('value').toInt() || 0;
			var height = $('txtCanvasHeight').get('value').toInt() || 0;
			var scale = $('scale-image').get('checked');
			var resize = true;
			var currentWidth = LayerManager.width;
			var currentHeight = LayerManager.height;

			if(width <= 0 || height <= 0) return;
			if(width == currentWidth && height == currentHeight) return;

			if(width < currentWidth || height < currentHeight) {
				if(!scale && !confirm('By resizing the canvas down, data may be lost. Continue?')) {
					resize = false;
				}
			}

			if(resize) {
				Layout.resizeLayout(width, height);
				var loaded = true;

				if(!scale) {
					Layout.resizeCanvas(width, height);
				}
				else {
					var ratio = currentWidth / currentHeight;

					if(currentWidth > currentHeight) {
						var imageWidth = width > Layout.MAX_WIDTH ? Layout.MAX_WIDTH : width;
						var imageHeight = imageWidth / ratio;

						if(imageHeight > height) {
							imageHeight = height;
							imageWidth = height * ratio;
						}
					}
					else {
						var imageHeight = height > Layout.MAX_HEIGHT ? Layout.MAX_HEIGHT : height;
						var imageWidth = imageHeight * ratio;
					}

					var loaded = false;

					LayerManager.getLayers().each(function(layer) {
						var canvas = layer.canvas;
						var context = canvas.getContext('2d');

						var img = new Image();
						img.width = imageWidth;
						img.height = imageHeight;
						img.src = canvas.toDataURL();

						loaded = false;

						img.onload = function() {

							canvas.width = width > Layout.MAX_WIDTH ? Layout.MAX_WIDTH : width;
							canvas.height = height > Layout.MAX_HEIGHT ? Layout.MAX_HEIGHT : height;
							layer.width = canvas.width;
							layer.height = canvas.height;

							context.clearRect(0, 0, LayerManager.width, LayerManager.height);
							context.drawImage(img, 0, 0, imageWidth, imageHeight);

							loaded = true;
						};

					});
				}

				$('txtCanvasWidth').set('value', LayerManager.width);
				$('txtCanvasHeight').set('value', LayerManager.height);

				var interval = setInterval(function() {
					if(loaded) {
						Events.trigger(Events.SAVE_STATE);
						clearInterval(interval);
					}
				}, 100);
			}
		}.bind(this));
	};

	Resize.prototype.refresh = function() {
		$('txtCanvasWidth').set('value', LayerManager.width);
		$('txtCanvasHeight').set('value', LayerManager.height);
	};

	Resize.prototype.removeToolInfo = function() {
	};

	return Resize;
});
