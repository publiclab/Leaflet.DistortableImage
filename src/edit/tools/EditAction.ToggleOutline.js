L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = L.DistortableImage.action_map || {};

L.EditAction.ToggleOutline = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use,
      tooltip;

    if (edit._outlined) {
      use = 'border_clear';
      tooltip = 'Remove Border';
    } else {
      use = 'border_outer';
      tooltip = 'Add Border';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip
    };

    L.DistortableImage.action_map.o = '_toggleOutline';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'border_clear', 'border_outer');
    L.IconUtil.toggleTooltip(this._link, 'Remove Border', 'Add Border');
    editing._toggleOutline();
  }
});
