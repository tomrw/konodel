define(['filter/base'], function(Filter) {

	return new Class({
		Extends: Filter,

		name:'Grayscale',

		run: function() {
			var pixels, i, index, colour;
			var width = this.manager.width;
			var height = this.manager.height;

			this.getPixels().each(function(context) {
				pixels = context.getImageData(0, 0, width, height);

				for(i = 0; i < (pixels.data.length); i += 4) {
					colour = (pixels.data[i] + pixels.data[i + 1] + pixels.data[i + 2]) / 3;

					pixels.data[i] = colour;
					pixels.data[i + 1] = colour;
					pixels.data[i + 2] = colour;
				}

				context.putImageData(pixels, 0, 0);
			});
		}
	});
});
