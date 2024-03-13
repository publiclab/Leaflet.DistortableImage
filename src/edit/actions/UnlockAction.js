L.UnlockAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'unlock',
      tooltip: overlay.options.translation.unlockImages,
    };

    L.DistortableImage.group_action_map.u = '_unlockGroup';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    var edit = this._overlay.editing;
    edit._unlockGroup();
  },
});
