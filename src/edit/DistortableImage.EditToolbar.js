L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
    initialize: function(map, overlay, customAction, options) {
        this._map = map;
        this._overlay = overlay;
        this.customAction = customAction;
        this._image = this._overlay._image;
        this._editing = this._overlay.editing;

        LeafletToolbar.ToolbarAction.prototype.initialize.call(this, options);
    },
    addHooks: function() {
        if (this.customAction) {
			this.customAction.disable();
        }
        else {
			this.disable();
        }
    }
});

var ToggleTransparency = EditOverlayAction.extend({
        options: {
            toolbarIcon: {
                html: '<span class="fa fa-adjust"></span>',
                tooltip: 'Toggle Image Transparency'
            }
        },

        addHooks: function() {
            this._editing._toggleTransparency();
        }
    }),

    ToggleOutline = EditOverlayAction.extend({
        options: {
            toolbarIcon: {
                html: '<span class="fa fa-square-o"></span>',
                tooltip: 'Toggle Image Outline'
            }
        },

        addHooks: function() {
            this._editing._toggleOutline();
        }
    }),

    RemoveOverlay = EditOverlayAction.extend({
        options: {
            toolbarIcon: {
                html: '<span class="fa fa-trash"></span>',
                tooltip: 'Delete image'
            }
        },

        addHooks: function() {
            this._map.removeLayer(this._overlay);
            this._overlay.fire('delete');
        }
    }),

    ToggleEditable = EditOverlayAction.extend({
        options: {
            toolbarIcon: {
                html: '<span class="fa fa-lock"></span>',
                tooltip: 'Lock / Unlock editing'
            }
        },

        addHooks: function() {
            this._editing._toggleLock();
        }
    }),

    ToggleRotateDistort = EditOverlayAction.extend({
        initialize: function(map, overlay, customAction, options) {
            var icon = overlay.editing._mode === 'rotate' ? 'image' : 'rotate-left';

            options = options || {};
            options.toolbarIcon = {
                html: '<span class="fa fa-' + icon + '"></span>',
                tooltip: 'Rotate'
            };

            EditOverlayAction.prototype.initialize.call(this, map, overlay, null, options);
        },

        addHooks: function() {
            this._editing._toggleRotateDistort();
            this._editing._hideToolbar();
            this._editing._showToolbar();
        }
    }),


    ToggleExport = EditOverlayAction.extend({
        options: {
            toolbarIcon: {
                html: '<span class="fa fa-download"></span>',
                tooltip: 'Export Image'
            }
        },

        addHooks: function() {
            this._editing._toggleExport();
        }
    }),

    ToggleOrder = EditOverlayAction.extend({
        options: {
            toolbarIcon: {
                html: '<span class="fa fa-sort"></span>',
                tooltip: 'Change order'
            }
        },

        addHooks: function() {
            this._editing._toggleOrder();
        }
    }),

    EnableEXIF = EditOverlayAction.extend({
        options: {
            toolbarIcon: {
                html: '<span class="fa fa-compass"></span>',
                tooltip: "Enable EXIF"
            }
        },

        addHooks: function() {
            EXIF.getData(this._image, L.EXIF(this._image));
        }
    });

var Cluster = EditOverlayAction.extend({
    options: {
        toolbarIcon: {
            className: 'fa fa-ellipsis-h',
            title: "More options"
        },
        subToolbar: new LeafletToolbar({
            actions: [
                ToggleTransparency,
                ToggleEditable,
                EnableEXIF,
                ToggleOrder,
            ]
        })
    }
});

L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
    options: {
        actions: [
            ToggleRotateDistort,
            ToggleOutline,
            ToggleExport,
            RemoveOverlay,
            Cluster
        ]
    }
});