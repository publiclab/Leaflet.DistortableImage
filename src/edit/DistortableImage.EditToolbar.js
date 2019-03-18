L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
    initialize: function(map, overlay, options) {
      this._overlay = overlay;
      this._map = map;

      this.removeTool = function(tools, tool) {
        tools = tools.filter(function(x) {
          return x !== tool;
        });
        L.DistortableImage.EditToolbar = LeafletToolbar.Control.extend({
          options: {
            position: "topleft",
            actions: tools
          }
        });
      };

      this.addTool = function(tools, tool) {
        tools.push(tool);
        L.DistortableImage.EditToolbar = LeafletToolbar.Control.extend({
          options: {
            position: "topleft",
            actions: tools
          }
        });
      };

      LeafletToolbar.ToolbarAction.prototype.initialize.call(this, options);
    }
  }),
  ToggleTransparency = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<span class="fa fa-adjust"></span>',
        tooltip: "Toggle Image Transparency",
        title: "Toggle Image Transparency"
      }
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleTransparency();
      this.disable();
    }
  }),
  ToggleOutline = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<span class="fa fa-square-o"></span>',
        tooltip: "Toggle Image Outline",
        title: "Toggle Image Outline"
      }
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleOutline();
      this.disable();
    }
  }),
  ToggleExport = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<span class="fa fa-download"></span>',
        tooltip: "Export Image",
        title: "Export Image"
      }
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleExport();
      this.disable();
    }
  }),
  RemoveOverlay = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<span class="fa fa-trash"></span>',
        tooltip: "Delete image",
        title: "Delete image"
      }
    },

    addHooks: function() {
      var map = this._map;

      map.removeLayer(this._overlay);
      this._overlay.fire("delete");
      this.disable();
    }
  }),
  ToggleRotateDistort = EditOverlayAction.extend({
    initialize: function(map, overlay, options) {
      var icon = overlay.editing._mode === "rotate" ? "image" : "rotate-left";

      options = options || {};
      options.toolbarIcon = {
        html: '<span class="fa fa-' + icon + '"></span>',
        tooltip: "Rotate",
        title: "Rotate"
      };

      EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleRotateDistort();
      this.disable();
    }
  }),
  ToggleEditable = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<span class="fa fa-lock"></span>',
        tooltip: "Lock / Unlock editing",
        title: "Lock / Unlock editing"
      }
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleLock();
      this.disable();
    }
  }),
  ToggleReveal = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<span class="fa fa-arrows-alt"></span>',
        tooltip: "Enable reveal",
        title: "More options"
      }
    },

    addHooks: function() {
      var hidden_tools = this._overlay.options.hidden_tools;
      var tools = this._overlay._toolArray;
      var i;

      this.removeTool(tools, ToggleReveal);
      for (i = 0; i < hidden_tools.length; i++) {
        this.addTool(tools, hidden_tools[i]);
      }
      this._overlay.editing._hideToolbar();
    }
  });

var defaults = [
  ToggleTransparency,
  ToggleOutline,
  ToggleRotateDistort,
  ToggleReveal
];

console.log(ToggleExport, ToggleEditable, RemoveOverlay);

L.DistortableImage.defaults = defaults;

L.DistortableImage.EditToolbar = LeafletToolbar.Control.extend({
  options: {
    position: "topleft",
    actions: defaults
  }
});
