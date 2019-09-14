L.BorderAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

    if (edit._outlined) {
      use = 'border_outer';
      tooltip = 'Remove Border';
    } else {
      use = 'border_clear';
      tooltip = 'Add Border';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: edit.mode === 'lock' ? 'disabled' : '',
    };

    L.DistortableImage.action_map.b = '_toggleBorder';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'border_clear', 'border_outer');
    L.IconUtil.toggleTitle(this._link, 'Remove Border', 'Add Border');
    edit._toggleBorder();
  },
});
