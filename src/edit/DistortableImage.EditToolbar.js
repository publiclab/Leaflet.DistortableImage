L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
    initialize: function(map, overlay, options) {
      this._overlay = overlay;
      this._map = map;

      LeafletToolbar.ToolbarAction.prototype.initialize.call(this, options);
    }
	}),
	
  ToggleTransparency = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<i class="material-icons md-18">opacity</i>',
        tooltip: 'Toggle Transparency'
      }
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleTransparency();
      this.disable();
    }
	}),
	
  ToggleOutline = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var edit = overlay.editing,
        icon = edit._outlined ? 'border_clear' : 'border_outer';

      options = options || {};
      options.toolbarIcon = {
        html: '<i class="material-icons md-18">' + icon + '</i>',
        tooltip: 'Toggle Outline'
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleOutline();
      this.disable();
    }
	}),
	
  RemoveOverlay = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<i class="material-icons md-18 red">delete_forever</i>',
        tooltip: 'Delete Image'
      }
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._removeOverlay();
      this.disable();
    }
	}),
	
  ToggleEditable = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var edit = overlay.editing,
        icon,
        tooltip;

      if (edit._mode === 'lock') {
        icon = 'lock_open';
        tooltip = 'Unlock';
      } else {
        icon = 'lock';
        tooltip = 'Lock';
      }

      options = options || {};
      options.toolbarIcon = {
        html: '<i class="material-icons-outlined md-18">' + icon + '</i>',
        tooltip: tooltip
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleLock();
      this.disable();
    }
	}),
	
  ToggleRotateScale = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
			var edit = overlay.editing,
				icon,
				tooltip; 

        if (edit._mode === 'rotateScale') {
					icon = 'transform';
					tooltip = 'Distort';
				} else {
					icon = 'crop_rotate';
					tooltip = 'Rotate+Scale';
				}

      options = options || {};
      options.toolbarIcon = {
        html: '<i class="material-icons md-18">' + icon + '</i>',
        tooltip: tooltip
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleRotateScale();
      this.disable();
    }
	}),
	
  ToggleExport = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<i class="material-icons md-18">get_app</i>',
        tooltip: 'Export Image'
      }
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleExport();
      this.disable();
    }
	}),
	
  ToggleOrder = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var edit = overlay.editing,
        icon = edit._toggledImage ? 'flip_to_front' : 'flip_to_back';

      options = options || {};
      options.toolbarIcon = {
        html: '<i class="material-icons md-18">' + icon + '</i>',
        tooltip: 'Toggle Stacking Order'
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleOrder();
      this.disable();
    }
	}),
	
  EnableEXIF = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<i class="material-icons-outlined md-18">explore</i>',
        tooltip: 'Geocode Image'
      }
    },

    addHooks: function() {
      var image = this._overlay.getElement();

      EXIF.getData(image, L.EXIF(image));
    }
  });

L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
  options: {
    actions: [
      ToggleTransparency,
      ToggleOutline,
      ToggleEditable,
      ToggleRotateScale,
      ToggleOrder,
      EnableEXIF,
      ToggleExport,
      RemoveOverlay
    ]
  },

  // todo: move to some sort of util class, these methods could be useful in future
  _rotateToolbarAngleDeg: function(angle) {
    var div = this._container,
      divStyle = div.style;

    var oldTransform = divStyle.transform;

    divStyle.transform = oldTransform + "rotate(" + angle + "deg)";
    divStyle.transformOrigin = "1080% 650%";

    this._rotateToolbarIcons(angle);
  },

  _rotateToolbarIcons: function(angle) {
    var icons = document.querySelectorAll(".fa");

    for (var i = 0; i < icons.length; i++) {
      icons.item(i).style.transform = "rotate(" + -angle + "deg)";
    }
  }
});
