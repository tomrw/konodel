define(['events','layer-manager'], function(Events, LayerManager) {

	function loadLayout() {
		initLayout();
		$(window).addEvent('resize', alignLayout);
	}

	var MAX_WIDTH = 1000;
	var MAX_HEIGHT = 1000;

	function initLayout() {
		var layerManager = LayerManager.getInstance();
		var wrapper = document.getElementById('canvas-wrapper');
		var canvasContainer = document.getElementById('canvas-container');
		var offset = 2;
		var width = getMinLength(MAX_WIDTH, wrapper.offsetWidth) - offset;
		var height = getMinLength(MAX_HEIGHT, wrapper.offsetHeight) - offset;

		canvasContainer.style.width = width + 'px';
		canvasContainer.style.height = height + 'px';
		canvasContainer.style.display = 'block';
		canvasContainer.style['margin-top'] = -canvasContainer.offsetHeight / 2 + 'px';
		canvasContainer.style['margin-left'] = -canvasContainer.offsetWidth / 2 + 'px';

		layerManager.width = width;
		layerManager.height = height;
	}

	function resizeLayout(newWidth, newHeight) {
		newWidth = getMinLength(MAX_WIDTH, newWidth);
		newHeight = getMinLength(MAX_HEIGHT, newHeight);

		var canvasContainer = document.getElementById('canvas-container');
		var layerManager = LayerManager.getInstance();

		layerManager.width = newWidth;
		layerManager.height = newHeight;

		canvasContainer.style.width = newWidth + 'px';
		canvasContainer.style.height = newHeight + 'px';

		alignLayout();
	}

	function alignLayout() {
		var layerManager = LayerManager.getInstance();
		var wrapper = document.getElementById('canvas-wrapper');
		var heightAvailable = wrapper.offsetHeight;
		var widthAvailable = wrapper.offsetWidth;
		var canvasContainer = document.getElementById('canvas-container');
		var currentHeight = layerManager.height;
		var currentWidth = layerManager.width;
		var showMap = false;
		var styles = {};

		if (currentWidth < widthAvailable) {
			styles.left = '50%';
			styles['margin-left'] = -(layerManager.width) / 2;
			styles.width = layerManager.width -2;
		}
		else {
			styles.left = 0;
			styles['margin-left'] = '0px';
			styles.width = widthAvailable - 4;
			showMap = true;
		}

		if (currentHeight < heightAvailable) {
			styles.top = '50%';
			styles['margin-top'] = -(layerManager.height) / 2;
			styles.height = layerManager.height - 2;
		}
		else {
			styles.top = 0;
			styles['margin-top'] = '0px';
			styles.height = heightAvailable - 4;
			showMap = true;
		}

		$(canvasContainer).setStyles(styles);
		$$('#canvas-container canvas').setStyles({
			top: 0,
			left: 0
		});

		toggleMap(showMap);
	}

	function resizeCanvas(width, height) {
		var ref, w, h;

		$$('#layers-container li').each(function(el) {
			ref = el.retrieve('ref');

			w = ref.width;
			h = ref.height;

			var canvas = ref.canvas;
			var img = new Image();
			img.src = canvas.toDataURL();

			canvas.width = width;
			canvas.height = height;
			ref.width = width;
			ref.height = height;

			canvas.setStyles({
				top: 0,
				left: 0
			});

			img.onload = function() {
				var context = canvas.getContext('2d');
				context.fillStyle = "rgba(255,255,255,0.01)";
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.drawImage(img, 0, 0);
			};
		});
	}

	function toggleMap(showMap) {
		Events.trigger(Events.TOGGLE_MAP, showMap);
	}

	function getMinLength(max, value) {
		if (max) {
			return Math.min(max, value);
		}
		return value;
	}

	return {
		initLayout: initLayout,
		loadLayout: loadLayout,
		resizeCanvas: resizeCanvas,
		resizeLayout: resizeLayout,
		MAX_HEIGHT: MAX_HEIGHT,
		MAX_WIDTH: MAX_WIDTH
	};
});