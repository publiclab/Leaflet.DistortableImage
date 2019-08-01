L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

var ToggleTransparency = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use, tooltip;
    
    if (edit._transparent) {
      use = 'opacity';
      tooltip = 'Make Image Opaque';
    } else {
      use = 'opacity_empty';
      tooltip = 'Make Image Transparent';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: 'ToggleTransparency',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'opacity_empty', 'opacity');
    L.IconUtil.toggleTooltip(this._link, 'Make Image Opaque', 'Make Image Transparent');
    editing._toggleTransparency();
  }
});

var ToggleOutline = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use, tooltip;
    
    if (edit._outlined) {
      use = 'border_clear';
      tooltip = 'Remove Border';
    } else {
      use = 'border_outer';
      tooltip = 'Add Border';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: 'ToggleOutline',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'border_clear', 'border_outer');
    L.IconUtil.toggleTooltip(this._link, 'Remove Border', 'Add Border');
    editing._toggleOutline();
  }
});

var Delete = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'delete_forever';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Delete Image',
      className: 'Delete'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._removeOverlay();
  }
});

var ToggleLock = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use, tooltip;

    if (edit._mode === 'lock') {
      use = 'unlock';
      tooltip = 'Unlock';
    } else {
      use = 'lock';
      tooltip = 'Lock';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: 'ToggleLock'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.DomEvent.on(window, "keydown", this._onKeyDown, this);

    L.IconUtil.toggleXlink(this._link, 'unlock', 'lock');
    L.IconUtil.toggleTooltip(this._link, 'Unlock', 'Lock');
    editing._toggleLock();
  }
});

var ToggleRotateScale = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use, tooltip;

    if (edit._mode === 'rotateScale') {
      use = 'distort';
      tooltip = 'Distort Image';
    } else {
      use = 'crop_rotate';
      tooltip = 'Rotate+Scale Image';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: 'ToggleRotateScale'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'distort', 'crop_rotate');
    L.IconUtil.toggleTooltip(this._link, 'Distort Image', 'Rotate+Scale Image');
    editing._toggleRotateScale();
  }
});

var Export = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var  use = 'get_app';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Export Image',
      className: 'Export'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._getExport();
  }
});

var ToggleOrder = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use, tooltip;

    if (edit._toggledImage) {
      use = 'flip_to_front';
      tooltip = 'Stack to Front';
    } else {
      use = 'flip_to_back';
      tooltip = 'Stack to Back';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: 'ToggleOrder'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'flip_to_front', 'flip_to_back');
    L.IconUtil.toggleTooltip(this._link, 'Stack to Front', 'Stack to Back');
    editing._toggleOrder();
  }
});

var EnableEXIF = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'explore';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Geolocate Image',
      className: 'EnableExif'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var image = this._overlay.getElement();

    EXIF.getData(image, L.EXIF(image));
  }
});

var Revert = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'restore';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Restore Original Image Dimensions',
      className: 'Revert'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._revert();
  }
});

var ToggleRotate = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'rotate';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Rotate Image',
      className: 'ToggleRotate'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleRotate();
  }
});

var ToggleScale = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'scale';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Scale Image',
      className: 'ToggleScale'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleScale();
  }
});

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
    /** 
     * **all* possible actions *must* be included here or the keydown listener in EditAction.js will not work properly 
     * for any action. The actual actions that will be rendered are either *'this.ACTIONS'* (Default - look lower down) 
     * or the *'actions'* array passed during initialization, if specified by the user
     */
    actions: [
      ToggleTransparency,
      ToggleOutline,
      ToggleLock,
      ToggleRotateScale,
      ToggleOrder,
      EnableEXIF,
      Revert,
      Export,
      Delete,
      ToggleScale,
      ToggleRotate
    ]
  },
});

L.distortableImage.popupBar = function (latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function () {
  /** Default actions */
  this.ACTIONS = [
    ToggleTransparency, 
    ToggleOutline, 
    ToggleLock, 
    ToggleRotateScale, 
    ToggleOrder,
    Revert,
    Export,
    Delete
  ];

  if (this.options.actions) { /* ('this' being DistortablemageOverlay, not the toolbar) */
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }

  this.editing = new L.DistortableImage.Edit(this, { actions: this.editActions });

  if (this.options.editable) {
    L.DomEvent.on(this._image, "load", this.editing.enable, this.editing);
  }

  this.on('remove', function () {
    if (this.editing) { this.editing.disable(); }
  });
});
