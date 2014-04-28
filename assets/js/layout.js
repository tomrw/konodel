define(['layer-manager', 'map'], function(LayerManager, Map) {

	function loadLayout() {
		initLayout();

		$(window).addEvent('resize', function() {
			resizeLayout();
		});
	}

	var MAX_WIDTH = 1000;
	var MAX_HEIGHT = 1000;

	function initLayout() {

		var windowSize = $(window).getSize();

		var tool = $('tools').getPosition().x + $('tools').getSize().x;
		var info = $('tools-info').getPosition().x;
		var maxWidth = info - tool - 22;
		var maxHeight = windowSize.y - $('editor-content').getPosition().y - 10;

		var width = maxWidth;
		var height = maxHeight;

		if(MAX_WIDTH != 0 && width > MAX_WIDTH) width = MAX_WIDTH;
		if(MAX_HEIGHT != 0 && height > MAX_HEIGHT) height = MAX_HEIGHT;

		var marginX = (maxWidth - width) / 2;
		var marginY = (maxHeight - height) / 2;

		LayerManager.getInstance().width = width;
		LayerManager.getInstance().height = height;

		$('canvas-container').setStyles({
			width: width,
			height: height,
			"margin-top":marginY < 0 ? 0 : marginY,
			"margin-left":marginX < 10 ? 10 : marginX
		});
	}

	function resizeLayout(w, h) {

		var tool = $('tools').getPosition().x + $('tools').getSize().x;
		var info = $('tools-info').getPosition().x;
		var maxWidth = parseInt(info - tool - 22);
		var maxHeight = parseInt($(window).getSize().y - $('editor-content').getPosition().y - 10);
		var manager = LayerManager.getInstance();
		var width, height;

		// If a width/height are given, use them
		if(w != undefined && h != undefined) {

			width = parseInt(w);
			height = parseInt(h);

			if(MAX_WIDTH != 0 && width > MAX_WIDTH) width = MAX_WIDTH;
			if(MAX_HEIGHT != 0 && height > MAX_HEIGHT) height = MAX_HEIGHT;

			manager.width = width;
			manager.height = height;

			if(width > maxWidth) width = maxWidth;
			if(height > maxHeight) height = maxHeight;
		}
		else {

			// Otherwise, use the manager width

			width = Math.min(maxWidth, manager.width);
			height = Math.min(maxHeight, manager.height);

			if(MAX_WIDTH != 0 && width > MAX_WIDTH) width = MAX_WIDTH;
			if(MAX_HEIGHT != 0 && height > MAX_HEIGHT) height = MAX_HEIGHT;
		}

		var marginX = (maxWidth - width) / 2;
		var marginY = (maxHeight - height) / 2;

		$('canvas-container').setStyles({
			"width":width,
			"height":height,
			"margin-top":marginY < 0 ? 0 : marginY,
			"margin-left":marginX < 10 ? 10 : marginX
		});

		$$('#canvas-container canvas').setStyles({
			top:0,
			left:0
		});

		setTimeout(function() {
			if(width < manager.width || height < manager.height) {
				Map.getInstance().resize();
				Map.getInstance().show();
			}
			else {
				Map.getInstance().hide();
			}
		}, 200);
	}

	function resizeCanvas(width, height) {

		var ref, w, h;

		$$('#layers-container li').each(function(el) {
			ref = el.retrieve('ref');

			w = ref.get('width');
			h = ref.get('height');

			var canvas = ref.get('canvas');

			var img = new Image();
			img.src = canvas.toDataURL();

			canvas.width = width;
			ref.set('width', width);

			canvas.height = height;
			ref.set('height', height);

			canvas.setStyles({
				top:0,
				left:0
			});

			img.onload = function() {
				var context = canvas.getContext('2d');
				context.fillStyle = "rgba(255,255,255,0.01)";
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.drawImage(img, 0, 0);
			}
		});
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