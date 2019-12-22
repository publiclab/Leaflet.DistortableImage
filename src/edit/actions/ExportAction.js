L.ExportAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var tooltip;

    if (edit instanceof L.DistortableImage.Edit) {
      L.DistortableImage.action_map.e = '_getExport';
      tooltip = 'Export Image';
    } else {
      L.DistortableImage.group_action_map.e = 'startExport';
      tooltip = 'Export Images';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'get_app',
      tooltip: tooltip,
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) { edit._getExport(); }
    else {
      L.IconUtil.toggleXlink(this._link, 'get_app', 'spinner');
      L.IconUtil.toggleTitle(this._link, 'Export Images', 'Loading...');
      L.IconUtil.addClassToSvg(this._link, 'loader');
      edit.startExport({
console.log(this, edit.options)
// explicitly send each option:
        collection: edit.options.collection,
        frequency: edit.options.frequency,
        scale: edit.options.scale,
        updater: edit.options.updater,
        handleStatusUrl: edit.options.handleStatusUrl,
        fetchStatusUrl: edit.options.fetchStatusUrl,
        exportStartUrl: edit.options.exportStartUrl,
        exportUrl: edit.options.exportUrl
      }).then(function() {
        L.IconUtil.toggleXlink(this._link, 'get_app', 'spinner');
        L.IconUtil.toggleTitle(this._link, 'Export Images', 'Loading...');
        L.DomUtil.removeClass(this._link.firstChild, 'loader');
      }.bind(this));
    }
  },
});
