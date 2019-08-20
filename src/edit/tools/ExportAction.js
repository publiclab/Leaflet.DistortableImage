L.ExportAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'get_app';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Export Image'
    };

    L.DistortableImage.action_map.e = '_getExport';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;
    editing._getExport();
  }
});
