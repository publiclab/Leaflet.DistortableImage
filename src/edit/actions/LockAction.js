L.LockAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;
    var className;

    if (edit.parentGroup) {
      L.DistortableImage.action_map.u = '_unlock';
      L.DistortableImage.action_map.l = '_lock';
      tooltip = 'Lock Mode';

      if (edit.mode === 'lock') {
        use = 'lock';
        className = 'lock';
      } else {
        use = 'unlock';
        className = 'unlock';
      }
    } else {
      L.DistortableImage.group_action_map.l = '_lockGroup';
      tooltip = 'Lock Images';
      use = 'lock';
      className = 'lock';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: className,
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit.parentGroup) { edit._toggleLockMode(); }
    else { edit._lockGroup(); }
  },
});
