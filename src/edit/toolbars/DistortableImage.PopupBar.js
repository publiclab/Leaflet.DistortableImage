L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
  },

  initialize(latlng, options) {
    L.setOptions(this, options);
    L.Toolbar2.Popup.prototype.initialize.call(this, latlng, options);
  },

  addHooks(map, ov) {
    this.map = map;
    this.ov = ov;
  },

  tools() {
    if (this._ul) {
      return this._ul.children;
    }
  },

  clickTool(name) {
    const tools = this.tools();
    for (let i = 0; i < tools.length; i++) {
      const tool = tools.item(i).children[0];
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
    L.OpacitiesAction,
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

  const a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableImage.edit(this, {actions: a});
});
