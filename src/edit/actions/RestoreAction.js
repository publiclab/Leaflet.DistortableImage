L.RestoreAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var mode = L.Utils.getNestedVal(overlay, 'editing', '_mode');
    var edited = overlay.edited;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'restore',
      tooltip: overlay.options.translation.restoreImage,
      className: edited && mode !== 'lock' ? '' : 'disabled',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var ov = this._overlay;

    L.DomEvent.on(ov, {
      edit: this._enableAction,
      restore: this._disableAction,
    }, this);

    ov.restore();
  },
});
