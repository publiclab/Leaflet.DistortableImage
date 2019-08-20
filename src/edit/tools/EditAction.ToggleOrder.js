L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.EditAction.ToggleOrder = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use,
      tooltip;

    if (edit._toggledImage) {
      use = 'flip_to_front';
      tooltip = 'Stack to Front';
    } else {
      use = 'flip_to_back';
      tooltip = 'Stack to Back';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip
    };

    L.DistortableImage.action_map.j = '_toggleOrder';
    L.DistortableImage.action_map.k = '_toggleOrder';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'flip_to_front', 'flip_to_back');
    L.IconUtil.toggleTooltip(this._link, 'Stack to Front', 'Stack to Back');
    editing._toggleOrder();
  }
});
