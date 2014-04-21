var Map = (function() {

	// var hidden = false;
	
	return new Class({

		Static: {
			instance: null,
			getInstance: function() {
				if(this.instance == null) {
					this.instance = new Map();
				}

				return this.instance;
			}
		},

		init: function() {

			this.resize();

			setInterval(function() {
				this.draw();
			}.bind(this), 5000);
			
			new Drag.Move($('map-selection'), {
				container: $('map'),
				onDrag: function(el) {
					var x = el.getStyle('left').toInt();
					var y = el.getStyle('top').toInt();
					var layers = LayerManager.getInstance().getLayers();
					var canvas;

					var mapSize = $('map').getSize();
					var selection = $('map-selection');

					// x = (x < 0 ? 0 : x);
					// y = (y < 0 ? 0 : y);

					if(x < 0) x = 0;
					if(y < 0) y = 0;

					var rangeX = (layers[0].get('width') / mapSize.x) * x;
					var rangeY = (layers[0].get('height') / mapSize.y) * y;

					layers.each(function(layer) {
						canvas = layer.get('canvas');

						canvas.setStyles({
							left: -rangeX,
							top: -rangeY
						});
					});

					window.fireEvent('mapDrag');
					// Toolbar.getInstance().refreshTool();
				}
			});
		},

		show: function() {
			$('map').setStyle('display', 'block');
		},

		hide: function() {
			$('map').setStyle('display', 'none');
			// hidden = true;
		},

		draw: function() {
			var map = $('map');

			if(map.getStyle('display') == 'none') return;

			var ref, canvas, temp;
			var canvas = $('map-canvas');
			var context = canvas.getContext('2d');
			var size = map.getSize();

			canvas.setStyles({
				width: size.x - 2,
				height: size.y - 2
			});

			context.clearRect(0, 0, canvas.width, canvas.height);

			$$('#layers-container li').reverse().each(function(el) {
				ref = el.retrieve('ref');

				if(ref) {
					context.save();
					context.globalAlpha = ref.get('opacity') || 1;
					context.drawImage(ref.get('canvas'), 0, 0, canvas.width, canvas.height);//, size.x - 2, size.y - 2);//, size.x - 2, size.y - 2);
					context.restore();
				}
			});
		},

		resize: function() {
			// want to use these for the 'scroll' thing
			// var currentWidth = LayerManager.getInstance().width;
			// var currentHeight = LayerManager.getInstance().height;
			// var currentRatio = currentWidth / currentHeight;
			var w, h;

			var currentWidth = $('canvas-container').getSize().x - 2;
			var currentHeight = $('canvas-container').getSize().y - 2;
			var currentRatio = currentWidth / currentHeight;

			var layer = LayerManager.getInstance().getActiveLayer();
			var manager = LayerManager.getInstance();
			// var width = layer.get('width');
			// var height = layer.get('height');
			var width = manager.width;
			var height = manager.height;
			var ratio = width / height;

			// Display the 
			if(ratio == 1) {
				w = width > 180 ? 180 : width;
				h = height > 180 ? 180 : height;
			}
			else if(ratio > 1) {
				w = 180;
				h = 180 / ratio;
			}
			else {
				w = 180 * ratio;
				h = 180;
			}

			var cw = (currentWidth / width) * w;
			var ch = (currentHeight / height) * h;

			$('map').setStyles({
				width: w,
				height: h
			});

			$('map-selection').setStyles({
				top: 0,
				left: 0,
				width: cw - 2,
				height: ch - 2
			}).set('opacity', 0.2);

			this.draw();
		}
	});
})();