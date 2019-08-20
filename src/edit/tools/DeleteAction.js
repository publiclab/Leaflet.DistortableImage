L.DeleteAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'delete_forever';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Delete Image'
    };

    L.DistortableImage.action_map.Backspace = '_removeOverlay'; // backspace windows / delete mac
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;
    editing._removeOverlay();
  }
});
