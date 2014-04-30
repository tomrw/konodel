define(['events/event-bus'], function(EventBus) {

	var Events = new EventBus();

	Events.SAVE_STATE = 'saveState';
	Events.UNDO = 'undo';
	Events.REDO = 'redo';
	Events.RESET_UNDO = 'resetUndo';

	Events.IGNORE_UNLOAD = 'ignoreUnload';

	return Events;
});
