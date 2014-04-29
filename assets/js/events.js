define(['events/event-bus'], function(EventBus) {

	var Events = new EventBus();

	Events.SAVE_STATE = 'saveState';

	return Events;
});