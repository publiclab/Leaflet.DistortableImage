L.ExportAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var tooltip;
    
    if (overlay._eventParents) {
      L.DistortableImage.action_map.e = '_getExport';
      tooltip = 'Export Image';
    } else {
      tooltip = 'Export Images';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'get_app',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (this._overlay._eventParents) { edit._getExport(); }
    else { 
      L.IconUtil.toggleXlink(this._link, 'get_app', 'spinner');
      L.IconUtil.toggleTooltip(this._link, 'Export Images', 'Loading...'); 
      L.IconUtil.addClassToSvg(this._link, 'loader');
      edit.startExport();
    }
  }
});
