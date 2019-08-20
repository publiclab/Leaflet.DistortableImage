L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
    // /* all possible actions */
    // actions: [
    //   ToggleTransparency,
    //   ToggleOutline,
    //   ToggleLock,
    //   ToggleRotateScale,
    //   ToggleOrder,
    //   EnableEXIF,
    //   Revert,
    //   Export,
    //   Delete,
    //   ToggleScale,
    //   ToggleRotate
    // ]
  },

  // hasScale: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(ToggleScale) === 1;
  // },

  // hasRotate: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(ToggleRotate) === 1;
  // },

  // hasRotateScale: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(ToggleRotateScale) === 1;
  // },

  // hasTransparency: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(ToggleTransparency) === 1;
  // },

  // hasRevert: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(Revert) === 1;
  // },

  // hasDelete: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(Delete) === 1;
  // },

  // hasOrder: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(ToggleOrder) === 1;
  // },

  // hasLock: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(ToggleLock) === 1;
  // },

  // hasEXIF: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(EnableEXIF) === 1;
  // },

  // hasExport: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(Export) === 1;
  // },

  // hasOutline: function() {
  //   var overlay = this._arguments[1];
  //   return overlay.editing.editActions.indexOf(ToggleOutline) === 1;
  // }
});

L.distortableImage.popupBar = function(latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function() {
  /** Default actions */
  this.ACTIONS = [
    L.OpacityAction,
    L.EditAction.ToggleOutline,
    L.ToggleLockAction,
    L.EditAction.ToggleRotateScale,
    L.EditAction.ToggleOrder,
    L.RevertAction,
    L.ExportAction,
    L.DeleteAction,
  ];

  // (`this` being DistortableImageOverlay, not the toolbar)
  if (this.options.actions) { this.editActions = this.options.actions; }
  else { this.editActions = this.ACTIONS; }

  this.editing = new L.DistortableImage.Edit(this, {actions: this.editActions});
});
