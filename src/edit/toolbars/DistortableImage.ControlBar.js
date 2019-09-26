L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.group_action_map = {};

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({
  options: {
  },

  addHooks: function(map, ov) {
    this.map = map;
    this.ov = ov;
  },

  tools: function() {
    if (this._ul) {
      return this._ul.children;
    }
  },

  clickTool: function(name) {
    var tools = this.tools();
    for (var i = 0; i < tools.length; i++) {
      var tool = tools.item(i).children[0];
      if (L.DomUtil.hasClass(tool, name)) {
        tool.click();
        return tool;
      }
    }
    return false;
  },
});

L.distortableImage.controlBar = function(options) {
  return new L.DistortableImage.ControlBar(options);
};

/** addInitHooks run before onAdd */
L.DistortableCollection.addInitHook(function() {
  this.ACTIONS = [
    L.ExportAction,
    L.DeleteAction,
    L.LockAction,
    L.UnlockAction,
  ];

  L.DistortableCollection.Edit.MODES = {
    'lock': L.LockAction,
    'unlock': L.UnlockAction,
  };

  var a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableCollection.edit(this, {actions: a});
});
