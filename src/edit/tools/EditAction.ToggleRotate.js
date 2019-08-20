L.RotateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'rotate';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Rotate Image'
    };

    L.DistortableImage.action_map.CapsLock = '_toggleRotate';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;
    editing._toggleRotate();
  }
});
