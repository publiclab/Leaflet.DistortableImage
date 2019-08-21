L.LockAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
        use, tooltip, className;

    /** 
     * we can tell whether the overlay is an instance of `L.DistortableImageOverlay` or `L.DistortableCollection` bc only 
     * the former should have `_eventParents` defined on it. From there we call the apporpriate keybindings and methods. 
     * Aligning both classes w/ an `.edit` allowed us to have actions like this that can work w/ both interfaces.
     */ 
   
    if (overlay._eventParents) {
      L.DistortableImage.action_map.u = '_unlock';
      L.DistortableImage.action_map.l = '_lock';
      tooltip = 'Lock Mode';

      if (edit._mode === 'lock') {
        use = 'lock';
        className = 'lock';
      } else {
        use = 'unlock';
        className = 'unlock';
      }

    } else {
      L.DistortableImage.group_action_map.l = '_lockGroup';
      tooltip = 'Lock Images';
      use = 'lock';
      className = 'lock';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: className,
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (this._overlay._eventParents) { edit._toggleLockMode(); }
    else { edit._lockGroup(); }
  }
});
