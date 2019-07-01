L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

var ToggleTransparency = L.EditAction.extend({
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

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleTransparency();
  }
});

var ToggleOutline = L.EditAction.extend({
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

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleOutline();
  }
});

var Delete = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#delete_forever"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Delete Image'
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

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleLock();
  }
});

var ToggleRotateScale = L.EditAction.extend({
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

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleRotateScale();
  }
});

var Export = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var  href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#get_app"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Export Image'
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

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleOrder();
  }
});

var EnableEXIF = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#explore"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Geolocate Image'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var image = this._overlay.getElement();

    EXIF.getData(image, L.EXIF(image));
  }
});

var Restore = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#restore"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Restore'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._restore();
  }
});

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
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

L.distortableImage.popupBar = function (latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function () {
  this.ACTIONS = [
    ToggleTransparency, 
    ToggleOutline, 
    ToggleLock, 
    ToggleRotateScale, 
    ToggleOrder,
    EnableEXIF,
    Restore,
    Export,
    Delete
  ];

  if (this.options.actions) {
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
