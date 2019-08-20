L.RotateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'rotate',
      tooltip: 'Rotate Image',
      className: 'rotate'
    };

    L.DistortableImage.action_map.a = '_rotateMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._rotateMode();
  }
});
