define(['pointer'], function(MousePointer) {

	var tools = {};
	var activeTool = '';
	var container = '#tools';

	return (function() {
		var instance;

		return {
			getInstance: function() {
				if (!instance) {
					instance = true;
					this.init();
				}

				return this;
			},

			init: function() {
				$$(container + " li").each(function(item, index) {
					var id = item.get('id');
					var self = this;

					if(id != null) {
						var base = id.indexOf('Tool') != -1 ? 'tool' : 'filter';
						var toolName = id.replace(new RegExp(base, 'gi'), '').toLowerCase();
						require([base + '/' + toolName], function(Tool) {
							var tool = new Tool();
							tools[id] = tool;

							if(!item.hasClass('isParent')) {
								item.addEvent('click', function() {
									this.setTool(id);
								}.bind(self));
							}
						});
					}
				}.bind(this));
			},

			setTool: function(tool) {
				var newTool = tool;

				if(tools[tool] != undefined && tool != activeTool) {
					if(activeTool) {
						tools[activeTool].deactivate();
						tools[activeTool].removeToolInfo();

						$('canvas-container').removeEvent('mousemove', tools[activeTool].mousemove);

						MousePointer.getInstance().hide();
						MousePointer.getInstance().hideOutline();

						$(activeTool).removeClass('active');
						$$(container + ' li.hasParent').removeClass('active')
					}

					if($(tool).hasClass('hasParent')) {

						$(tool).addClass('active');
						tool = $(tool).getParent('li').get('id');

						tools[tool].activate(newTool);
					}
					else {
						tools[tool].activate();
					}

					activeTool = tool;

					var html = tools[tool].getToolInfo();

					if(html) {
						$('tool-options-name').set('text', tools[tool].getName() + ' Options');
						$('tool-options-content').set('html', html);
					}
					else {
						$('tool-options-name').set('text', '');
						$('tool-options-content').set('html', '');
					}

					$(activeTool).addClass('active');

					tools[tool].initToolInfo();

					$('canvas-container').addEvents({
						mousemove: function(e) {
							MousePointer.getInstance().draw(e);
							tools[tool].mousemove(e);
						},
						mouseleave: function() {
							MousePointer.getInstance().hide();
							tools[tool].mouseleave();
						}
					});
				}

				return activeTool;
			},

			getTool: function() {
				return activeTool ? activeTool : null;
			},

			refreshTool: function() {
				if(activeTool) {
					tools[activeTool].refresh();
				}
			}
		}
	})();
});