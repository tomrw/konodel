var KeyboardManager = (function() {
	
	// ctrl-s, ctrl-o

	return new Class({

		Static: {
			instance: null,
			getInstance: function() {
				if(this.instance == null) {
					this.instance = new KeyboardManager();
				}

				return this.instance;
			}
		},

		init: function() {

			$(document).addEvent('keydown', function(e) {
				if(!e.control) return;

				if(e.code == 90) {
					UndoManager.getInstance().undo();
					e.stop();
				}
				else if(e.code == 89) {
					UndoManager.getInstance().redo();
					e.stop();
				}
				else if(e.code == 79) {
					// Open
					if($('btnLoad')) {
						$('btnLoad').fireEvent('click');
						e.stop();
					}
				}
				else if(e.code == 83) {
					// Save
					if($('btnSave')) {
						$('btnSave').fireEvent('click');
						e.stop();
					}
				}
				else if(e.code == 77) {
					$('btnUpload').fireEvent('click');
				}

				// e.preventDefault();
				// e.stop();
				// return false;
			});
		}
	});
})();