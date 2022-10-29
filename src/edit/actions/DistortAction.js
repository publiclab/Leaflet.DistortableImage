L.DistortAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'distort',
      tooltip: overlay.options.translation.distortImage,
      className: 'distort',
    };

    L.DistortableImage.action_map.d = '_distortMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    const edit = this._overlay.editing;
    edit._distortMode();
  },
});
