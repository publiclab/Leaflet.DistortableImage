L.OpacityAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var mode = edit._mode;
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
      className: mode === 'lock' ? 'disabled' : '',
    };

    L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_toggleOpacity';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    var link = this._link;

    L.IconUtil.toggleXlink(link, 'opacity', 'opacity_empty');
    L.IconUtil.toggleTitle(link, 'Make Image Transparent', 'Make Image Opaque');
    edit._toggleOpacity();
  },
});
