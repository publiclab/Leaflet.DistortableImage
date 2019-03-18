L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
    initialize: function(map, overlay, options) {
      this._overlay = overlay;
      this._map = map;

      this.removeTool = function(tool) {
        this._overlay._toolArray = this._overlay._toolArray.filter(function(x) {
          return x !== tool;
        });
        L.DistortableImage.EditToolbar = LeafletToolbar.Control.extend({
          options: {
            position: "topleft",
            actions: this._overlay._toolArray
          }
        });
      };

      this.addTool = function(tool) {
        this._overlay._toolArray.push(tool);
        L.DistortableImage.EditToolbar = LeafletToolbar.Control.extend({
          options: {
            position: "topleft",
            actions: this._overlay._toolArray
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
  EnableEXIF = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<span class="fa fa-compass"></span>',
        tooltip: "Enable EXIF",
        title: "Geocode Image"
      }
    },

    addHooks: function() {
      var image = this._overlay._image;
      EXIF.getData(image, L.EXIF(image));
    }
  }),
  ToggleOrder = EditOverlayAction.extend({
    options: {
      toolbarIcon: {
        html: '<span class="fa fa-sort"></span>',
        tooltip: "Change order",
        title: "Toggle order"
      }
    },

    addHooks: function() {
      var editing = this._overlay.editing;

      editing._toggleOrder();
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
      if (L.DistortableImage.EditToolbar.hidden_tools) {

        var hidden_tools = L.DistortableImage.EditToolbar.hidden_tools; // this._overlay.options.hidden_tools;
        var i;

        this.removeTool(ToggleReveal);

        for (i = 0; i < hidden_tools.length; i++) {
          this.addTool(hidden_tools[i]);
        }

        this._overlay.editing._hideToolbar();

      } else {

        console.error(
          "L.DistortableImage.EditToolbar.hidden_tools not initialized!"
        );

      }
    }
  });

var defaults = [
  ToggleTransparency,
  ToggleOutline,
  ToggleRotateDistort,
  EnableEXIF,
  ToggleOrder,
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
