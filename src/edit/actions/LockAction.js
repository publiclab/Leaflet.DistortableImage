L.LockAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
        use, className;

    if (edit._mode === 'lock') {
      use = 'lock';
      className = 'lock';
    } else {
      use = 'unlock';
      className = 'unlock';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Lock Mode',
      className: className,
    };

    L.DistortableImage.action_map.u = '_unlock';
    L.DistortableImage.action_map.l = '_lock';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._toggleLockMode();
  }
});
