L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
  }
});

L.distortableImage.popupBar = function(latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function() {
  /** Default actions */
  this.ACTIONS = [
    L.RotateScaleAction,
    L.DistortAction,
    L.LockAction,
    L.OpacityAction,
    L.ToggleBorderAction,
    L.ToggleOrderAction,
    L.RevertAction,
    L.ExportAction,
    L.DeleteAction
  ];

if (this.options.actions) { /* (`this` being DistortableImageOverlay, not the toolbar) */
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }

  this.editing = new L.DistortableImage.Edit(this, { actions: this.editActions });
});