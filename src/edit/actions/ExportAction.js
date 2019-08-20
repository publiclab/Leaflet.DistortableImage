L.ExportAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'get_app',
      tooltip: 'Export Image'
    };

    L.DistortableImage.action_map.e = '_getExport';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._getExport();
  }
});
