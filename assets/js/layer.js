define(['events'], function(Events) {
	var data = {};
	var LayerManager;

	return new Class({

		initialize: function(name, layerManager) {

			this.uid = String.uniqueID();
			data[this.uid] = {};

			LayerManager = layerManager.getInstance();

			var canvas = new Element('canvas', {'class': 'canvas', width: layerManager.width, height: layerManager.height});
			var li = new Element('li');
			var li_text = new Element('div', { html: name, 'class': 'text' });
			var li_hide = new Element('div', { 'class': 'hide layer-visible'});
			var li_del = new Element('div', { 'class': 'delete'});
			var container = $('layers-container');

			canvas.width = layerManager.width;
			canvas.height = layerManager.height;

			$('canvas-container').adopt(canvas);
			li.adopt(li_text);
			li.adopt(li_del);
			li.adopt(li_hide);
			container.insertBefore(li, container.getFirst());

			this.clickRef = this.clickEvent.bind(this);
			this.delRef = this.deleteEvent.bind(this);
			this.hideRef = this.hide.bind(this);
			this.dblClickRef = this.dblClickEvent.bind(this);

			li_text.addEvent('click', this.clickRef);
			li_text.addEvent('dblclick', this.dblClickRef);
			li_del.addEvent('click', this.delRef);
			li_hide.addEvent('click', this.hideRef);
			li.store('ref', this);

			this.set('name', name);
			this.set('menu', li);
			this.set('canvas', canvas);
			this.set('data', '');
			this.set('width', layerManager.width);
			this.set('height', layerManager.height);
			this.set('hidden', false);
			this.set('opacity', 1.0);

			this.draw();
		},

		get: function(key) {
			return data[this.uid][key] || null;
		},

		set: function(key, value) {
			data[this.uid][key] = value;
		},

		activate: function() {
			this.get('menu').addClass('selected');
		},

		deactivate: function() {
			this.get('menu').removeClass('selected');
		},

		remove: function() {

			var manager = LayerManager.getInstance();

			this.get('menu').getChildren('div.hide')[0].removeEvent('click', this.hideRef);
			this.get('menu').getChildren('div.delete')[0].removeEvent('click', this.delRef);
			this.get('menu').getChildren('div.text')[0].removeEvent('dblclick', this.dblClickRef);
			this.get('menu').getChildren('div.text')[0].removeEvent('click', this.clickRef);

			delete this.clickRef;
			delete this.delRef;
			delete this.hideRef;
			delete this.dblClickRef;

			this.get('canvas').getContext('2d').clearRect(0, 0, manager.width, manager.height);
			this.get('canvas').width = this.get('canvas').height = 1;

			this.get('menu').eliminate('ref');
			this.get('menu').destroy();
			this.get('canvas').destroy();
		},

		draw: function() {

			var context = this.get('canvas').getContext('2d');
			var layer = LayerManager.getInstance();

			context.fillStyle = "rgba(255,255,255,0.01)";
			context.fillRect(0, 0, layer.width, layer.height);
		},

		hide: function() {

			if(!this.get('hidden')) {
				this.set('hidden', true);
				this.get('menu').getChildren('div.hide').addClass('layer-hidden').removeClass('layer-visible');
				this.get('canvas').setStyle('visibility', 'hidden');
			}
			else {
				this.set('hidden', false);
				this.get('menu').getChildren('div.hide').addClass('layer-visible').removeClass('layer-hidden');
				this.get('canvas').setStyle('visibility', null);
			}
		},

		isHidden: function() {
			return this.get('hidden');
		},

		clickEvent: function() {
			clearTimeout(this.clickTimer);

			this.clickTimer = setTimeout(function() {
				LayerManager.getInstance().setActiveLayer(this);
			}.bind(this), 100);
		},

		deleteEvent: function() {
			LayerManager.getInstance().removeLayer(this);
		},

		dblClickEvent: function() {
			clearTimeout(this.clickTimer);

			this.get('menu').getChildren('div.text')[0].set('html', '<input type="text" id="rename-layer" value="' + this.get('name') + '" maxlength="30" />');
			this.renameEventRef = this.renameEvent.bind(this);

			var rename = $('rename-layer');

			rename.focus();
			rename.addEvent('keydown', this.renameEventRef);
		},

		renameEvent: function(e) {

			var text = this.get('menu').getChildren('div.text')[0];
			var rename = $('rename-layer');

			if(e.code == 13) {
				this.set('name', rename.get('value'));
				text.set('text', this.get('name'));

				rename.removeEvent('keydown', this.renameEventRef);
				rename.destroy();

				Events.trigger(Events.SAVE_STATE);
			}
		}
	});
});
