function init() {

	loadLayout();
	initGlobal();

	var layerManager = LayerManager.getInstance();
	layerManager.addLayer('Layer 1');

	var undoManager = UndoManager.getInstance();
	undoManager.saveState();

	var toolbar = Toolbar.getInstance();

	MousePointer.getInstance().init();
	Persistance.getInstance().init();
	Map.getInstance().init();
	Account.getInstance().init();
	KeyboardManager.getInstance().init();

	Persistance.getInstance().ignoreUnload = true;

}