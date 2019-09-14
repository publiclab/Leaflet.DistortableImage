L.OpacityAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

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
      tooltip: tooltip,
      className: edit.mode === 'lock' ? 'disabled' : '',
    };

    // conditional for disabling keybindings for this action when the image is locked.
    if (edit.mode !== 'lock') {
      L.DistortableImage.action_map.o = '_toggleOpacity';
    } else {
      L.DistortableImage.action_map.o = '';
    }

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'opacity', 'opacity_empty');
    L.IconUtil.toggleTitle(this._link, 'Make Image Transparent', 'Make Image Opaque');
    edit._toggleOpacity();
  },
});
