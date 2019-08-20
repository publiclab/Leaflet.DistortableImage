L.RevertAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'restore';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Restore Original Image Dimensions'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    this._overlay._revert();
  }
});
