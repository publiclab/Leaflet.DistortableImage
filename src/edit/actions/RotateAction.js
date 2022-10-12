L.RotateAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'rotate',
      tooltip: overlay.options.translation.rotateImage,
      className: 'rotate',
    };

    L.DistortableImage.action_map.r = '_rotateMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    const edit = this._overlay.editing;
    edit._rotateMode();
  },
});
