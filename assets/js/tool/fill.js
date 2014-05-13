define(['events', 'layer-manager', 'tool/tool'],
	function(Events, LayerManager, Tool) {

	function Fill() {
		this.working = false;
		this.fillRGB = [0,0,0];
		this.name = 'Fill';
	}

	Fill.prototype = Object.create(Tool.prototype);
	Fill.prototype.constructor = Fill;

	Fill.prototype.init = function() {
		Tool.prototype.init.call(this);
		Events.on(Events.COLOUR_PICKER_CHANGED, this.pickerChanged.bind(this));
	};

	Fill.prototype.activate = function() {
		$('canvas-container').addEvents({
			click: function(e) {

				if(this.layer.isHidden()) {
					LayerManager.layerHiddenWarning(this.layer);
					return;
				}

				var pos = this.canvas.getPosition();
				var currentX = e.page.x - pos.x;
				var currentY = e.page.y - pos.y;

				this.fill(currentX, currentY);
			}.bind(this)
		});
	};

	Fill.prototype.fill = function(_x, _y) {
		if(this.working) {
			return;
		}

		this.working = true;

		var width = LayerManager.width;
		var height = LayerManager.height;
		var data = this.context.getImageData(0, 0, width, height);
		var rgb = this.context.getImageData(_x, _y, 1, 1).data;
		var fillRGB = this.fillRGB;

		var r = rgb[0];
		var g = rgb[1];
		var b = rgb[2];

		if(fillRGB[0] == r && fillRGB[1] == g && fillRGB[2] == b) {
			this.working = false;
			return;
		}

		var q = [[_x, _y]];
		var index, n, x, y, reachLeft, reachRight;

		while(q.length) {
			n = q.pop();

			x = n[0];
			y = n[1];


			index = ((x + y * width) * 4);

			while(y-- >= 0 && this.matches(data, index, r, g, b)) { // TODO: match colour
				index -= width * 4;
			}

			index += width * 4;
			y++;
			reachLeft = false;
			reachRight = false;

			while(y++ < height - 1 && this.matches(data, index, r, g, b)) { // TODO: match colour
				data.data[index] = fillRGB[0];
				data.data[index + 1] = fillRGB[1];
				data.data[index + 2] = fillRGB[2];
				data.data[index + 3] = 255;

				if(x > 0) {
					if(this.matches(data, index - 4, r, g, b)) { // TODO: match colour
						if(!reachLeft) {
							q.push([x - 1, y]);
							reachLeft = true;
						}
					}
					else if(reachLeft) {
						reachLeft = false;
					}
				}

				if(x < width - 1) {
					if(this.matches(data, index + 4, r, g, b)) { // TODO: match colour
						if(!reachRight) {
							q.push([x + 1, y]);
							reachRight = true;
						}
						else if(reachRight) {
							reachRight = false;
						}
					}
				}

				index += width * 4;

				data.data[index] = fillRGB[0];
				data.data[index + 1] = fillRGB[1];
				data.data[index + 2] = fillRGB[2];
				data.data[index + 3] = 255;

				if(x > 0) {
					if(this.matches(data, index - 4, r, g, b)) { // TODO: match colour
						if(!reachLeft) {
							q.push([x - 1, y]);
							reachLeft = true;
						}
					}
					else if(reachLeft) {
						reachLeft = false;
					}
				}

				if(x < width - 1) {
					if(this.matches(data, index + 4, r, g, b)) { // TODO: match colour
						if(!reachRight) {
							q.push([x + 1, y]);
							reachRight = true;
						}
						else if(reachRight) {
							reachRight = false;
						}
					}
				}

				index += width * 4;
			}
		}

		this.context.putImageData(data, 0, 0);
		this.working = false;

		Events.trigger(Events.SAVE_STATE);
	};

	Fill.prototype.matches = function(data, index, r, g, b) {

		var r1 = data.data[index];
		var g1 = data.data[index + 1];
		var b1 = data.data[index + 2];

		return r1 == r && g == g1 && b == b1;
	};

	Fill.prototype.canFill = function(data, index, r, g, b) {
		if((data.data[index] == r && data.data[index + 1] == g && data.data[index + 2] == b)) {
			return true;
		}

		return false;
	};

	Fill.prototype.getToolInfo = function() {
		return '<a id="choose-colour" class="colour-preview-text"><div class="colour-preview" style="background-color:' + ('rgb(' + this.fillRGB[0] + ',' + this.fillRGB[1] + ',' + this.fillRGB[2] + ')').rgbToHex() + '"></div>Choose colour</a><br />';
	};

	Fill.prototype.initToolInfo = function() {
		$('choose-colour').addEvent('click', function(e) {
			$('colour-picker').fireEvent('click', e);
		});
	};

	Fill.prototype.removeToolInfo = function() {
		$('choose-colour').removeEvents();
	};

	return Fill;
});
