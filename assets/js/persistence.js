var Persistance = (function() {

	var lightboxLoad, lightboxSave, lightboxUpload, uploadRef;
	var currentImage = {};
	// var loading = false;

	return new Class({

		ignoreUnload: false,

		Static: {
			instance: null,
			getInstance: function() {
				if(this.instance == null) {
					this.instance = new Persistance();
				}

				return this.instance;
			}
		},

		save: function() {

			CeraBoxWindow.loading(lightboxSave);

			$$('.cerabox-content .btnImageSave')[0].disabled = true;
			
			var layerManager = LayerManager.getInstance();
			var layers = layerManager.getLayers();
			var layer, temp;

			var saveData = {};
			saveData.layers = [];
			saveData.thumb = layerManager.flatten(100, 100);
			saveData.width = layerManager.width;
			saveData.height = layerManager.height;
			saveData.name = currentImage.name;
			saveData.desc = currentImage.desc;
			saveData.publish = currentImage.publish;

			if(currentImage != null && currentImage.id != 0) {
				saveData.id = currentImage.id;
			}

			if(saveData.publish) {
				saveData.display = layerManager.flatten(800, 800);

				/*if(layerManager.width > 800 || layerManager.height > 800) {
					saveData.fullsize = layerManager.flatten(layerManager.width, layerManager.height);
				}*/
			}

			$$('#layers-container li').reverse().each(function(el, order) {

				layer = el.retrieve('ref');

				temp = {};
				temp.name = layer.get('name');
				temp.data = encodeURIComponent(layer.get('canvas').toDataURL());
				temp.opacity = layer.get('opacity');
				temp.order = order;

				saveData.layers.push(temp);
			});

			var request = new Request.JSON({
				url: 'save/',
				method: 'post',
				onComplete: function(data) {
					
					$$('.cerabox-content .btnImageSave')[0].disabled = false;
					CeraBoxWindow.hideLoader();

					if(data.success) {
						currentImage.id = data.imageId;
						CeraBoxWindow.close(true);
					}
					else {
						$$('.cerabox-content .modal-message')[0].set('text', data.message);
					}
				}.bind(this),
				onFailure: function() {
					$$('.cerabox-content .modal-message')[0].set('text', 'There was an error saving the image');
				}
			});

			request.send('data=' + JSON.encode(saveData));
		},

		load: function(id) {

			CeraBoxWindow.loading(lightboxLoad);

			var request = new Request.JSON({
				url: 'load/',
				method: 'post',
				onRequest: function() {
					$$('#user-images button').each(function(el) {
						el.disabled = true;
					});
				},
				onComplete: function(data) {
					var layerManager = LayerManager.getInstance();

					if(!data.success) {
						alert('Error loading image: ' + data.message);
						CeraBoxWindow.hideLoader();

						$$('#user-images button').each(function(el) {
							el.disabled = false;
						});

						return;
					}

					if(!data.layers.length) {
						alert('Error loading image: This image has become corrupted');
						CeraBoxWindow.hideLoader();

						$$('#user-images button').each(function(el) {
							el.disabled = false;
						});

						return;
					}

					var width = layerManager.width;
					var height = layerManager.height;

					layerManager.width = data.width;
					layerManager.height = data.height;
					
					layerManager.clear();
					// UndoManager.getInstance().clear();
					CeraBoxWindow.hideLoader();

					// currentImage.id = id;
					// currentImage.name = data.name;
					// currentImage.desc = data.desc;
					// currentImage.publish = data.publish;

					this.setCurrentImage(id, data.name, data.desc, data.publish);

					var numLayers = data.layers.length;
					var loadedLayers = 0;
					var timer;

					// var tempLayer = layerManager.addLayer('Layer 1');
					// UndoManager.getInstance().saveState();
					// layerManager.clear();

					data.layers.each(function(item) {
						var layer = layerManager.addLayer(item.name);

						var img = new Image();
						img.src = item.data;

						img.onload = function() {
							var context = layer.get('canvas').getContext('2d');

							context.fillStyle = "rgba(255,255,255,0.01)";
							context.fillRect(0, 0, layer.width, layer.height);
							context.drawImage(img, 0, 0);

							layer.set('opacity', parseFloat(item.opacity));

							layerManager.getOpacitySlider().set(parseFloat(item.opacity) * 100);

							loadedLayers++;
						};
					});
					
					timer = setInterval(function() {

						if(loadedLayers != numLayers) return;

						Toolbar.getInstance().setTool('ToolPaint');
					
						resizeLayout(data.width, data.height);
						CeraBoxWindow.close(true);

						clearInterval(timer);

						UndoManager.getInstance().saveState();
					}, 500);
				}.bind(this)
			});

			request.send('id=' + id);
		},

		loadAll: function() {

			var request = new Request.JSON({
				url: 'load/all',
				method: 'post',
				onRequest: function() {
					CeraBoxWindow.loading(lightboxLoad);
				},
				onFailure: function() {
					var error = new Element('div', { text: 'There was an error loading your images' , 'class':'load-error'});
					$$('.cerabox-content').adopt(error);
					return;
				},
				onComplete: function() {
					setTimeout(function() {
						CeraBoxWindow.hideLoader()
					}, 500);
				},
				onSuccess: function(data) {

					if(data.success) {

						if(data.images.length == 0) {
							// $$('.cerabox-content').set('text', 'No images to load');


							var error = new Element('div', { text: 'No Images to Load' , 'class':'load-error'});
							$$('.cerabox-content').adopt(error);
							return;
						}

						var ul = new Element('ul', { id: "user-images" });
						var self = this;

						data.images.each(function(img) {

							var link = img.thumb ? img.thumb.link : 'images/20x20.png';
							var width = img.thumb ? img.thumb.width : 100;
							var height = img.thumb ? img.thumb.height : 100;

							var li = new Element('li', { id: 'loadli-' + img.id });
							var imgPreview = new Element('div', { 'class':'load-preview' }).grab(new Element('img', { src:link, width:width, height:height }));
							var content = new Element('div', { html: img.name, 'class':'load-content' });

							var l = new Element('div', { 'class':'left' });
							var r = new Element('div', { 'class':'right' })
							
							var loadButton = new Element('button', { text: 'Load', id: 'load-' + img.id, 'class': 'btn load-image' });
							var viewButton = new Element('button', { text: 'View', id: 'view-' + img.id, 'class': 'btn view-image' });
							var deleteButton = new Element('button', { text: 'Delete', id: 'delete-' + img.id, 'class': 'btn delete-image' });

							// var loadButton = new Element('a', { text: 'Load', id: 'load-' + img.id, 'class': 'btn load-image' });
							// var viewButton = new Element('a', { text: 'View', id: 'view-' + img.id, 'class': 'btn view-image' });
							// var deleteButton = new Element('a', { text: 'Delete', id: 'delete-' + img.id, 'class': 'btn delete-image' });
							
							var icons = new Element('div', { 'class':'load-icons' }).adopt(deleteButton, viewButton, loadButton);

							if(img.published != 1) {
								viewButton.destroy();
							}

							l.adopt(imgPreview);
							r.adopt(content);
							r.adopt(icons);

							li.grab(l);
							li.grab(r);

							ul.adopt(li);

							li.addEvents({
								mouseenter: function() {
									this.getElements('button').setStyle('display', 'inline');
									this.getElements('button.load-image')[0].addEvent('click', self.loadImage);
									// this.getElements('button.load-image')[0].addEvent('click', self.loadImage);
									this.getElements('button.delete-image')[0].addEvent('click', self.deleteImage);
									this.addEvent('dblclick', self.loadImage);

									var view = this.getElements('button.view-image')[0];

									if(view) {
										view.addEvent('click', self.viewImage);
									}
								},

								mouseleave: function() {
									this.getElements('button').setStyle('display', 'none');
									this.getElements('button.load-image')[0].removeEvent('click', self.loadImage);
									this.getElements('button.delete-image')[0].removeEvent('click', self.deleteImage);
									this.removeEvent('dblclick', self.loadImage);

									var view = this.getElements('button.view-image')[0];

									if(view) {
										view.removeEvent('click', self.viewImage);
									}
								}
							});
						});

						$$('.cerabox-content').adopt(ul);
						
						loadContent = $$('.cerabox-content')[0];
						loadContent.addClass('scrollbar');

						scroll = new ScrollBars(loadContent, {
							scrollBarSize:10,
							barOverContent:true,
							fade:false
						});

						scroll.updateScrollBars();
					}
					else {
						alert('Sorry, there was an error loading your images: ' + data.message);
					}
				}.bind(this)
			});

			request.send();
		},

		exportJPG: function() {
			this.exportImage('jpeg');
		},

		exportPNG: function() {
			this.exportImage('png');
		},

		exportImage: function(type) {
			var manager = LayerManager.getInstance();
			var data = manager.flatten(manager.width, manager.height, type);

			window.open(data, '_blank', 'height=' + (manager.height + 20) + ',width=' + (manager.width + 20));
		},

		init: function() {

			// currentImage.id = 0;
			// currentImage.name = '';
			// currentImage.desc = '';
			// currentImage.publish = false;

			this.setCurrentImage(0, '', '', false);

			var size = $(window).getSize();
			var self = this;

			var loadAllWidth = (Math.floor((size.x - 100) / 313) * 313) + 20;
			var loadAllHeight = (Math.floor((size.y - 100) / 110) * 110) + 20;

			if(loadAllWidth < 300) loadAllWidth = 300;
			if(loadAllHeight < 300) loadAllHeight = 300;
			
			lightboxLoad = new CeraBox($$('#btnLoad'), {
				width:loadAllWidth,
				height:loadAllHeight,
				displayTitle:false,
				fullSize:true,
				events: {
					onOpen: function() {
						Persistance.getInstance().loadAll();
					},
					onChange: function() {
						Persistance.getInstance().loadAll();
					}
				}
			});

			lightboxSave = new CeraBox($$('#btnSave'), {
				width:440,
				height:365,
				fullSize:true,
				displayTitle:false,
				events: {
					onOpen: function() {

						$$('.cerabox-content input[name=name]')[0].set('value', currentImage.name);
						$$('.cerabox-content textarea[name=description]')[0].set('value', currentImage.desc);
						$$('.cerabox-content input[type=checkbox]')[0].set('checked', currentImage.publish);

						$$('.cerabox-content input[name=name]')[0].focus()
						
						$$('.cerabox-content .btnImageSave')[0].addEvent('click', function() {

							currentImage.name = $$('.cerabox-content input[name=name]')[0].get('value').trim();
							currentImage.desc = $$('.cerabox-content textarea[name=description]')[0].get('value').trim();
							currentImage.publish = $$('.cerabox-content input[type=checkbox]')[0].get('checked');

							if(currentImage.name == '') {
								$$('.cerabox-content .modal-message')[0].set('text', 'Please provide an image name');
								return;
							}

							Persistance.getInstance().save();
						});
					}
				}
			});

			lightboxUpload = new CeraBox($$('#btnUpload'), {
				width:500,
				height:230,
				fullSize:true,
				displayTitle:false,
				events: {
					onOpen: function() {

						if(uploadRef == null) {
							var uploadId = $$('.cerabox-content input[type=file]')[0];
							var form = $$('.cerabox-content form')[0];

							var upload = new Form.Upload(uploadId, {
								fireAtOnce: true,
								onComplete: self.postImageUpload
							});

							// This works, but has just been disabled for the moment.
							if(!upload.isModern()) {
								var form = $$('.cerabox-content form')[0];

								new iFrameFormRequest(form, {
									onRequest: function() {
										$$('.cerabox-content div.modal-message')[0].set('text', 'Uploading image...');
										CeraBoxWindow.loading(lightboxUpload);
									},
									onComplete: function(response) {
										self.postImageUpload(response);
									},
									onFailure: function() {
										$$('.cerabox-content div.modal-message')[0].set('text', 'There was an error uploading the file');
									}
								});
							}
						}
					}
				}
			});

			$('btnNew').addEvent('click', function(e) {
				e.stop();

				var open = confirm('Are you sure you want to close this image and open antoher?');

				if(open) {
					var manager = LayerManager.getInstance();
					var undo = UndoManager.getInstance();

					manager.clear();
					undo.clear();
					
					this.setCurrentImage(0, '', '', false);

					initLayout();

					manager.addLayer('Layer 1');
					Toolbar.getInstance().refreshTool();

					$('file-list').setStyle('display', 'none');

					undo.saveState();
				}
			}.bind(this));

			$('btnExportJPG').addEvent('click', this.exportJPG.bind(this));
			$('btnExportPNG').addEvent('click', this.exportPNG.bind(this));

			window.onbeforeunload = function(e) {
				if(this.ignoreUnload) return;
				if(UndoManager.getInstance().getList().length <= 1) return;

				return 'You have an open image - Are you sure you want to leave?';
			}.bind(this);
		},

		postImageUpload: function(response) {
			response = JSON.decode(response);

			if(response.success) {
				
				var layerManager = LayerManager.getInstance();
				var img = new Image();
				var newLayer = $$('.cerabox-content .chkCurrentImage')[0].get('checked');
				var max_width, max_height;

				img.src = response.message;

				img.onload = function() {
					// layerManager.clear();
					// UndoManager.getInstance().clear();
					// UndoManager.getInstance().saveState();
					// should probably reset currentImage here

					if(newLayer) {
						max_width = layerManager.width;
						max_height = layerManager.height;
					}
					else {
						max_width = MAX_WIDTH != 0 ? MAX_WIDTH : response.width;
						max_height = MAX_HEIGHT != 0 ? MAX_HEIGHT : response.height;
					}

					var size = resize(response.width, response.height, max_width, max_height);

					img.width = size.width;
					img.height = size.height;
					
					if(newLayer) {
						var layer = layerManager.addLayer('Layer ' + (layerManager.getLayers().length + 1));
					}
					else {
						layerManager.clear();
						resizeLayout(size.width, size.height);
						var layer = layerManager.addLayer('Layer 1');

						UndoManager.getInstance().clear();
						UndoManager.getInstance().saveState();
						Persistance.getInstance().setCurrentImage(0, '', '', false);
					}

					layer.get('canvas').getContext('2d').drawImage(img, 0, 0, size.width, size.height);
					UndoManager.getInstance().saveState();

					CeraBoxWindow.hideLoader();
					CeraBoxWindow.close(true);

					Toolbar.getInstance().setTool('ToolPaint');
				}
			}
			else {

				$$('.cerabox-content div.modal-message')[0].set('text', response.message);
				$$('.cerabox-content div.uploadProgress')[0].setStyle('display', 'none');

				// $$('.cerabox-content div.uploadMessage')[0].set('text', response.message);
				// $$('.cerabox-content div.uploadProgress')[0].setStyle('display', 'none');

				CeraBoxWindow.hideLoader();
			}
		},

		loadImage: function() {
			var id = this.get('id').split('-')[1] || null;

			Persistance.getInstance().load(id);
		},

		deleteImage: function() {
			var id = this.get('id').split('-')[1] || null;

			var request = new Request.JSON({
				url: 'delete',
				method: 'post',
				onRequest: function() {
					CeraBoxWindow.loading(lightboxLoad);
					this.disabled = true;
					$('load-' + id).disabled = true;
					if($('view-' + id)) $('view-' + id).disabled = true;
				}.bind(this),
				onComplete: function() {
					setTimeout(function() {
						CeraBoxWindow.hideLoader();
					}, 500);
				},
				onSuccess: function(data) {
					
					if(data.success) {
						this.getParent('li').destroy();
					}
					else {
						alert('Error deleting image: ' + data.message);
					}
				}.bind(this)
			});

			if(confirm('Are you sure you want to delete this image?')) {
				request.send('id=' + id);
			}
		},

		viewImage: function() {
			var id = this.get('id').split('-')[1] || null;

			// window.location = document.URL + 'view/' + id;

			$('view-link').set('href', document.URL + 'view/' + id);
			$('view-link').click();
		},

		setCurrentImage: function(id, name, desc, publish) {
			currentImage.id = id;
			currentImage.name = name;
			currentImage.desc = desc;
			currentImage.publish = publish;
		},

		getCurrentImage: function() {
			return currentImage;
		}
	});

})();