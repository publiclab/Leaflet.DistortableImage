L.RotateScaleAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'crop_rotate',
      tooltip: 'Rotate+Scale Image',
      className: 'rotateScale'
    };

    L.DistortableImage.action_map.r = '_rotateScaleMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._rotateScaleMode();
  }
});
