L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

  var Exports = L.EditAction.extend({
    initialize: function (map, group, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#get_app"></use>';
  
      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Export Images'
      };

      L.EditAction.prototype.initialize.call(this, map, group, options);
    },

    addHooks: function () {
      var group = this._overlay;

      group.startExport();
    }
  });

  var Deletes = L.EditAction.extend({
    initialize: function(map, overlay, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#delete_forever"></use>';

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Delete Images'
      };

      L.EditAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var group = this._overlay;

      group._removeGroup();
    }
  });

var Locks = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#lock"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Lock Images'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var group = this._overlay;

    group._lockGroup();
  }
});

var Unlocks = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#unlock"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Unlock Images'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var group = this._overlay;

    group._unlockGroup();
  }
});

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({
  options: {
    actions: [
      Exports,
      Deletes,
      Locks,
      Unlocks
    ]
  },
});

L.distortableImage.controlBar = function (options) {
  return new L.DistortableImage.ControlBar(options);
};

L.DistortableCollection.addInitHook(function () {
  this.ACTIONS = [Exports, Deletes, Locks, Unlocks];

  if (this.options.actions) {
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }
});
