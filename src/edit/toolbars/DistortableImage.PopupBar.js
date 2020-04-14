L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
  },

  initialize: function(latlng, options) {
    L.setOptions(this, options);
    L.Toolbar2.Popup.prototype.initialize.call(this, latlng, options);
  },

  addHooks: function(map, ov) {
    this.map = map;
    this.ov = ov;
  },

  tools: function() {
    if (this._ul) {
      return this._ul.children;
    }
  },

  clickTool: function(name) {
    var tools = this.tools();
    for (var i = 0; i < tools.length; i++) {
      var tool = tools.item(i).children[0];
      if (L.DomUtil.hasClass(tool, name)) {
        tool.click();
        return tool;
      }
    }
    return false;
  },
});

L.distortableImage.popupBar = function(latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function() {
  /** Default actions */
  this.ACTIONS = [
    L.DragAction,
    L.ScaleAction,
    L.DistortAction,
    L.RotateAction,
    L.FreeRotateAction,
    L.LockAction,
    L.OpacityAction,
    L.BorderAction,
    L.ExportAction,
    L.DeleteAction,
  ];

  // all possible modes
  L.DistortableImage.Edit.MODES = {
    drag: L.DragAction,
    scale: L.ScaleAction,
    distort: L.DistortAction,
    rotate: L.RotateAction,
    freeRotate: L.FreeRotateAction,
    lock: L.LockAction,
  };

  var a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableImage.edit(this, {actions: a});
});
