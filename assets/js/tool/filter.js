define(['events', 'tool/tool'], function(Events, Tool) {
	var filterIDS = ['Grayscale', 'Brightness', 'Threshold', 'Blur', 'Sharpen'];

	function Filter() {
		this.currentFilter = null;
		this.filters = {};
		this.filterControl = null;
	}

	Filter.prototype = Object.create(Tool.prototype);
	Filter.prototype.constructor = Filter;

	Filter.prototype.init = function() {
		Tool.prototype.init.call(this);

		var self = this;
		filterIDS.each(function(filter) {
			require(['filter/' + filter], function(Filter) {
				self.filters['Filter' + filter] = new Filter();
			});
		});
	};

	Filter.prototype.activate = function(child) {
		Tool.prototype.activate.call(this);

		if(child && this.filters[child]) {
			this.currentFilter = this.filters[child];
		}

		this.map_ref = this.mapDragged.bind(this);
		Events.on(Events.MAP_DRAGGED, this.map_ref);
	};

	Filter.prototype.deactivate = function() {
		Tool.prototype.deactivate.call(this);

		Events.off(Events.MAP_DRAGGED, this.map_ref);
		this.map_ref = null;
	};

	Filter.prototype.refresh = function() {
		if(!this.currentFilter) return;

		if(this.currentFilter.hasPreview()) {
			var opacity = this.currentFilter.useOpacity == undefined ? true : this.currentFilter.useOpacity;

			this.currentFilter.drawPreview(this.currentFilter.getTempCanvas(), opacity);
			this.currentFilter.runFilter(this.currentFilter.getTempCanvas().getContext('2d'));
			this.currentFilter.displayPreview();
		}
	};

	Filter.prototype.mapDragged = function() {
		if(!this.currentFilter) return;

		if(this.currentFilter.hasPreview()) {
			var preview = this.currentFilter.getTempCanvas();
			var coords = $('canvas-container').getCoordinates($$('#canvas-container canvas.canvas')[0]);

			preview.setStyles({
				left:-(coords.left + 1),
				top:-(coords.top + 1)
			});
		}
	};

	Filter.prototype.getToolInfo = function() {
		return this.currentFilter.getInfo() +
			'<a id="filter-apply" class="btn">Apply</a>';
	};

	Filter.prototype.initToolInfo = function() {
		this.currentFilter.initInfo();
		$('filter-apply').addEvent('click', this.runFilter.bind(this));
	};

	Filter.prototype.setFilter = function(filter) {
		if(this.currentFilter) {
			this.currentFilter.removeInfo();

			$$('#filters-list li.active')[0].removeClass('active');
		}

		this.currentFilter = this.filters[filter];
		$('filter-' + filter).addClass('active');

		this.filterControl.set('html', this.currentFilter.getInfo());
		this.currentFilter.initInfo();
	};

	Filter.prototype.runFilter = function() {
		if(!this.currentFilter) return;

		$('filter-apply').disabled = true;
		this.currentFilter.run();
		$('filter-apply').disabled = false;

		Events.trigger(Events.SAVE_STATE);
	};

	Filter.prototype.removeToolInfo = function() {
		$('filter-apply').removeEvent('click', this.runFilter);
		$$('#filter-controls', '#filter-apply').destroy();

		if(this.currentFilter != null) {
			this.currentFilter.removeInfo();
			this.currentFilter = null;
		}
	};

	Filter.prototype.getName = function() {
		return this.currentFilter.getName();
	};

	return Filter;
});
