L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
  },
});

L.distortableImage.popupBar = function(latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function() {
  /** Default actions */
  this.ACTIONS = [
    L.ScaleAction,
    L.DistortAction,
    L.RotateAction,
    L.FreeRotateAction,
    L.LockAction,
    L.OpacityAction,
    L.BorderAction,
    L.StackAction,
    L.ExportAction,
    L.DeleteAction,
  ];

  var a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableImage.edit(this, {actions: a});
});

