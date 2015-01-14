L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = L.ToolbarAction.extend({
		initialize: function(map, overlay, options) {
			this._overlay = overlay;
			this._map = map;

			L.ToolbarAction.prototype.initialize.call(this, options);
		}
	}),

	ToggleTransparency = EditOverlayAction.extend({
		options: { toolbarIcon: { 
			html: '<span class="fa fa-adjust"></span>',
			tooltip: 'Toggle Image Transparency',
			title: 'Toggle Image Transparency'	
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleTransparency();
			this.disable();
		}
	}),

	ToggleOutline = EditOverlayAction.extend({
		options: { toolbarIcon: { 
			html: '<span class="fa fa-square-o"></span>',
			tooltip: 'Toggle Image Outline',
			title: 'Toggle Image Outline'
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleOutline();
			this.disable();
		}
	}),

	RemoveOverlay = EditOverlayAction.extend({
		options: { toolbarIcon: { 
			html: '<span class="fa fa-trash"></span>',
			tooltip: 'Delete image',
			title: 'Delete image'
		}},

		addHooks: function() {
			var map = this._map;

			map.removeLayer(this._overlay);
			this.disable();
		}
	}),

	ToggleEditable = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-lock"></span>',
			tooltip: 'Lock / Unlock editing',
			title: 'Lock / Unlock editing'			
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleLock();
			this.disable();
		}
	}),

	ToggleRotateDistort = EditOverlayAction.extend({
		initialize: function(map, overlay, options) {
			var icon = overlay.editing._mode === 'rotate' ? 'image' : 'rotate-left';

			options = options || {};
			options.toolbarIcon = {
				html: '<span class="fa fa-' + icon + '"></span>',
				tooltip: 'Rotate',
				title: 'Rotate'	
			};

			EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
		},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleRotateDistort();
			this.disable();
		}
	});

L.DistortableImage.EditToolbar = L.Toolbar.Popup.extend({
	options: {
		actions: [
			ToggleTransparency,
			RemoveOverlay,
			ToggleOutline,
			ToggleEditable,
			ToggleRotateDistort
		]
	},

	/* Remove the toolbar after each action. */
	_getActionConstructor: function(Action) {
		var A = Action.extend({
			removeHooks: function() {
				var map = this._map;

				map.removeLayer(this.toolbar);
			}
		});

		return L.Toolbar.prototype._getActionConstructor.call(this, A);
	}
});
