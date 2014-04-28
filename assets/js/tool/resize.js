define(['layout', 'layer-manager', 'undo', 'tool/tool'], function(Layout, LayerManager, UndoManager, Tool) {

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

						manager.getLayers().each(function(layer) {
							var canvas = layer.get('canvas');
							var context = canvas.getContext('2d');

							var img = new Image();
							img.width = imageWidth;
							img.height = imageHeight;
							img.src = canvas.toDataURL();

							loaded = false;

							img.onload = function() {

								canvas.width = width > Layout.MAX_WIDTH ? Layout.MAX_WIDTH : width;
								canvas.height = height > Layout.MAX_HEIGHT ? Layout.MAX_HEIGHT : height;
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
});
