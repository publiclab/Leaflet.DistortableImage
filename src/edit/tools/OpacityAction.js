L.OpacityAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use,
      tooltip;

    if (edit._transparent) {
      use = 'opacity';
      tooltip = 'Make Image Opaque';
    } else {
      use = 'opacity_empty';
      tooltip = 'Make Image Transparent';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip
    };

    L.DistortableImage.action_map.t = '_toggleTransparency';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'opacity_empty', 'opacity');
    L.IconUtil.toggleTooltip(
      this._link,
      'Make Image Opaque',
      'Make Image Transparent'
    );
    editing._toggleTransparency();
  }
});
