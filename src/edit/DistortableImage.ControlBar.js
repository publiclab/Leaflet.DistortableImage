L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.group_action_map = {};

L.UnlocksAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'unlock',
      tooltip: 'Unlock Images',
    };

    L.DistortableImage.group_action_map.u = '_unlockGroup';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._unlockGroup();
  },
});

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({
  options: {
  },
});

L.distortableImage.controlBar = function(options) {
  return new L.DistortableImage.ControlBar(options);
};

/** addInitHooks run before onAdd */
L.DistortableCollection.addInitHook(function() {
  this.ACTIONS = [L.ExportAction, L.DeleteAction, L.LockAction, L.UnlocksAction];

  if (this.options.actions) {
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }

  this.editing = new L.DistortableCollection.Edit(this, {
    actions: this.editActions,
  });
});
