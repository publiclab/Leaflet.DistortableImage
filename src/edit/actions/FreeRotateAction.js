L.FreeRotateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'crop_rotate',
      tooltip: overlay.options.translation.freeRotateImage,
      className: 'freeRotate',
    };

    L.DistortableImage.action_map.f = '_freeRotateMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._freeRotateMode();
  },
});
