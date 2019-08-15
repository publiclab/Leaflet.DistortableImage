L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

  var Exports = L.EditAction.extend({
    initialize: function (map, overlay, options) {
      var use = 'get_app';
  
      options = options || {};
      options.toolbarIcon = {
        svg: true,
        html: use,
        tooltip: 'Export Images'
      };

      L.EditAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function () {
      var edit = this._overlay;

      edit.startExport();
    }
  });

  var Deletes = L.EditAction.extend({
    initialize: function(map, overlay, options) {
      var use = 'delete_forever';

      options = options || {};
      options.toolbarIcon = {
        svg: true,
        html: use,
        tooltip: 'Delete Images'
      };

      L.EditAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var edit = this._overlay;

      edit._removeGroup();
    }
  });

var Locks = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var use = 'lock';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Lock Images'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var edit = this._overlay;

    edit._lockGroup();
  }
});

var Unlocks = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var use = 'unlock';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Unlock Images'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var edit = this._overlay;

    edit._unlockGroup();
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

/** addInitHooks run before onAdd */
L.DistortableCollection.addInitHook(function () {
  this.ACTIONS = [Exports, Deletes, Locks, Unlocks];

  if (this.options.actions) {
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }

  this.editing = new L.DistortableCollection.Edit(this, { actions: this.editActions });
});
