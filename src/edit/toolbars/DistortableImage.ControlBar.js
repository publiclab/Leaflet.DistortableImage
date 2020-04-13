L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.group_action_map = {};

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({});

L.distortableImage.controlBar = function(options) {
  return new L.DistortableImage.ControlBar(options);
};

/** addInitHooks run before onAdd */
L.DistortableCollection.addInitHook(function() {
  /** Default actions */
  this.ACTIONS = [
    L.ExportAction,
    L.DeleteAction,
    L.LockAction,
    L.UnlockAction,
  ];

  // all possible modes
  L.DistortableCollection.Edit.MODES = {
    lock: L.LockAction,
    unlock: L.UnlockAction,
  };

  var a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableCollection.edit(this, {actions: a});
});
