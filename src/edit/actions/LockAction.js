L.LockAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

    if (edit instanceof L.DistortableImage.Edit) {
      L.DistortableImage.action_map.u = '_unlock';
      L.DistortableImage.action_map.l = '_lock';
      tooltip = 'Lock Mode';

      if (edit._mode === 'lock') { use = 'lock'; }
      else { use = 'unlock'; }
    } else {
      L.DistortableImage.group_action_map.l = '_lockGroup';
      tooltip = 'Lock Images';
      use = 'lock';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: 'lock',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) { edit._toggleLockMode(); }
    else { edit._lockGroup(); }
  },
});
