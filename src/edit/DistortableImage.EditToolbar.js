L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
  initialize: function(map, overlay, options) {
    this._overlay = overlay;
    this._map = map;

    LeafletToolbar.ToolbarAction.prototype.initialize.call(this, options);
  }
}),
  
  ToggleTransparency = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var edit = overlay.editing,
        href,
        tooltip;
      
      if (edit._transparent) {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#opacity"></use>';
        tooltip = 'Make Image Opaque';
      } else {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#opacity-empty"></use>';
        tooltip = 'Make Image Transparent';
      }

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: tooltip
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
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
        href,
        tooltip;
      
      if (edit._outlined) {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#border_clear"></use>';
        tooltip = 'Remove Border';
      } else {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#border_outer"></use>';
        tooltip = 'Add Border';
      }

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: tooltip
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleOutline();
      this.disable();
    }
  }),

  Delete = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#delete_forever"></use>';

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Delete Image'
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._removeOverlay();
      this.disable();
    }
  }),

  ToggleLock = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var edit = overlay.editing,
        href,
        tooltip;

      if (edit._mode === 'lock') {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#unlock"></use>';
        tooltip = 'Unlock';
      } else {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#lock"></use>';
        tooltip = 'Lock';
      }

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
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
        href,
        tooltip;

      if (edit._mode === 'rotateScale') {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#transform"></use>';
        tooltip = 'Distort';
      } else {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#crop_rotate"></use>';
        tooltip = 'Rotate+Scale';
      }

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
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

  Export = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var  href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#get_app"></use>';

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Export Image'
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._getExport();
      this.disable();
    }
  }),

  ToggleOrder = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var edit = overlay.editing,
        href,
        tooltip;

      if (edit._toggledImage) {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#flip_to_front"></use>';
        tooltip = 'Stack to Front';
      } else {
        href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#flip_to_back"></use>';
        tooltip = 'Stack to Back';
      }

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: tooltip
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
    initialize: function(map, overlay, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#explore"></use>';

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Geolocate Image'
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var image = this._overlay.getElement();

      EXIF.getData(image, L.EXIF(image));
    }
  }),

  Restore = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#restore"></use>';

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Restore'
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._restore();
      this.disable();
    }
  });

L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
  options: {
    actions: [
      ToggleTransparency,
      ToggleOutline,
      ToggleLock,
      ToggleRotateScale,
      ToggleOrder,
      EnableEXIF,
      Restore,
      Export,
      Delete
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
