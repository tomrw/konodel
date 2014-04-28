define(['tool/tool'], function(Tool) {

	var preview;

	return new Class({

		Extends: Tool,

		name:'Colour Picker',

		activate: function() {
			$('canvas-container').addEvent('click', function(e) {

				var pos = this.canvas.getPosition();
				var currentX = e.page.x - pos.x;
				var currentY = e.page.y - pos.y;

				var data = this.context.getImageData(currentX, currentY, 1, 1).data;

				$('picker-r').set('text', data[0]);
				$('picker-g').set('text', data[1]);
				$('picker-b').set('text', data[2]);
				$('picker-a').set('text', data[3]);

				$$('.colour-preview').setStyle('background-color', ('rgba(' + data[0] + ',' + data[1] + ',' + data[2] + ',' + data[3] + ')').rgbToHex());

			}.bind(this));

			preview = new Element('div', { id: 'picker-preview', styles: { display:'none' } })
				.adopt(new Element('div', { id: 'picker-preview-inside' }));

			$('canvas-container').adopt(preview);

		},

		deactivate: function() {
			this.parent();

			preview.destroy();
			preview = null;
		},

		mousemove: function(e) {

			if(this.layer.isHidden()) {
				return;
			}

			var pos = this.canvas.getCoordinates();
			var container = $('canvas-container').getCoordinates();
			var mouseCoords = $('mouse-pointer').getPosition();
			var currentX = e.page.x - pos.left;
			var currentY = e.page.y - pos.top;

			if(container.width < 50 && container.height < 50) {
				preview.setStyle('display', 'none');
				return;
			}

			var data = this.context.getImageData(currentX, currentY, 1, 1).data;
			var marginLeft = (mouseCoords.x > (container.width / 2) ? -32 : 7) - container.left;
			var marginTop = (mouseCoords.y > (container.height / 2) ? -32 : 7) - container.top;

			preview.setStyles({
				left: mouseCoords.x,
				top: mouseCoords.y,
				display: 'inline',
				'margin-left': marginLeft,
				'margin-top': marginTop
			});

			$('picker-preview-inside').setStyle('background-color', ('rgba(' + data[0] + ',' + data[1] + ',' + data[2] + ',' + data[3] + ')').rgbToHex());
		},

		mouseleave: function() {
			preview.setStyle('display', 'none');
		},

		getToolInfo: function() {
			return 'R:<span id="picker-r"></span>, G:<span id="picker-g"></span>, B:<span id="picker-b"></span>, A:<span id="picker-a"></span>' +
			 '<div class="colour-preview"></div>';
		},

		initToolInfo: function() {

			$$('.colour-preview')[0].addEvent('click', function() {

				var r = $('picker-r').get('text').toInt() || 0;
				var g = $('picker-g').get('text').toInt() || 0;
				var b = $('picker-b').get('text').toInt() || 0;

				var colour = {};
				colour.rgb = [r, g, b];
				colour.hex = [r, g, b].rgbToHex();

				window.fireEvent('pickerChanged', colour);
			});
		}
	});
});
