L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.EDIT_TOOLBAR = [

	/* Toggle transparency. */
	function(map, overlay) {
		return L.DistortableImage.toolbarHandlerFor(overlay.editing._toggleTransparency, {
			html: '<span class="fa fa-adjust"></span>',
			title: 'Toggle Image Transparency'	
		}, overlay.editing);
	},

	/* Delete image. */
	function(map, overlay) {
		return L.DistortableImage.toolbarHandlerFor(function() {
			map.removeLayer(overlay);
		}, {
			html: '<span class="fa fa-trash"></span>',
			title: 'Delete image'
		}, overlay);
	},

	/* Toggle image outline. */
	function(map, overlay) {
		return L.DistortableImage.toolbarHandlerFor(overlay.editing._toggleOutline, {
			html: '<span class="fa fa-square-o"></span>',
			title: 'Toggle Image Outline'
		}, overlay.editing);
	},

	/* Toggle locked / unlocked state. */
	function(map, overlay) {
		return L.DistortableImage.toolbarHandlerFor(function() {
			if (this.enabled()) { this.disable(); }
			else { this.enable(); }
		}, {
			html: '<span class="fa fa-lock"></span>',
			title: 'Lock / Unlock editing'
		}, overlay.editing);
	},

	/* */
	function(map, overlay) {
		var icon = overlay.editing._mode ? 
			'image' : 
			'rotate-left';

		return L.DistortableImage.toolbarHandlerFor(overlay.editing._toggleRotateDistort, {
			html: '<span class="fa fa-' + icon + '"></span>',
			title: 'Rotate'
		}, overlay.editing);
	}
];

/* Shortcut for constructing a ToolbarHandler which executes a function and then finishes. */
L.DistortableImage.toolbarHandlerFor = function(fn, options, context) {
	var T = L.ToolbarHandler.extend({
		initialize: function(iconOptions) {
			L.setOptions(this, { 
				toolbarIcon: new L.ToolbarIcon(iconOptions)
			});
		},

		addHooks: function() {
			fn.call(context);
			this.disable();
		}
	});

	return new T(options);
};
