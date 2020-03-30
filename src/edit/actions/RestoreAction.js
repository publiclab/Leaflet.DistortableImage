L.RestoreAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var mode = L.Utils.getNestedVal(overlay, 'editing', '_mode');
    var edited = overlay.edited;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'restore',
      tooltip: overlay.options.translation.restoreInitialImage,
      className: edited && mode !== 'lock' ? '' : 'disabled',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var ov = this._overlay;

    L.DomEvent.on(ov, {
      edit: this._enableAction,
      restore: this.disableRestore,
    }, this);

    ov.restore();
  },

  disableRestore: function() {
    L.DomUtil.addClass(this._link.parentElement, 'disabled');
    L.DomUtil.addClass(this._link, 'disabled');
  },
});
