window.addEvent('domready', function() {
	setTimeout(function() {

		if(!Modernizr.canvas) {
			$('upgrade-browser').setStyle('display', 'inline');
			return;
		}

		loadLayout();
		initGlobal();

		var layerManager = LayerManager.getInstance();
		layerManager.addLayer('Layer 1');

		var undoManager = UndoManager.getInstance();
		undoManager.saveState();

		var toolbar = Toolbar.getInstance();
		toolbar.setTool('ToolPaint');
		
		MousePointer.getInstance().init();
		Persistance.getInstance().init();
		Map.getInstance().init();
		Account.getInstance().init();
		KeyboardManager.getInstance().init();

		// $('btnRegister').fireEvent('click');
		// resizeLayout(20, 20);
		// resizeCanvas(20, 20);

	}, 200);
});