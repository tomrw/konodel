function runTests() {

	/*
	 * Test the layer manager core functionality
	*/
	test("Layer Manager Tests", function() {

		var layerManager = LayerManager.getInstance();
		
		equal(layerManager.getLayers().length, 1);
		
		var currentLayer = layerManager.getActiveLayer();
		equal(currentLayer.get('name'), 'Layer 1');

		var newLayer = layerManager.addLayer('Layer 2');
		ok(newLayer);

		equal(layerManager.getActiveLayer().get('name'), 'Layer 2');
		equal(layerManager.getLayers().length, 2);

		layerManager.setActiveLayer(currentLayer);
		equal(layerManager.getActiveLayer().get('name'), 'Layer 1');

		layerManager.removeLayer(currentLayer);
		equal(layerManager.getLayers().length, 1);

		equal(layerManager.getActiveLayer(), newLayer);

		newLayer.set('name', 'Test Layer');
		equal(layerManager.getActiveLayer().get('name'), 'Test Layer');

		layerManager.clear();
		equal(layerManager.getLayers().length, 0);

		newLayer = layerManager.addLayer('New Layer');
		ok(newLayer.get('canvas'));
		ok(newLayer.get('menu'));
		equal(newLayer.get('name'), 'New Layer');
		newLayer.set('opacity', 0.5);
		equal(newLayer.get('opacity'), 0.5);
	});

	/*
	 * Test the physical layer interface
	*/
	test("Layer Interface Tests", function() {
		var layerManager = LayerManager.getInstance();

		layerManager.clear();
		equal(layerManager.getLayers().length, 0);

		$('layer-new').fireEvent('click');
		equal(layerManager.getLayers().length, 1);

		$('layer-delete').fireEvent('click');
		equal(layerManager.getLayers().length, 1);

		layerManager.addLayer('Test 1');
		equal(layerManager.getLayers().length, 2);
		$('layer-delete').fireEvent('click');
		equal(layerManager.getLayers().length, 1);

		for(var i = 0; i < 15; ++i) {
			layerManager.addLayer('Test Layer ' + i);
		}

		equal(layerManager.getLayers().length, layerManager.getLayerLimit());
	});

	/*
	 * Test the core toolbar functionality
	*/
	test("Toolbar Tests", function() {
		var toolbar = Toolbar.getInstance();

		equal(toolbar.getTool(), null);

		toolbar.setTool('ToolPaint');
		equal(toolbar.getTool(), 'ToolPaint');

		toolbar.setTool('NotExistantTool');
		equal(toolbar.getTool(), 'ToolPaint');

		// Test setting a 'child' tool as the main tool - Should default to its parent
		toolbar.setTool('FilterGrayscale');
		equal(toolbar.getTool(), 'ToolFilter');

		toolbar.setTool('ToolPaint');
	});

	/*
	 * Test resizing the layout
	*/
	test("Layout Tests", function() {
		var canvas = $('canvas-container');
		var container = $('window-container');
		var layerManager = LayerManager.getInstance();
		
		container.setStyle('display', 'inline');

		resizeLayout(100, 100);
		equal(100, layerManager.width);
		equal(100, layerManager.height);

		resizeLayout(1000, 800);
		equal(1000, layerManager.width);
		equal(800, layerManager.height);

		// Try setting a size bigger than the max width/height allowed
		if(MAX_WIDTH && MAX_HEIGHT) {
			resizeLayout(MAX_WIDTH + 100, MAX_HEIGHT + 100);
			equal(MAX_WIDTH, layerManager.width, 'Max width test');
			equal(MAX_HEIGHT, layerManager.height, 'Max height test');
		}

		container.setStyle('display', 'none');
	});

	/*
	 * Test the core undo/redo functionality
	*/
	test("Undo/Redo Test", function() {
		var canvas = $('canvas-container');
		var container = $('window-container');
		var layerManager = LayerManager.getInstance();
		var undo = UndoManager.getInstance();
		
		container.setStyle('display', 'inline');

		resizeLayout(100, 100);
		layerManager.clear();

		var layer = layerManager.addLayer('Test Layer');
		var context = layer.get('canvas').getContext('2d');

		context.fillStyle = '#ff0000';
		context.fillRect(0, 0, 10, 10);

		var data = context.getImageData(5, 5, 1, 1).data;
		equal(data[0] == 255, true, 'R channel comparison');
		equal(data[1] == 0, true, 'G channel comparison');
		equal(data[2] == 0, true, 'B channel comparison');

		undo.saveState();
		undo.undo();

		context = layerManager.getActiveLayer().get('canvas').getContext('2d');
		data = context.getImageData(5, 5, 1, 1).data;
		equal(data[0] == 0, true, 'R channel undo comparison');
		equal(data[1] == 0, true, 'G channel undo comparison');
		equal(data[2] == 0, true, 'B channel undo comparison');

		undo.redo();

		context = layerManager.getActiveLayer().get('canvas').getContext('2d');
		data = context.getImageData(5, 5, 1, 1).data;
		equal(data[0] == 255, true, 'R channel redo comparison');
		equal(data[1] == 0, true, 'G channel redo comparison');
		equal(data[2] == 0, true, 'B channel redo comparison');

		container.setStyle('display', 'none');
	});

	test("Colour Picker Test", function() {
		var layerManager = LayerManager.getInstance();
		var canvas = $('canvas-container');
		var container = $('window-container');
		layerManager.clear();

		container.setStyle('display', 'inline');

		Toolbar.getInstance().setTool('ToolPicker');
		resizeLayout(100, 100);
		resizeCanvas(100, 100);

		var layer = layerManager.addLayer('Test Layer');
		var context = layer.get('canvas').getContext('2d');
		var pos = layer.get('canvas').getPosition();

		context.fillStyle = "#b00b0b";
		context.fillRect(0, 0, 10, 10);

		canvas.fireEvent('click', { page: { x: 1 + pos.x, y: 1 + pos.y } });

		equal($('picker-r').get('text'), 176, 'R comparison');
		equal($('picker-g').get('text'), 11, 'G comparison');
		equal($('picker-b').get('text'), 11, 'B comparison');

		container.setStyle('display', 'none');
	});

	test("Rotation Tool Test", function() {
		var layerManager = LayerManager.getInstance();
		var canvas = $('canvas-container');
		var container = $('window-container');
		layerManager.clear();

		container.setStyle('display', 'inline');

		Toolbar.getInstance().setTool('ToolRotate');
		resizeLayout(200, 100);
		resizeCanvas(200, 100);

		var layer = layerManager.addLayer('Test Layer');

		$('btnLeft').fireEvent('click');
		equal(layerManager.width, 100);
		equal(layerManager.height, 200);

		$('btnRight').fireEvent('click');
		equal(layerManager.width, 200);
		equal(layerManager.height, 100);

		$('btnLeft').fireEvent('click');
		$('btn180').fireEvent('click');
		equal(layerManager.width, 100);
		equal(layerManager.height, 200);

		container.setStyle('display', 'none');
	});

	test("Resize Layout Test", function() {
		var layerManager = LayerManager.getInstance();
		var canvas = $('canvas-container');
		var container = $('window-container');
		layerManager.clear();

		container.setStyle('display', 'inline');

		Toolbar.getInstance().setTool('ToolResize');
		resizeLayout(50, 50);
		resizeCanvas(50, 50);
		
		var layer = layerManager.addLayer('Test Layer');

		$('txtCanvasWidth').set('value', 100);
		$('txtCanvasHeight').set('value', 100);
		$('btnCanvasResize').fireEvent('click');

		equal(layerManager.width, 100);
		equal(layerManager.height, 100);

		$('txtCanvasWidth').set('value', 257);
		$('txtCanvasHeight').set('value', 500);
		$('btnCanvasResize').fireEvent('click');

		equal(layerManager.width, 257);
		equal(layerManager.height, 500);

		if(MAX_WIDTH && MAX_HEIGHT) {
			$('txtCanvasWidth').set('value', MAX_WIDTH + 100);
			$('txtCanvasHeight').set('value', MAX_HEIGHT + 100);
			$('btnCanvasResize').fireEvent('click');
			equal(MAX_WIDTH, layerManager.width, 'Max width test');
			equal(MAX_HEIGHT, layerManager.height, 'Max height test');
		}

		container.setStyle('display', 'none');
	});
	
	/*
	 * Test whether the map appears when the canvas is resized to a size greater than the screen
	*/
	asyncTest("Map Test", function() {

		var windowSize = $(window).getSize();
		resizeLayout(windowSize.x + 20, windowSize.y + 20);

		setTimeout(function() {
			equal($('map').getStyle('display'), 'block', 'The minimap should show');
			start();
		}, 500);
	});
}