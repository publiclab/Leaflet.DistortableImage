L.ToggleLockAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use,
      tooltip;

    if (edit._mode === 'lock') {
      use = 'unlock';
      tooltip = 'Unlock';
    } else {
      use = 'lock';
      tooltip = 'Lock';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip
    };

    L.DistortableImage.action_map.l = '_toggleLock';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'unlock', 'lock');
    L.IconUtil.toggleTooltip(this._link, 'Unlock', 'Lock');
    editing._toggleLock();
  }
});
