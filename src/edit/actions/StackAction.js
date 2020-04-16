L.StackAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

    if (edit._toggledImage) {
      use = 'flip_to_back';
      tooltip = overlay.options.translation.stackToFront;
    } else {
      use = 'flip_to_front';
      tooltip = overlay.options.translation.stackToBack;
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.DistortableImage.action_map.q = edit._mode === 'lock' ? '' : '_stackUp';
    L.DistortableImage.action_map.a = edit._mode === 'lock' ? '' : '_stackDown';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'flip_to_front', 'flip_to_back');
    L.IconUtil.toggleTitle(this._link, 'Stack to Front', 'Stack to Back');
    edit._toggleOrder();
  },
});
