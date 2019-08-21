L.OpacityAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use,
      tooltip;

    if (edit._transparent) {
      use = 'opacity_empty';
      tooltip = 'Make Image Opaque';
    } else {
      use = 'opacity';
      tooltip = 'Make Image Transparent';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip
    };

    L.DistortableImage.action_map.o = '_toggleOpacity';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'opacity', 'opacity_empty');
    L.IconUtil.toggleTooltip(this._link, 'Make Image Transparent', 'Make Image Opaque');
    edit._toggleOpacity();
  }
});
