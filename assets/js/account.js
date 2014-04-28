define(['persistence'], function(Persistance) {

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

				$$('#btnLogin').cerabox({
					width:400,
					height:145,
					displayTitle:false,
					events: {
						onOpen: function() {
							$$('.cerabox-content input[name=username]')[0].focus();

							$$('.cerabox-content form')[0].addEvent('submit', function(e) {
								Persistance.getInstance().ignoreUnload = true;
							});
						}
					}
				});

				$$('#btnRegister').cerabox({
					width:400,
					height:160,
					displayTitle:false,
					events: {
						onOpen: function() {
							$$('.cerabox-content input[name=username]')[0].focus();

							$$('.cerabox-content form')[0].addEvent('submit', function(e) {
								Persistance.getInstance().ignoreUnload = true;
							});
						}
					}
				});
			}
		}
	})();
});