L.RestoreAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'restore',
      tooltip: overlay.options.translation.restoreOriginalImageDimensions,
      className: 'disabled',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var ov = this._overlay;
    var restoreTool = this._link;
    L.DomUtil.addClass(restoreTool.parentElement, 'disabled');
    L.DomUtil.addClass(restoreTool, 'disabled');

    L.DomEvent.on(ov, 'edit', () => {
      L.DomUtil.removeClass(restoreTool.parentElement, 'disabled');
      L.DomUtil.removeClass(restoreTool, 'disabled');
    });
    ov.restore();
  },
});
