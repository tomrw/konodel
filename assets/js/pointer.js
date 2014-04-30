define(function() {

	var width = 10;
	var outline = false;

	return (function() {
		var instance;

		return {
			getInstance: function() {
				if (!instance) {
					instance = true;
				}

				return this;
			},

			init: function() {
				$('mouse-outline').set('opacity', 0.5);
			},

			draw: function(e) {

				var pos = $('canvas-container').getPosition();
				var currentX = e.page.x - pos.x;
				var currentY = e.page.y - pos.y;

				$('mouse-pointer').setStyles({
					left: (currentX - 4.5) + 'px',
					top: (currentY - 4.5) + 'px',
					display: 'inline'
				});

				if(outline) {

					var sizeX = $('mouse-outline').getSize().x;

					$('mouse-outline').setStyles({
						width: width,
						height: width,
						top: (-(sizeX - 7) / 2) + 'px',
						left: (-(sizeX - 7) / 2) + 'px'
					});
				}
			},

			hide: function() {
				$('mouse-pointer').setStyle('display', 'none');
				// hidden = true;
			},

			showOutline: function() {
				$('mouse-outline').setStyle('display', 'inline');
				outline = true;
			},

			hideOutline: function() {
				$('mouse-outline').setStyle('display', 'none');
				outline = false;
			},

			setOutlineWidth: function(w) {
				width = w;
			},

			setImage: function(img) {
				//
			}
		}
	})();
});