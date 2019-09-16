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
      edit.startExport();
    }
  },
});
