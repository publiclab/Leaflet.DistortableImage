L.ScaleAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'scale',
      tooltip: 'Scale Image',
      className: 'scale'
    };

    L.DistortableImage.action_map.s = '_scaleMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._scaleMode();
  }
});
