L.DeleteAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'delete_forever';
    var tooltip;

    if (overlay._eventParents) {
      tooltip = 'Delete Image';
      L.DistortableImage.action_map.Backspace = '_removeOverlay'; // backspace windows / delete mac
    } else {
      tooltip = 'Delete Images';
      L.DistortableImage.group_action_map.Backspace = '_removeGroup'; // backspace windows / delete mac
    }
  
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (this._overlay._eventParents) { edit._removeOverlay(); }
    else { edit._removeGroup(); }
  }
});
