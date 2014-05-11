define(['events', '../../lib/moorainbow'], function(Events) {
	new MooRainbow('colour-picker', {
		onChange: function(colour) { 
			$$('.colour-preview').setStyle('background-color', colour.hex);
			Events.trigger(Events.COLOUR_PICKER_CHANGED, colour);
		},
		onComplete: function(colour) {
			$$('.colour-preview').setStyle('background-color', colour.hex);
			Events.trigger(Events.COLOUR_PICKER_CHANGED, colour);
		}
	});
});
