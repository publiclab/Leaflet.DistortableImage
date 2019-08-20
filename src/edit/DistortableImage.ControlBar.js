L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.group_action_map = {};

var Exports = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'get_app';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Export Images',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    L.IconUtil.toggleXlink(this._link, 'get_app', 'spinner');
    L.IconUtil.toggleTitle(this._link, 'Export Images', 'Loading...');
    L.IconUtil.addClassToSvg(this._link, 'loader');
    L.DomEvent.off(this._link, 'click', this.enable, this);
    edit.startExport();
  },
});

var Locks = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'lock';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Lock Images',
    };

    L.DistortableImage.group_action_map.l = '_lockGroup';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._lockGroup();
  },
});

var Unlocks = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'unlock';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Unlock Images',
    };

    L.DistortableImage.group_action_map.u = '_unlockGroup';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._unlockGroup();
  },
});

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({
  options: {
    // actions: [
    //   Exports,
    //   Deletes,
    //   Locks,
    //   Unlocks,
    // ],
  },
});

L.distortableImage.controlBar = function(options) {
  return new L.DistortableImage.ControlBar(options);
};

/** addInitHooks run before onAdd */
L.DistortableCollection.addInitHook(function() {
  this.ACTIONS = [Exports, L.DeleteAction, Locks, Unlocks];

  if (this.options.actions) {
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }

  this.editing = new L.DistortableCollection.Edit(this, {
    actions: this.editActions,
  });
});
