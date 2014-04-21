var Account = (function() {
	
	return new Class({

		Static: {
			instance: null,
			getInstance: function() {
				if(this.instance == null) {
					this.instance = new Account();
				}

				return this.instance;
			}
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
	});
})();