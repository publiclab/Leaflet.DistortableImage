L.EditAction.ToggleRotateScale = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      use,
      tooltip;

    if (edit._mode === 'rotateScale') {
      use = 'distort';
      tooltip = 'Distort Image';
    } else {
      use = 'crop_rotate';
      tooltip = 'Rotate+Scale Image';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip
    };

    L.DistortableImage.action_map.d = '_toggleRotateScale';
    L.DistortableImage.action_map.r = '_toggleRotateScale';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'distort', 'crop_rotate');
    L.IconUtil.toggleTooltip(this._link, 'Distort Image', 'Rotate+Scale Image');
    editing._toggleRotateScale();
  }
});
