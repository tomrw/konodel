define(['events'], function(Events) {

	function Layer(name, layerManager) {
		this.name = name;
		this.data = '';
		this.width = layerManager.width;
		this.height = layerManager.height;
		this.hidden = false;
		this.opacity = 1.0;
		this.layerManager = layerManager;
	}

	Layer.prototype.init = function() {
		var layerManager = this.layerManager;
		var canvas = new Element('canvas', {'class': 'canvas', width: layerManager.width, height: layerManager.height});
		var li = new Element('li');
		var li_text = new Element('div', { html: this.name, 'class': 'text' });
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

		this.menu = li;
		this.canvas = canvas;

		this.draw();
	};

	Layer.prototype.activate = function() {
		this.menu.addClass('selected');
	};

	Layer.prototype.deactivate = function() {
		this.menu.removeClass('selected');
	};

	Layer.prototype.remove = function() {
		var manager = this.layerManager;

		this.menu.getChildren('div.hide')[0].removeEvent('click', this.hideRef);
		this.menu.getChildren('div.delete')[0].removeEvent('click', this.delRef);
		this.menu.getChildren('div.text')[0].removeEvent('dblclick', this.dblClickRef);
		this.menu.getChildren('div.text')[0].removeEvent('click', this.clickRef);

		delete this.clickRef;
		delete this.delRef;
		delete this.hideRef;
		delete this.dblClickRef;

		this.canvas.getContext('2d').clearRect(0, 0, manager.width, manager.height);
		this.canvas.width = this.canvas.height = 1;

		this.menu.eliminate('ref');
		this.menu.destroy();
		this.canvas.destroy();
	};

	Layer.prototype.draw = function() {
		var context = this.canvas.getContext('2d');
		var layer = this.layerManager;

		context.fillStyle = "rgba(255,255,255,0.01)";
		context.fillRect(0, 0, layer.width, layer.height);
	};

	Layer.prototype.hide = function() {
		if(!this.hidden) {
			this.hidden = true;
			this.menu.getChildren('div.hide').addClass('layer-hidden').removeClass('layer-visible');
			this.canvas.setStyle('visibility', 'hidden');
		}
		else {
			this.hidden = false;
			this.menu.getChildren('div.hide').addClass('layer-visible').removeClass('layer-hidden');
			this.canvas.setStyle('visibility', null);
		}
	};

	Layer.prototype.isHidden = function() {
		return this.hidden;
	};

	Layer.prototype.clickEvent = function() {
		clearTimeout(this.clickTimer);

		this.clickTimer = setTimeout(function() {
			this.layerManager.setActiveLayer(this);
		}.bind(this), 100);
	};

	Layer.prototype.deleteEvent = function() {
		this.layerManager.removeLayer(this);
	};

	Layer.prototype.dblClickEvent = function() {
		clearTimeout(this.clickTimer);

		this.menu.getChildren('div.text')[0].innerHTML = '<input type="text" id="rename-layer" value="' + this.name + '" maxlength="30" />';
		this.renameEventRef = this.renameEvent.bind(this);

		var rename = $('rename-layer');

		rename.focus();
		rename.addEvent('keydown', this.renameEventRef);
	};

	Layer.prototype.renameEvent = function(e) {
		var text = this.menu.getChildren('div.text')[0];
		var rename = $('rename-layer');

		if(e.code == 13) {
			this.name = rename.value;
			text.innerText = this.name;

			rename.removeEvent('keydown', this.renameEventRef);
			rename.destroy();

			Events.trigger(Events.SAVE_STATE);
		}
	};

	return Layer;
});
