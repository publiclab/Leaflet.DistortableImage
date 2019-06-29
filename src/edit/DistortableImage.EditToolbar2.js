L.DistortableImage = L.DistortableImage || {};
// L.EditOverlayAction = L.EditOverlayAction || {};

L.EditOverlayAction = L.Toolbar2.Action.extend({
  initialize: function (map, overlay, options) {
    this._overlay = overlay;
    this._map = map;

    L.Toolbar2.Action.prototype.initialize.call(this, options);
  }
});

  var Exports = L.EditOverlayAction.extend({
    initialize: function (map, group, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#get_app"></use>';
  
      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Export Images'
      };

      L.EditOverlayAction.prototype.initialize.call(this, map, group, options);
    },

    addHooks: function () {
      // console.log(this);
      var group = this._overlay;

      group.startExport();
    }
  });

  var Deletes = L.EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#delete_forever"></use>';

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Delete Images'
      };

      L.EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var group = this._overlay;

      group._removeFromGroup();
    }
  });

L.DistortableImage.EditToolbar2 = L.Toolbar2.Control.extend({
  options: {
    actions: [
      Exports,
      Deletes
    ]
  },
});