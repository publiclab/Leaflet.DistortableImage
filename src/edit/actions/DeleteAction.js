L.DeleteAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use = 'delete_forever';
    var tooltip;
    /**
      * we can tell whether the overlay is an instance of `L.DistortableImageOverlay` or `L.DistortableCollection` bc only
      * the former should have `parentGroup` defined on it. From there we call the apporpriate keybindings and methods.
      */
    if (edit instanceof L.DistortableImage.Edit) {
      tooltip = overlay.options.translation.deleteImage;
      // backspace windows / delete mac
      L.DistortableImage.action_map.Backspace = (
        edit._mode === 'lock' ? '' : '_removeOverlay'
      );
    } else {
      tooltip = overlay.options.translation.deleteImages;
      L.DistortableImage.group_action_map.Backspace = (
        edit._mode === 'lock' ? '' : '_removeGroup'
      );
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) { edit._removeOverlay(); }
    else { edit._removeGroup(); }
  },
});
