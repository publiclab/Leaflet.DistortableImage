L.RestoreAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    const mode = L.Utils.getNestedVal(overlay, 'editing', '_mode');
    const edited = overlay.edited;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'restore',
      tooltip: overlay.options.translation.restoreImage,
      className: edited && mode !== 'lock' ? '' : 'disabled',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    const ov = this._overlay;

    L.DomEvent.on(ov, {
      edit: this._enableAction,
      restore: this._disableAction,
    }, this);

    ov.restore();
  },
});
