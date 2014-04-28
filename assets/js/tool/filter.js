define(['undo', 'tool/tool'], function(UndoManager, Tool) {

	var filterIDS = ['Grayscale', 'Brightness', 'Threshold', 'Blur', 'Sharpen'];
	var filters = {};
	var currentFilter;
	var filterControl;

	return new Class ({
		Extends: Tool,
		initialize: function() {
			this.parent();

			filterIDS.each(function(filter) {
				require(['filter/' + filter], function(Filter) {
					filters['Filter' + filter] = new Filter();
				});
			});
		},

		activate: function(child) {
			this.parent();

			if(child && filters[child]) {
				currentFilter = filters[child];
			}

			this.map_ref = this.mapDragged.bind(this);
			window.addEvent('mapDrag', this.map_ref);
		},

		deactivate: function() {
			this.parent();

			window.addEvent('mapDrag', this.map_ref);
			this.map_ref = null;
		},

		refresh: function() {
			if(!currentFilter) return;

			if(currentFilter.hasPreview()) {

				var opacity = currentFilter.useOpacity == undefined ? true : currentFilter.useOpacity;

				currentFilter.drawPreview(currentFilter.getTempCanvas(), opacity);
				currentFilter.runFilter(currentFilter.getTempCanvas().getContext('2d'));
				currentFilter.displayPreview();
			}
		},

		mapDragged: function() {
			if(!currentFilter) return;

			if(currentFilter.hasPreview()) {
				var preview = currentFilter.getTempCanvas();
				var coords = $('canvas-container').getCoordinates($$('#canvas-container canvas.canvas')[0]);

				preview.setStyles({
					left:-(coords.left + 1),
					top:-(coords.top + 1)
				});
			}
		},

		getToolInfo: function() {
			return currentFilter.getInfo() +
				'<a id="filter-apply" class="btn">Apply</a>';
		},

		initToolInfo: function() {
			currentFilter.initInfo();
			$('filter-apply').addEvent('click', this.runFilter);
		},

		setFilter: function(filter) {

			if(currentFilter) {
				currentFilter.removeInfo();

				$$('#filters-list li.active')[0].removeClass('active');
			}

			currentFilter = filters[filter];
			$('filter-' + filter).addClass('active');

			filterControl.set('html', currentFilter.getInfo());
			currentFilter.initInfo();
		},

		runFilter: function() {
			if(!currentFilter) return;

			$('filter-apply').disabled = true;
			currentFilter.run();
			$('filter-apply').disabled = false;

			UndoManager.getInstance().saveState();
		},

		removeToolInfo: function() {

			$('filter-apply').removeEvent('click', this.runFilter);
			$$('#filter-controls', '#filter-apply').destroy();

			if(currentFilter != null) {
				currentFilter.removeInfo();
				currentFilter = null;
			}
		},

		getName: function() {
			return currentFilter.getName();
		}
	});
});
