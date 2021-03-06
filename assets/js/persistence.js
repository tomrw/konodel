define(['events', 'layout', 'layer-manager', 'undo', 'tools', 'upload', 'utils/image'],
	function(Events, Layout, LayerManager, UndoManager, Toolbar, Upload, ImageUtils) {

	var lightboxLoad, lightboxSave, lightboxUpload, uploadRef;
	var currentImage = {};

	return (function() {
		var instance;
		var self;

		return {
			ignoreUnload: false,

			getInstance: function() {
				if (!instance) {
					instance = true;
					self = this;
				}

				return this;
			},

			save: function() {

				CeraBoxWindow.loading(lightboxSave);

				$$('.cerabox-content .btnImageSave')[0].disabled = true;

				var layers = LayerManager.getLayers();
				var layer, temp;

				var saveData = {};
				saveData.layers = [];
				saveData.thumb = LayerManager.flatten(100, 100);
				saveData.width = LayerManager.width;
				saveData.height = LayerManager.height;
				saveData.name = currentImage.name;
				saveData.desc = currentImage.desc;
				saveData.publish = currentImage.publish;

				if(currentImage != null && currentImage.id != 0) {
					saveData.id = currentImage.id;
				}

				if(saveData.publish) {
					saveData.display = LayerManager.flatten(800, 800);
				}

				$$('#layers-container li').reverse().each(function(el, order) {

					layer = el.retrieve('ref');

					temp = {};
					temp.name = layer.name;
					temp.data = encodeURIComponent(layer.canvas.toDataURL());
					temp.opacity = layer.opacity;
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

						var width = LayerManager.width;
						var height = LayerManager.height;

						LayerManager.width = data.width;
						LayerManager.height = data.height;

						LayerManager.clear();
						CeraBoxWindow.hideLoader();

						this.setCurrentImage(id, data.name, data.desc, data.publish);

						var numLayers = data.layers.length;
						var loadedLayers = 0;
						var timer;

						data.layers.each(function(item) {
							var layer = LayerManager.addLayer(item.name);

							var img = new Image();
							img.src = item.data;

							img.onload = function() {
								var context = layer.canvas.getContext('2d');

								context.fillStyle = "rgba(255,255,255,0.01)";
								context.fillRect(0, 0, layer.width, layer.height);
								context.drawImage(img, 0, 0);

								layer.opacity = parseFloat(item.opacity);
								LayerManager.getOpacitySlider().set(parseFloat(item.opacity) * 100);

								loadedLayers++;
							};
						});

						timer = setInterval(function() {
							if(loadedLayers != numLayers) return;

							Toolbar.getInstance().setTool('ToolPaint');

							Layout.resizeLayout(data.width, data.height);
							CeraBoxWindow.close(true);

							clearInterval(timer);

							Events.trigger(Events.SAVE_STATE);
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
				var data = LayerManager.flatten(LayerManager.width, LayerManager.height, type);
				window.open(data, '_blank', 'height=' + (LayerManager.height + 20) + ',width=' + (LayerManager.width + 20));
			},

			init: function() {
				this.setCurrentImage(0, '', '', false);

				var size = $(window).getSize();
				var self = this;

				Events.on(Events.IGNORE_UNLOAD, this.onIgnoreUnload.bind(this));

				var loadAllWidth = (Math.floor((size.x - 100) / 313) * 313) + 40;
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
							self.getInstance().loadAll();
						},
						onChange: function() {
							self.getInstance().loadAll();
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

								self.getInstance().save();
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
						LayerManager.clear();
						Events.trigger(Events.RESET_UNDO);

						this.setCurrentImage(0, '', '', false);

						Layout.initLayout();
						LayerManager.addLayer('Layer 1');
						Toolbar.getInstance().refreshTool();
						Events.trigger(Events.SAVE_STATE);
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
					var img = new Image();
					var newLayer = $$('.cerabox-content .chkCurrentImage')[0].get('checked');
					var max_width, max_height;

					img.src = response.message;

					img.onload = function() {
						if(newLayer) {
							max_width = LayerManager.width;
							max_height = LayerManager.height;
						}
						else {
							max_width = Layout.MAX_WIDTH != 0 ? Layout.MAX_WIDTH : response.width;
							max_height = Layout.MAX_HEIGHT != 0 ? Layout.MAX_HEIGHT : response.height;
						}

						var size = ImageUtils.resize(response.width, response.height, max_width, max_height);

						img.width = size.width;
						img.height = size.height;

						if(newLayer) {
							var layer = LayerManager.addLayer('Layer ' + (LayerManager.getLayers().length + 1));
						}
						else {
							LayerManager.clear();
							Layout.resizeLayout(size.width, size.height);
							var layer = LayerManager.addLayer('Layer 1');

							Events.trigger(Events.RESET_UNDO);
							Events.trigger(Events.SAVE_STATE);
							self.getInstance().setCurrentImage(0, '', '', false);
						}

						layer.canvas.getContext('2d').drawImage(img, 0, 0, size.width, size.height);
						Events.trigger(Events.SAVE_STATE);

						CeraBoxWindow.hideLoader();
						CeraBoxWindow.close(true);

						Toolbar.getInstance().setTool('ToolPaint');
					}
				}
				else {
					$$('.cerabox-content div.modal-message')[0].set('text', response.message);
					$$('.cerabox-content div.uploadProgress')[0].setStyle('display', 'none');

					CeraBoxWindow.hideLoader();
				}
			},

			loadImage: function() {
				var id = this.get('id').split('-')[1] || null;
				self.getInstance().load(id);
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
			},

			onIgnoreUnload: function(ignoreUnload) {
				this.ignoreUnload = ignoreUnload;
			}
		}
	})();
});
