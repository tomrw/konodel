define(['undo'], function(UndoManager) {

	return (function() {
		var instance;

		return {
			getInstance: function() {
				if (!instance) {
					instance = true;
					this.init();
				}

				return this;
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
				});
			}
		}
	})();
});
