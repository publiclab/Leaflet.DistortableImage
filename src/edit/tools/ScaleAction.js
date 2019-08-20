L.ScaleAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'scale';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Scale Image'
    };

    L.DistortableImage.action_map.s = '_toggleScale';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;
    editing._toggleScale();
  }
});
