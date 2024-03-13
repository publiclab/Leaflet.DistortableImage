L.ScaleAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'scale',
      tooltip: overlay.options.translation.scaleImage,
      className: 'scale',
    };

    L.DistortableImage.action_map.s = '_scaleMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    var edit = this._overlay.editing;
    edit._scaleMode();
  },
});
