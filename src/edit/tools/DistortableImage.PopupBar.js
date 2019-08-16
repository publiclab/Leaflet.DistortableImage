L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

var ToggleTransparency = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

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
    };

    L.DistortableImage.action_map.t = '_toggleTransparency';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'opacity_empty', 'opacity');
    L.IconUtil.toggleTitle(this._link,
        'Make Image Opaque',
        'Make Image Transparent');
    editing._toggleTransparency();
  },
});

var ToggleOutline = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

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
    };

    L.DistortableImage.action_map.o = '_toggleOutline';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'border_clear', 'border_outer');
    L.IconUtil.toggleTitle(this._link, 'Remove Border', 'Add Border');
    editing._toggleOutline();
  },
});

var Delete = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'delete_forever';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Delete Image',
    };

    L.DistortableImage.action_map.Backspace = '_removeOverlay'; // backspace windows / delete mac
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._removeOverlay();
  },
});

var ToggleLock = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

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
    };

    L.DistortableImage.action_map.l = '_toggleLock';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'unlock', 'lock');
    L.IconUtil.toggleTitle(this._link, 'Unlock', 'Lock');
    editing._toggleLock();
  },
});

var ToggleRotateScale = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

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
    };

    L.DistortableImage.action_map.d = '_toggleRotateScale';
    L.DistortableImage.action_map.r = '_toggleRotateScale';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'distort', 'crop_rotate');
    L.IconUtil.toggleTitle(this._link, 'Distort Image', 'Rotate+Scale Image');
    editing._toggleRotateScale();
  },
});

var Export = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'get_app';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Export Image',
    };

    L.DistortableImage.action_map.e = '_getExport';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._getExport();
  },
});

var ToggleOrder = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

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
    };

    L.DistortableImage.action_map.j = '_toggleOrder';
    L.DistortableImage.action_map.k = '_toggleOrder';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'flip_to_front', 'flip_to_back');
    L.IconUtil.toggleTitle(this._link, 'Stack to Front', 'Stack to Back');
    editing._toggleOrder();
  },
});

var EnableEXIF = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'explore';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Geolocate Image',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var image = this._overlay.getElement();

    // eslint-disable-next-line new-cap
    EXIF.getData(image, L.EXIF(image));
  },
});

var Revert = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'restore';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Restore Original Image Dimensions',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    this._overlay._revert();
  },
});

var ToggleRotate = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'rotate';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Rotate Image',
    };

    L.DistortableImage.action_map.CapsLock = '_toggleRotate';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleRotate();
  },
});

var ToggleScale = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'scale';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Scale Image',
    };

    L.DistortableImage.action_map.s = '_toggleScale';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleScale();
  },
});

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
    /* all possible actions */
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
      ToggleRotate,
    ],
  },
});

L.distortableImage.popupBar = function(latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function() {
  /** Default actions */
  this.ACTIONS = [
    ToggleTransparency,
    ToggleOutline,
    ToggleLock,
    ToggleRotateScale,
    ToggleOrder,
    Revert,
    Export,
    Delete,
  ];

  if (this.options.actions) { /* (`this` being DistortableImageOverlay, not the toolbar) */
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }

  this.editing = new L.DistortableImage.Edit(this, {actions: this.editActions});
});
