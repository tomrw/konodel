define(function() {

	function DomEventListener() {
		this.listeners = {};
	}

	DomEventListener.prototype.addListener = function(element, eventType, callback) {
		if (!this.listeners[element]) {
			this.listeners[element] = [];
		}
		var ref = element.addEventListener(eventType, callback);
		this.listeners[element].push({
			element: element,
			eventType: eventType,
			callback: callback,
			ref: ref
		});
	};

	DomEventListener.prototype.removeAllListeners = function() {
		for (var element in this.listeners) {
			this.removeElementListeners(element);
		}
		this.listeners.length = 0;
	};

	DomEventListener.prototype.removeElementListeners = function(element) {
		var listeners = this.listeners[element] || [];
		for (var i = 0, l = listeners.length; i < l; ++i) {
			var listener = listeners[i];
			listener.element.removeEventListener(listener.eventType, listener.callback);
			listener = null;
		}
		listeners.length = 0;
	};

	return DomEventListener;
});
