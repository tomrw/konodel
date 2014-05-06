define(['events/event-bus'], function(EventBus) {

	var Events = new EventBus();

	Events.SAVE_STATE = 'saveState';
	Events.UNDO = 'undo';
	Events.REDO = 'redo';
	Events.RESET_UNDO = 'resetUndo';

	Events.IGNORE_UNLOAD = 'ignoreUnload';

	Events.HIDE_MOUSE_POINTER = 'hideMousePointer';
	Events.HIDE_MOUSE_OUTLINE = 'hideMouseOutline';
	Events.SHOW_MOUSE_OUTLINE = 'showMouseOutline';
	Events.SET_MOUSE_OUTLINE_WIDTH = 'setMouseOutlineWidth';

	Events.DRAW_MAP = 'drawMap';
	Events.RESIZE_MAP = 'resizeMap';
	Events.TOGGLE_MAP = 'toggleMap';

	return Events;
});
