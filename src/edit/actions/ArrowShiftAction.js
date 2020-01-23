L.DragAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'shift',
      tooltip: overlay.options.translation.dragImage,
      className: 'shift',
    };

    L.DistortableImage.action_map.left = '_shiftMode';
    L.DistortableImage.action_map.right = '_shiftMode';
    L.DistortableImage.action_map.up = '_shiftMode';
    L.DistortableImage.action_map.down = '_shiftMode';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._shiftMode();
  },
});
