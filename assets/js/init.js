define(['layout', 'layer-manager', 'undo', 'tools', 'pointer', 'persistence', 'map', 'account', 'keyboard', 'colour-picker'],
	function(Layout, LayerManager, UndoManager, Toolbar, MousePointer, Persistance, Map, Account, KeyboardManager, ColourPicker) {

	setTimeout(function() {
		if(!Modernizr.canvas) {
			$('upgrade-browser').setStyle('display', 'inline');
			return;
		}

		Layout.loadLayout();

		var layerManager = LayerManager.getInstance();
		layerManager.addLayer('Layer 1');

		var undoManager = UndoManager.getInstance();
		undoManager.saveState();

		var toolbar = Toolbar.getInstance();
		setTimeout(function() {
			toolbar.setTool('ToolPaint');
		}, 1000);

		MousePointer.getInstance().init();
		Persistance.getInstance().init();
		Map.getInstance().init();
		Account.getInstance().init();
		KeyboardManager.getInstance().init();

	}, 200);
});