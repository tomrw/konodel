define(function() {

	function resize(width, height, maxWidth, maxHeight) {
		var ratio = width / height;

		if(ratio == 1) {
			if(width > maxWidth) {
				w = maxWidth;
				h = maxHeight;
			}
			else {
				w = width;
				h = height;
			}
		}
		else if(ratio > 1) {
			w = width > maxWidth ? maxWidth : width;
			h = w / ratio;

			if(h > maxHeight) {
				h = maxHeight;
				w = h * ratio;
			}
		}
		else {
			h = height > maxHeight ? maxHeight : height;
			w = h * ratio;

			if(w > maxWidth) {
				w = maxWidth;
				h = w / ratio;
			}
		}

		return {
			width: w,
			height: h
		};
	}

	return {
		resize: resize
	}
});
