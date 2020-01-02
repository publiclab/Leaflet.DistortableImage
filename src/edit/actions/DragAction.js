L.DragAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'drag',
      tooltip: overlay.options.translation.dragImage,
      className: 'drag',
    };

    L.DistortableImage.action_map.D = '_dragMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._dragMode();
  },
});
