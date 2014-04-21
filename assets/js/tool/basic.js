var ToolPaint = (function() {
	return new Class ({

		Extends: Tool,

		currentX:0,
		currentY:0,
		lastX:10,
		lastY:0,
		drawing:false,
		undo:true,
		name:'Paint',

		brushWidth:10,
		brushColour:"#000000",

		points:[],

		initialize: function() {
			this.parent();

			window.addEvent('pickerChanged', this.pickerChanged.bind(this));
		},

		activate: function() {

			MousePointer.getInstance().showOutline();
			MousePointer.getInstance().setOutlineWidth(this.brushWidth);

			$('canvas-container').addEvents({
				mousedown: function(e) {

					if(this.layer.isHidden()) {
						LayerManager.getInstance().layerHiddenWarning(this.layer);
						return;
					}

					var pos = this.canvas.getPosition();

					this.drawing = true;
					this.lastX = e.page.x - pos.x;
					this.lastY = e.page.y - pos.y;
					
					this.context.beginPath();
					this.context.arc(this.lastX, this.lastY, this.brushWidth / 2, 0, 2 * Math.PI, false);
					this.context.lineWidth = 1;
					this.context.strokeStyle = this.brushColour;
					this.context.fillStyle = this.brushColour;
					this.context.fill();
					this.context.stroke();

					if(this.brushWidth < 3) {
						this.points = [[this.lastX, this.lastY]];
					}

				}.bind(this),

				mouseenter: function() {
					this.undo = true;
				}.bind(this)
			});

			this.mouseup_ref = this.mouseup.bind(this);
			$(window).addEvent('mouseup', this.mouseup_ref);
		},

		deactivate: function() {
			this.parent();
			$(window).removeEvent('mouseup', this.mouseup_ref);
		},

		bresenham: function() {

			var manager = LayerManager.getInstance();
			var data = this.context.getImageData(0, 0, manager.width, manager.height);
			var x0, y0, x1, y1;
			var colour = new Color(this.brushColour);

			for(var i = 1; i < this.points.length; ++i) {
				x0 = this.points[i - 1][0];
				x1 = this.points[i][0];
				y0 = this.points[i - 1][1];
				y1 = this.points[i][1];

				this.drawBresenhamLine(data, x0, y0, x1, y1, colour[0], colour[1], colour[2]);
			}

			this.context.putImageData(data, 0, 0);
		},

		drawBresenhamLine: function(data, x0, y0, x1, y1, r, g, b) {

			var manager = LayerManager.getInstance();

			var dx = Math.abs(x1 - x0);
			var dy = Math.abs(y1 - y0);
			var sx = x0 < x1 ? 1 : -1;
			var sy = y0 < y1 ? 1 : -1;
			var error = dx - dy;
			var e2, index;
			var width = manager.width;

			while(true) {
				index = (x0 + y0 * width) * 4;

				data.data[index] = r;
				data.data[index + 1] = g;
				data.data[index + 2] = b;
				data.data[index + 3] = 255;

				if (x0 == x1 && y0 == y1) break;

				e2 = error * 2;
				
				if(e2 > -dy) { 
					error -= dy;
					x0 += sx; 
				}

				if(e2 < dx) {
					error += dx;
					y0 += sy;
				}
			}
		},

		mousemove: function(e) {

			if(!this.drawing) return;

			var pos = this.canvas.getPosition();

			this.currentX = e.page.x - pos.x;
			this.currentY = e.page.y - pos.y;

			if(this.lastX == -1) {
				this.lastX = this.currentX;
				this.lastY = this.currentY;
			}

			this.context.beginPath();
			this.context.lineWidth = this.brushWidth;
			this.context.lineCap = "round";
			this.context.strokeStyle = this.brushColour;
			this.context.moveTo(this.lastX, this.lastY);
			// this.context.lineTo(this.currentX, this.currentY);

			var x = (this.lastX + this.currentX) / 2;
			var y = (this.lastY + this.currentY) / 2;

			// this.context.quadraticCurveTo(this.currentX, this.currentY, x, y);
			this.context.quadraticCurveTo(x, y, this.currentX, this.currentY);//, x, y);

			this.context.stroke();

			if(this.brushWidth < 3) {
				this.points.push([this.currentX, this.currentY]);
			}

			this.lastX = this.currentX;
			this.lastY = this.currentY;
		},

		mouseleave: function(e) {
			this.lastX = -1;
			this.lastY = -1;
			this.undo = false;

			if(this.brushWidth < 3) {
				this.bresenham();
				this.points = [];
			}
		},

		mouseup: function() {
			this.drawing = false;

			if(this.brushWidth < 3) {
				this.bresenham();
				this.points = [];
			}

			if(this.undo) {
				UndoManager.getInstance().saveState();
			}
		},

		getToolInfo: function() {
			return '<a id="choose-colour" class="colour-preview-text"><div class="colour-preview" style="background-color:' + this.brushColour + '"></div>Choose colour</a><br />' + 
				'<h3>Brush Size</h3>' +
				'<div id="brush-size" class="slider"><div class="knob"></div></div>';
		},

		initToolInfo: function() {
			$('choose-colour').addEvent('click', function(e) {
				$('colour-picker').fireEvent('click', e);
			});

			new Slider($('brush-size'), $('brush-size').getElement('.knob'), {
				initialStep: this.brushWidth,
				range: [1, 100],
				onChange: function(step) {
					this.brushWidth = step;

					if(step > 10) {
						var pointer = MousePointer.getInstance();
						pointer.setOutlineWidth(step);
						pointer.showOutline();
					}
					else {
						MousePointer.getInstance().hideOutline();
					}

				}.bind(this)
			});
		},

		removeToolInfo: function() {
			$('choose-colour').removeEvents();
		},

		pickerChanged: function(colour) {
			this.brushColour = colour.hex;
		}
	});
})();

var ToolFill = (function() {
	return new Class({

		Extends: Tool,

		working:false,
		fillRGB:[0,0,0],
		name:'Fill',

		initialize: function() {
			this.parent();
			window.addEvent('pickerChanged', this.pickerChanged.bind(this));
		},

		activate: function() {
			$('canvas-container').addEvents({
				click: function(e) {

					if(this.layer.isHidden()) {
						LayerManager.getInstance().layerHiddenWarning(this.layer);
						return;
					}
				
					var pos = this.canvas.getPosition();
					var currentX = e.page.x - pos.x;
					var currentY = e.page.y - pos.y;

					this.fill(currentX, currentY);
				}.bind(this)
			});
		},

		fill: function(_x, _y) {

			if(this.working) return;
			this.working = true;

			var layer = LayerManager.getInstance();
			var width = layer.width;
			var height = layer.height;

			var data = this.context.getImageData(0, 0, width, height);
			var rgb = this.context.getImageData(_x, _y, 1, 1).data;
			var fillRGB = this.fillRGB;

			var r = rgb[0];
			var g = rgb[1];
			var b = rgb[2];

			// console.log("Start colour: " + r, g, b);

			if(fillRGB[0] == r && fillRGB[1] == g && fillRGB[2] == b) {
				this.working = false;
				return;
			}

			// var start = new Date().getTime();

			/*var q = [[x, y]];
			var index, n, iterations = 0;

			while(q.length > 0) {
				n = q.pop();

				_x = n[0];
				_y = n[1];

				if(_x < 0 || _y < 0 || _x >= width || _y >= height) continue;

				index = (_x + _y * width) * 4;
				
				if(this.canFill(data, index, r, g, b)) {
					data.data[index] = fillRGB[0];
					data.data[index + 1] = fillRGB[1];
					data.data[index + 2] = fillRGB[2];
					data.data[index + 3] = 255;

					if(x > 0) q.push([_x - 1, _y]);
					if(x < width) q.push([_x + 1, _y]);
					if(y > 0) q.push([_x, _y - 1]);
					if(y < height) q.push([_x, _y + 1]);
				}
			}*/

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

					// set(x, y, 0, 0, 0);
					// setPixel(index);
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

					// set(x, y, 0, 0, 0);
					// setPixel(index);
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

			// var elapsed = new Date().getTime() - start;
			// console.log("Finished: " + elapsed);

			this.context.putImageData(data, 0, 0);
			this.working = false;

			UndoManager.getInstance().saveState();
		},

		matches: function(data, index, r, g, b) {

			var r1 = data.data[index];
			var g1 = data.data[index + 1];
			var b1 = data.data[index + 2];

			return r1 == r && g == g1 && b == b1;
		},

		canFill: function(data, index, r, g, b) {

			// if((data.data[index] == r && data.data[index + 1] == g && data.data[index + 2] == b) || (data.data[index + 3] != 255 && data.data[index + 3] > 2)) {
			if((data.data[index] == r && data.data[index + 1] == g && data.data[index + 2] == b)) {
				return true;
			}
			
			return false;
		},

		getToolInfo: function() {
			return '<a id="choose-colour" class="colour-preview-text"><div class="colour-preview" style="background-color:' + ('rgb(' + this.fillRGB[0] + ',' + this.fillRGB[1] + ',' + this.fillRGB[2] + ')').rgbToHex() + '"></div>Choose colour</a><br />';
				// + '<h3>Tolerance</h3>'
				// + '<div id="fill-tolerance" class="slider"><div class="knob"></div></div>';
		},

		initToolInfo: function() {
			$('choose-colour').addEvent('click', function(e) {
				$('colour-picker').fireEvent('click', e);
			});

			/*new Slider($('fill-tolerance'), $('fill-tolerance').getElement('.knob'), {
				initialStep: 50,
				range: [0, 255],
				onChange: function(step) {
					this.tolerance = step;
				}.bind(this)
			});*/
		},

		removeToolInfo: function() {
			$('choose-colour').removeEvents();
		}
	});
})();

var ToolPicker = (function() {

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
})();

var ToolEraser = (function() {
	return new Class({

		Extends: Tool,

		currentX:0,
		currentY:0,
		lastX:10,
		lastY:0,
		drawing:false,
		undo:true,
		name:'Eraser',

		brushWidth:10,

		activate: function() {

			MousePointer.getInstance().showOutline();
			MousePointer.getInstance().setOutlineWidth(this.brushWidth);

			$('canvas-container').addEvents({
				mousedown: function(e) {

					if(this.layer.isHidden()) {
						LayerManager.getInstance().layerHiddenWarning(this.layer);
						return;
					}
					
					var pos = this.canvas.getPosition();
					var orig = this.context.globalCompositeOperation;

					this.drawing = true;
					this.lastX = e.page.x - pos.x;
					this.lastY = e.page.y - pos.y;

					this.context.globalCompositeOperation = "destination-out";
					this.context.beginPath();
					this.context.arc(this.lastX, this.lastY, this.brushWidth / 2, 0, 2 * Math.PI, false);
					this.context.strokeStyle = "rgba(0,0,0,1)";
					this.context.fill();
					this.context.lineWidth = 1;
					this.context.lineCap = "round";
					this.context.stroke();

					this.context.globalCompositeOperation = orig;

				}.bind(this),

				mouseenter: function() {
					this.undo = true;
				}.bind(this)
			});

			this.mouseup_ref = this.mouseup.bind(this);
			$(window).addEvent('mouseup', this.mouseup_ref);
		},

		deactivate: function() {
			this.parent();
			$(window).removeEvent('mouseup', this.mouseup_ref);
		},

		mousemove: function(e) {

			if(!this.drawing) return;

			var pos = this.canvas.getPosition();
			var orig = this.context.globalCompositeOperation;

			this.currentX = e.page.x - pos.x;
			this.currentY = e.page.y - pos.y;

			if(this.lastX == -1) {
				this.lastX = this.currentX;
				this.lastY = this.currentY;
			}

			this.context.globalCompositeOperation = "destination-out";
			this.context.beginPath();

			this.context.strokeStyle = "rgba(0,0,0,1)";
			this.context.lineWidth = this.brushWidth;
			this.context.lineCap = "round";
			this.context.moveTo(this.lastX, this.lastY);
			this.context.lineTo(this.currentX, this.currentY);
			this.context.stroke();

			this.context.globalCompositeOperation = orig;

			this.lastX = this.currentX;
			this.lastY = this.currentY;
		},

		mouseleave: function(e) {
			this.lastX = -1;
			this.lastY = -1;
			this.undo = false;
		},

		mouseup: function() {
			this.drawing = false;

			var layer = LayerManager.getInstance();
			var data = this.context.getImageData(0, 0, layer.width, layer.height);
			var it = layer.width * layer.height * 4;

			for(var i = 0; i < it; i += 4) {
				if(data.data[i + 3] == 0) {
					data.data[i] = 255;
					data.data[i + 1] = 255;
					data.data[i + 2] = 255;
					data.data[i + 3] = 1;
				}
			}

			this.context.putImageData(data, 0, 0);

			if(this.undo) {
				UndoManager.getInstance().saveState();
			}
		},

		getToolInfo: function() {
			return '<h3>Brush Size</h3>' +
				'<div id="brush-size" class="slider"><div class="knob"></div></div>';
		},

		initToolInfo: function() {
			new Slider($('brush-size'), $('brush-size').getElement('.knob'), {
				initialStep: this.brushWidth,
				range: [1, 100],
				onChange: function(step) {
					this.brushWidth = step;
					
					if(step > 10) {
						MousePointer.getInstance().setOutlineWidth(step);
						MousePointer.getInstance().showOutline();
					}
					else {
						MousePointer.getInstance().hideOutline();
					}

				}.bind(this)
			});
		}
	});
})();