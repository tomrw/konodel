/*
---

name: Form.Upload
description: Create a multiple file upload form
license: MIT-style license.
authors: Arian Stolwijk
requires: [Form.MultipleFileInput, Request.File]
provides: Form.Upload

...
*/
if (!this.Form) this.Form = {};
var Form = this.Form;

define(['layer-manager'], function(LayerManager) {

	Form.Upload = new Class({
		Implements: [Options, Events],

		options: {
			dropMsg: 'Drag your image here',
			fireAtOnce: false,
			onComplete: function(){
				// reload
				window.location.href = window.location.href;
			}
		},

		initialize: function(input, options){
			input = this.input = document.id(input);
			input.set('id', 'uploadClick');

			this.setOptions(options);
			this.uploading = false;

			var layerManager = LayerManager.getInstance();
			var maxLayers = layerManager.getLayerLimit();

			if(maxLayers != 0 && maxLayers == layerManager.getLayers().length) {
				var checkbox = input.getParent('form').getChildren('div.uploadLayer .chkCurrentImage')[0];
				checkbox.disabled = true;
				checkbox.set('checked', false);
			}

			// Our modern file upload requires FormData to upload
			if ('FormData' in window) {
				this.modernUpload(input);
			}
			else {
				this.legacyUpload(input);
			}
		},

		modernUpload: function(input) {

			this.modern = true;

			var form = input.getParent('form');
			var self = this;

			var drop = form.getChildren('div.uploadContainer div.uploadDrop')[0];
			var click = form.getChildren('div.uploadContainer div.uploadClick')[0];
			var progressContainer = form.getChildren('div.uploadProgress')[0];
			var progress = form.getElements('div.uploadProgressBar')[0];

			var uploadReq = new Request.File({
				url: form.get('action'),
				onRequest: function() {
					progress.setStyles.pass({display: 'block', width: 0}, progress);
					progressContainer.setStyle('display', 'block');

					this.uploading = true;
					drop.removeClass('hover');
				}.bind(this),
				onProgress: function(event){
					var loaded = event.loaded, total = event.total;
					progress.setStyle('width', parseInt(loaded / total * 100, 10).limit(0, 100) + '%');
				},
				onComplete: function(){
					progress.setStyle('width', '100%');
					self.fireEvent('complete', Array.slice(arguments));

					this.uploading = false;
				}.bind(this)
			});

			var inputname = input.get('name');

			var inputFiles = new Form.MultipleFileInput(input, drop, {
				onDragenter: drop.addClass.pass('hover', drop),
				onDragleave: drop.removeClass.pass('hover', drop),
				onDrop: function(){
					if(this.uploading) return;
					drop.removeClass.pass('hover', drop);
					if (self.options.fireAtOnce){
						self.submit(inputFiles, inputname, uploadReq);
					}
				}.bind(this),
				onChange: function(){
					if(this.uploading) return;
					if (self.options.fireAtOnce){
						self.submit(inputFiles, inputname, uploadReq);
					}
				}.bind(this)
			});

			click.addEvent('click', function() {
				if(this.uploading) return;
				$('uploadClick').click();
			}.bind(this));

			form.addEvent('submit', function(event) {
				if(this.uploading) return;
				if (event) event.preventDefault();
				self.submit(inputFiles, inputname, uploadReq);
			}.bind(this));
		},

		submit: function(inputFiles, inputname, uploadReq){
			uploadReq.append(inputname, inputFiles.getFile());
			uploadReq.send();
		},

		legacyUpload: function(input) {

			var form = input.getParent('form');
			if (!form) return;

			var self = this;
			var container = form.getChildren('div.uploadContainer')[0];
			var click = form.getChildren('div.uploadContainer div.uploadClick')[0];
			var drop = form.getChildren('div.uploadContainer div.uploadDrop')[0];
			var submit = form.getChildren('input[type=submit]')[0];
			var file = form.getChildren('input[type=file]')[0];

			drop.destroy();
			click.destroy();
			container.destroy();
			file.setStyle('visibility', 'visible');

			$('uploadClick').addEvent('change', function() {
				form.getChildren('input[type=submit]')[0].click();
			});

		},

		isModern: function(){
			return !!this.modern;
		}

	});

});


	/*
	---

	name: Request.File
	description: Uploading files with FormData
	license: MIT-style license.
	authors: [Arian Stolwijk, Djamil Legato]
	requires: [Request]
	provides: Request.File
	credits: https://gist.github.com/a77b537e729aff97429c

	...
	*/

	(function(){

	var progressSupport = ('onprogress' in new Browser.Request());

	Request.File = new Class({

		Extends: Request,

		options: {
			emulation: false,
			urlEncoded: false
		},

		initialize: function(options){
			this.xhr = new Browser.Request();
			this.formData = new FormData();
			this.setOptions(options);
			this.headers = this.options.headers;
		},

		append: function(key, value){
			this.formData.append(key, value);
			return this.formData;
		},

		reset: function(){
			this.formData = new FormData();
		},

		send: function(options){
			if (!this.check(options)) return this;

			this.options.isSuccess = this.options.isSuccess || this.isSuccess;
			this.running = true;

			var xhr = this.xhr;
			if (progressSupport){
				xhr.onloadstart = this.loadstart.bind(this);
				xhr.onprogress = this.progress.bind(this);
				xhr.upload.onprogress = this.progress.bind(this);
			}

			xhr.open('POST', this.options.url, true);
			xhr.onreadystatechange = this.onStateChange.bind(this);

			Object.each(this.headers, function(value, key){
				try {
					xhr.setRequestHeader(key, value);
				} catch (e){
					this.fireEvent('exception', [key, value]);
				}
			}, this);

			this.fireEvent('request');
			xhr.send(this.formData);

			if (!this.options.async) this.onStateChange();
			if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
			return this;
		}

	});

})();


/*
---

name: Form.MultipleFileInput
description: Create a list of files that has to be uploaded
license: MIT-style license.
authors: Arian Stolwijk
requires: [Element.Event, Class, Options, Events]
provides: Form.MultipleFileInput

...
*/

Object.append(Element.NativeEvents, {
	dragenter: 2, dragleave: 2, dragover: 2, dragend: 2, drop: 2
});

if (!this.Form) this.Form = {};

Form.MultipleFileInput = new Class({

	Implements: [Options, Events],

	options: {
		itemClass: 'uploadItem'/*,
		onAdd: function(file){},
		onRemove: function(file){},
		onEmpty: function(){},
		onDragenter: function(event){},
		onDragleave: function(event){},
		onDragover: function(event){},
		onDrop: function(event){}*/
	},

	// _files: [],
	file: null,

	// initialize: function(input, list, drop, options){
	initialize: function(input, drop, options){
		input = this.element = document.id(input);
		// list = this.list = document.id(list);
		drop = this.drop = document.id(drop);

		this.setOptions(options);

		var name = input.get('name');
		if (name.slice(-2) != '[]') input.set('name', name + '[]');
		// input.set('multiple', true);

		this.inputEvents = {
			change: function(event){
				Array.each(input.files, this.add, this);
				this.fireEvent('change', event);
			}.bind(this)
		};

		this.dragEvents = drop && (typeof document.body.draggable != 'undefined') ? {
			dragenter: this.fireEvent.bind(this, 'dragenter'),
			dragleave: this.fireEvent.bind(this, 'dragleave'),
			dragend: this.fireEvent.bind(this, 'dragend'),
			dragover: function(event){
				event.preventDefault();
				this.fireEvent('dragover', event);
			}.bind(this),
			drop: function(event){
				event.preventDefault();
				var dataTransfer = event.event.dataTransfer;
				if (dataTransfer) Array.each(dataTransfer.files, this.add, this);
				this.fireEvent('drop', event);
			}.bind(this)
		} : null;

		this.attach();
	},

	attach: function(){
		this.element.addEvents(this.inputEvents);
		if (this.dragEvents) this.drop.addEvents(this.dragEvents);
	},

	detach: function(){
		this.input.removeEvents(this.inputEvents);
		if (this.dragEvents) this.drop.removeEvents(this.dragEvents);
	},

	add: function(file) {
		// this._files.push(file);

		this.file = file;

		/*var self = this;
		new Element('li', {
			'class': this.options.itemClass
		}).grab(new Element('span', {
			text: file.name
		})).grab(new Element('a', {
			text: 'x',
			href: '#',
			events: {click: function(e){
				e.preventDefault();
				self.remove(file);
			}}
		})).inject(this.list);
		this.fireEvent('add', file);*/
		return this;
	},

	remove: function() {
		this.fireEvent('remove', this.file);
		return this;
	},

	/*remove: function(file){
		var index = this._files.indexOf(file);
		if (index == -1) return this;
		this._files.splice(index, 1);
		// this.list.childNodes[index].destroy();
		this.fireEvent('remove', file);
		if (!this._files.length) this.fireEvent('empty');
		return this;
	},*/

	/*getFiles: function(){
		return this._files;
	},*/

	getFile: function() {
		return this.file;
	}

});


/*
---
description: This class gives you a method to upload files 'the ajax way'

license: MIT-style

authors:
- Arian Stolwijk

requires: [Class, Options, Events, Element, Element.Event, Element.Style]

provides: [Element.iFrameFormRequest, iFrameFormRequest]

...
*/

/**
 * @author Arian Stolwijk
 * Idea taken from http://www.webtoolkit.info/ajax-file-upload.html
 */

var iFrameFormRequest = new Class({

	Implements: [Options, Events],

	options: {
		eventName: 'submit'
	},

	initialize: function(form, options){
		this.setOptions(options);
		var frameId = this.frameId = String.uniqueID();
		var loading = false;

		this.form = document.id(form);

		this.formEvent = function(){
			loading = true;
			this.fireEvent('request');
		}.bind(this);

		this.iframe = new IFrame({
			name: frameId,
			styles: {
				display: 'none'
			},
			src: 'about:blank',
			events: {
				load: function() {
					if (loading){
						var doc = this.iframe.contentWindow.document;
						if (doc && doc.location.href != 'about:blank'){
							this.fireEvent('complete', doc.body.innerHTML);
						} else {
							this.fireEvent('failure');
						}
						loading = false;
					}
				}.bind(this)
			}
		}).inject(document.body);

		this.attach();
	},

	send: function() {
		this.form.submit();
	},

	attach: function(){
		this.target = this.form.get('target');
		this.form.set('target', this.frameId)
			.addEvent(this.options.eventName, this.formEvent);
	},

	detach: function(){
		this.form.set('target', this.target)
			.removeEvent(this.options.eventName, this.formEvent);
	},

	toElement: function(){
		return this.iframe;
	}

});

Element.implement('iFrameFormRequest', function(options){
	this.store('iFrameFormRequest', new iFrameFormRequest(this, options));
	return this;
});