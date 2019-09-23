L.DistortableImage = L.DistortableImage || {};

// this class holds the keybindings and toolbar API for an image collection instance
L.DistortableCollection.Edit = L.Handler.extend({
  options: {
    keymap: L.distortableImage.group_action_map,
  },

  initialize: function(group, options) {
    this._group = group;
    L.setOptions(this, options);

    L.distortableImage.group_action_map.Escape = '_decollectAll';
  },

  addHooks: function() {
    var group = this._group;
    var map = group._map;

    this.editActions = this.options.actions;

    L.DomEvent.on(document, 'keydown', this._onKeyDown, this);

    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.on(map, 'click', this._decollectAll, this);
    }

    L.DomEvent.on(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
      boxzoomend: this._addCollections,
    }, this);

    this._group.editable = true;
    this._group.eachLayer(function(layer) {
      layer.editing.enable();
    });
  },

  removeHooks: function() {
    var group = this._group;
    var map = group._map;

    L.DomEvent.off(document, 'keydown', this._onKeyDown, this);

    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.off(map, 'click', this._decollectAll, this);
    }

    L.DomEvent.off(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
      boxzoomend: this._addCollections,
    }, this);

    this._decollectAll();
    this._group.editable = false;
    this._group.eachLayer(function(layer) {
      layer.editing.disable();
    });
  },

  enable: function() {
    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    this._enabled = false;
    this.removeHooks();

    return this;
  },

  _onKeyDown: function(e) {
    var keymap = this.options.keymap;
    var handlerName = keymap[e.key];

    if (!this[handlerName]) { return; }

    if (this._group.anyCollected()) {
      this[handlerName].call(this);
    }
  },

  _singleClick: function(e) {
    if (e.type === 'singleclick') { this._decollectAll(e); }
    else { return; }
  },

  _singleClickListeners: function() {
    var map = this._group._map;
    L.DomEvent.off(map, 'click', this._decollectAll, this);
    L.DomEvent.on(map, 'singleclick', this._decollectAll, this);
  },

  _resetClickListeners: function() {
    var map = this._group._map;
    L.DomEvent.on(map, 'click', this._decollectAll, this);
    L.DomEvent.off(map, 'singleclick', this._decollectAll, this);
  },

  _decollectAll: function(e) {
    var oe;

    if (e) { oe = e.originalEvent; }
    /**
     * prevents image deselection following the 'boxzoomend' event - note 'shift' must not be released until dragging is complete
     * also prevents deselection following a click on a disabled img by differentiating it from the map
     */
    if (oe && (oe.shiftKey || oe.target instanceof HTMLImageElement)) {
      return;
    }

    this._group.eachLayer(function(layer) {
      L.DomUtil.removeClass(layer.getElement(), 'collected');
      layer.deselect();
    });

    this._removeToolbar();

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  _unlockGroup: function() {
    this._group.eachLayer(function(layer) {
      if (this._group.isCollected(layer)) {
        var edit = layer.editing;
        if (edit._mode === 'lock') {
          edit._unlock();
          // unlock updates the layer's handles; deselect to ensure they're hidden
          layer.deselect();
        }
      }
    }, this);
  },

  _lockGroup: function() {
    this._group.eachLayer(function(layer) {
      if (this._group.isCollected(layer) ) {
        var edit = layer.editing;
        if (edit._mode !== 'lock') {
          edit._lock();
          // map.addLayer also deselects the image, so we reselect here
          L.DomUtil.addClass(layer.getElement(), 'collected');
        }
      }
    }, this);
  },

  _addCollections: function(e) {
    var box = e.boxZoomBounds;
    var map = this._group._map;

    this._group.eachLayer(function(layer) {
      var edit = layer.editing;

      if (layer.isSelected()) { layer.deselect(); }

      var imgBounds = L.latLngBounds(layer.getCorner(2), layer.getCorner(1));
      imgBounds = map._latLngBoundsToNewLayerBounds(imgBounds, map.getZoom(), map.getCenter());
      if (box.intersects(imgBounds) && edit.enabled()) {
        if (!this.toolbar) {
          this._addToolbar();
        }
        L.DomUtil.addClass(layer.getElement(), 'collected');
      }
    }, this);
  },

  _removeGroup: function(e) {
    var layersToRemove = this._group._toRemove();
    var n = layersToRemove.length;

    if (n === 0) { return; }

    var choice = L.DomUtil.confirmDeletes(n);

    if (choice) {
      layersToRemove.forEach(function(layer) {
        this._group.removeLayer(layer);
      }, this);
      if (!this._group.anyCollected()) {
        this._removeToolbar();
      }
    }

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  startExport: function(opts) {
    opts = opts || {};
    opts.collection = opts.collection || this._group.generateExportJson();
    opts.frequency = opts.frequency || 3000;
    opts.scale = opts.scale || 100; // switch it to _getAvgCmPerPixel !
    var statusUrl;
    var updateInterval;

    // this may be overridden to update the UI to show export progress or completion
    // eslint-disable-next-line require-jsdoc
    function _defaultUpdater(data) {
      data = JSON.parse(data);
      // optimization: fetch status directly from google storage:
      if (statusUrl !== data.status_url && data.status_url.match('.json')) {
        statusUrl = data.status_url;
      }
      if (data.status === 'complete') {
        clearInterval(updateInterval);
      }
      if (data.status === 'complete' && data.jpg !== null) {
        alert('Export succeeded. http://export.mapknitter.org/' + data.jpg);
      }
      // TODO: update to clearInterval when status == "failed" if we update that in this file:
      // https://github.com/publiclab/mapknitter-exporter/blob/main/lib/mapknitterExporter.rb
      console.log(data);
    }

    // receives the URL of status.json, and starts running the updater to repeatedly fetch from status.json;
    // this may be overridden to integrate with any UI
    // eslint-disable-next-line require-jsdoc
    function _defaultHandleStatusUrl(data) {
      console.log(data);
      statusUrl = '//export.mapknitter.org' + data;
      opts.updater = opts.updater || _defaultUpdater;

      // repeatedly fetch the status.json
      updateInterval = setInterval(function intervalUpdater() {
        $.ajax(statusUrl + '?' + Date.now(), {// bust cache with timestamp
          type: 'GET',
          crossDomain: true,
        }).done(function(data) {
          opts.updater(data);
        });
      }, opts.frequency);
    }

    // eslint-disable-next-line require-jsdoc
    function _fetchStatusUrl(collection, scale) {
      opts.handleStatusUrl = opts.handleStatusUrl || _defaultHandleStatusUrl;

      $.ajax({
        url: '//export.mapknitter.org/export',
        crossDomain: true,
        type: 'POST',
        data: {
          collection: JSON.stringify(collection.images),
          scale: scale,
        },
        success: opts.handleStatusUrl, // this handles the initial response
      });
    }

    _fetchStatusUrl(opts.collection, opts.scale);
  },

  _addToolbar: function() {
    var group = this._group;
    var map = group._map;

    if (group.options.suppressToolbar || this.toolbar) { return; }

    this.toolbar = L.distortableImage.controlBar({
      actions: this.editActions,
      position: 'topleft',
    }).addTo(map, group);
  },

  _removeToolbar: function() {
    var map = this._group._map;
    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    } else {
      return false;
    }
  },

  hasTool: function(value) {
    return this.editActions.some(function(action) {
      return action === value;
    });
  },

  addTool: function(value) {
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
    } else {
      return false;
    }
  },

  removeTool: function(value) {
    this.editActions.some(function(item, idx) {
      if (this.editActions[idx] === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    }, this);
  },
});

L.distortableCollection.edit = function(group, options) {
  return new L.DistortableCollection.Edit(group, options);
};
