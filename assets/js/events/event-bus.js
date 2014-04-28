define(function() {

	function EventBus() {
		this._listeners = {};
	}

	var EventBusPrototype = EventBus.prototype;

	EventBusPrototype.on = function(event, callback) {
		if (!this._listeners[event]) {
			this._listeners[event] = [];
		}
		this._listeners[event].push(callback);
	};

	EventBusPrototype.off = function(event, callback) {
		var listeners = this._listeners[event];
		if (listeners && callback) {
			for (var i = listeners.length; i >= 0; --i) {
				var listener = listeners[i];
				if (listener === callback) {
					listeners.splice(i, 1);
				}
			}
		}
		else {
			delete this._listeners[event];
		}
	};

	EventBusPrototype.trigger = function(event) {
		var listeners = this._listeners[event] || [];
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0, l = listeners.length; i < l; ++i) {
			listeners[i].apply(null, args);
		}
	};

	return EventBus;
});
