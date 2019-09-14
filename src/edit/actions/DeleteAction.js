L.DeleteAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use = 'delete_forever';
    var tooltip;

    if (edit.parentGroup) {
      tooltip = 'Delete Image';
      // backspace windows / delete mac
      L.DistortableImage.action_map.Backspace = edit.mode === 'lock' ? '' : '_removeOverlay';
    } else {
      tooltip = 'Delete Images';
      L.DistortableImage.group_action_map.Backspace = edit.mode === 'lock' ? '' : '_removeGroup';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: edit.mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit.parentGroup) { edit._removeOverlay(); }
    else { edit._removeGroup(); }
  },
});
