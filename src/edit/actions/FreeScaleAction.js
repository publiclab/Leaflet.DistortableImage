L.FreeScaleAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'crop_rotate',
      tooltip: 'Free-scale Image',
      className: 'freeScale',
    };

    L.DistortableImage.action_map.f = '_freeScaleMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._freeScaleMode();
  },
});
