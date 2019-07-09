L.DistortableCollection = L.FeatureGroup.extend({

  initialize: function(options) {
    L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, options);
  },

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    this.on("layeradd", this._turnOnEditing, this);
    this.on("layerremove", this._turnOffEditing, this);

    L.DomEvent.on(document, "keydown", this._onKeyDown, this);

    L.DomEvent.on(map, { 
      click: this._deselectAll, 
      boxzoomend: this._addSelections 
    }, this);
  },

  onRemove: function() {
    var map = this._map;

    this.off("layeradd", this._turnOnEditing, this);
    this.off("layerremove", this._turnOffEditing, this);

    L.DomEvent.off(document, "keydown", this._onKeyDown, this);

    L.DomEvent.off(map, {
      click: this._deselectAll,
      boxzoomend: this._addSelections
    }, this);
  },

  _turnOnEditing: function(e) {
    var layer = e.layer; 
    
    layer.editing.enable();

    L.DomEvent.on(layer, {
      dragstart: this._dragStartMultiple, 
      drag: this._dragMultiple
    }, this);

    L.DomEvent.on(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect  /* Enable longpress for multi select for touch devices. */
    }, this);
  },

  _turnOffEditing: function(e) {
    var layer = e.layer; 

    layer.editing.disable();

    L.DomEvent.off(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple
    }, this);

    L.DomEvent.off(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect
    }, this);
  },

  _addToolbar: function() {
    try {
      if (!this.toolbar) {
        this.toolbar = L.distortableImage.controlBar({
          actions: this.editActions,
          position: 'topleft'
        }).addTo(this._map, this);
        this.fire("toolbar:created");
      }
    } catch (e) { }
  },

  _removeToolbar: function() {
    var map = this._map;

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
    this.editActions.some(function (item, idx) {
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

  _longPressMultiSelect: function(e) {
    var image = e.target;

     e.preventDefault();
     L.DomUtil.toggleClass(image, 'selected');
     this._addToolbar();
  },

  isSelected: function (overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), 'selected');
  },

  anySelected: function() {
    var layerArr = this.getLayers();

    return layerArr.some(this.isSelected.bind(this));
  },

  _toggleMultiSelect: function(event, edit) {
    if (event.metaKey || event.ctrlKey) {
      L.DomUtil.toggleClass(event.target, 'selected');
    }

    if (this.anySelected()) {
      edit._deselect();
    } else {
      this._removeToolbar();
    }
  },

  _deselectOthers: function(event) {
    this.eachLayer(function(layer) {

      var edit = layer.editing;
      if (layer.getElement() !== event.target) {
        edit._deselect();
      } else {
        this._toggleMultiSelect(event, edit);
      }
    }, this);

    L.DomEvent.stopPropagation(event);
  },

  _addSelections: function(e) {
    var box = e.boxZoomBounds;

    this.eachLayer(function(layer) {
      var imgBounds = new L.latLngBounds(layer.getCorner(2), layer.getCorner(1));
      if (box.intersects(imgBounds)) {
        if (!this.toolbar) { this._addToolbar(); }
        L.DomUtil.addClass(layer.getElement(), 'selected');
      }
    }, this);
  },

  _onKeyDown: function(e) {
    if (e.key === 'Escape') {
      this._deselectAll(e);
    }
    if (e.key === 'Backspace') {
      this._removeGroup(e);
    }
    if (e.key === 'l') {
      this._lockGroup(e);
    }
    if (e.key === 'u') {
      this._unlockGroup(e);
    }
  },

  _dragStartMultiple: function(event) {
    var overlay = event.target,
      i;

    if (!this.isSelected(overlay)) { return; }

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      edit._deselect();

      for (i = 0; i < 4; i++) {
        layer._dragStartPoints[i] = layer._map.latLngToLayerPoint(
          layer.getCorner(i)
        );
      }
    });
  },

  _dragMultiple: function(event) {
    var overlay = event.target,
      map = this._map,
      i;

    if (!this.isSelected(overlay)) { return; }

    overlay._dragPoints = {};

    for (i = 0; i < 4; i++) {
      overlay._dragPoints[i] = map.latLngToLayerPoint(overlay.getCorner(i));
    }

    var cpd = overlay._calcCornerPointDelta();

    this._updateCollectionFromPoints(cpd, overlay);
  },

  _deselectAll: function(event) {
    var oe = event.originalEvent;
    /* prevents image deselection following the 'boxzoomend' event - note 'shift' must not be released until dragging is complete */
    if (oe && oe.shiftKey) { return; }

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      L.DomUtil.removeClass(layer.getElement(), 'selected');
      edit._deselect();
    });

    this._removeToolbar();

    L.DomEvent.stopPropagation(event);
  },

  _unlockGroup: function() {
    var map = this._map;

    this.eachLayer(function (layer) {
      if (this.isSelected(layer)) {
        var edit = layer.editing;
        if (edit._mode === 'lock') { 
          map.removeLayer(edit._handles[edit._mode]); 
          edit._unlock();
          edit._refreshPopupIcons();
        }
      }
    }, this);
  },

  _lockGroup: function() {
    var map = this._map;

    this.eachLayer(function (layer) {
      if (this.isSelected(layer) ) {
        var edit = layer.editing;
        if (edit._mode !== 'lock') {
          edit._lock();
          map.addLayer(edit._handles[edit._mode]);
          edit._refreshPopupIcons();
          // map.addLayer also deselects the image, so we reselect here
          L.DomUtil.addClass(layer.getElement(), 'selected');
        }
      }
    }, this);
  },

  _removeGroup: function(event) {
    var layersToRemove = this._toRemove(),
      n = layersToRemove.length;

    if (n === 0) { return; }
    var choice = L.DomUtil.confirmDeletes(n);

    if (choice) {
      layersToRemove.forEach(function(layer) {
        this.removeLayer(layer);
      }, this);

      this._removeToolbar();
    }

    if (event) { L.DomEvent.stopPropagation(event); }
  },

  _toRemove: function() {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var edit = layer.editing;
      return (this.isSelected(layer) && edit._mode !== 'lock');
    }, this);
  },

  _calcCollectionFromPoints: function(cpd, overlay) {
    var layersToMove = [],
      p = new L.Transformation(1, -cpd.x, 1, -cpd.y);

    this.eachLayer(function(layer) {
      if (
        layer !== overlay &&
        layer.editing._mode !== 'lock' &&
        this.isSelected(layer)
      ) {
        layer._cpd = {};

        layer._cpd.val0 = p.transform(layer._dragStartPoints[0]);
        layer._cpd.val1 = p.transform(layer._dragStartPoints[1]);
        layer._cpd.val2 = p.transform(layer._dragStartPoints[2]);
        layer._cpd.val3 = p.transform(layer._dragStartPoints[3]);

        layersToMove.push(layer);
      }
    }, this);

    return layersToMove;
  },

  /**
   * cpd === cornerPointDelta
   */
  _updateCollectionFromPoints: function(cpd, overlay) {
    var layersToMove = this._calcCollectionFromPoints(cpd, overlay);

    layersToMove.forEach(function(layer) {
      layer._setCornersFromPoints(layer._cpd);
      layer.fire('update');
    }, this);
  },

  _getAvgCmPerPixel: function(imgs) {
    var reduce = imgs.reduce(function(sum, img) {
      return sum + img.cm_per_pixel;
    }, 0);
    return reduce / imgs.length;
  },

  generateExportJson: function() {
    var json = {};
    json.images = [];

    this.eachLayer(function(layer) {
      if (this.isSelected(layer)) {
        var sections = layer._image.src.split('/');
        var filename = sections[sections.length-1];
        var zc = layer.getCorners();
        var corners = [
          { lat: zc[0].lat, lon: zc[0].lng },
          { lat: zc[1].lat, lon: zc[1].lng },
          { lat: zc[3].lat, lon: zc[3].lng },
          { lat: zc[2].lat, lon: zc[2].lng }
        ];
        json.images.push({
          id: this.getLayerId(layer),
          src: layer._image.src,
          width: layer._image.width,
          height: layer._image.height,
          image_file_name: filename,
          nodes: corners,
          cm_per_pixel: L.ImageUtil.getCmPerPixel(layer)
        });
      }
    }, this);

    json.images = json.images.reverse();
    json.avg_cm_per_pixel = this._getAvgCmPerPixel(json.images);

    return json;
  },

  startExport: function(opts) {
    opts = opts || {};
    opts.collection = opts.collection || this.generateExportJson();
    opts.frequency = opts.frequency || 3000;
    opts.scale = opts.scale || 100; // switch it to _getAvgCmPerPixel !
    var statusUrl, updateInterval;

    // this may be overridden to update the UI to show export progress or completion
    function _defaultUpdater(data) {
      data = JSON.parse(data);
      // optimization: fetch status directly from google storage:
      if (statusUrl !== data.status_url && data.status_url.match('.json')) { statusUrl = data.status_url; }
      if (data.status === "complete") {
        clearInterval(updateInterval);
      }
      if (data.status === 'complete' && data.jpg !== null) {
        alert("Export succeeded. http://export.mapknitter.org/" + data.jpg);
      }
      // TODO: update to clearInterval when status == "failed" if we update that in this file:
      // https://github.com/publiclab/mapknitter-exporter/blob/main/lib/mapknitterExporter.rb
      console.log(data);
    }

    // receives the URL of status.json, and starts running the updater to repeatedly fetch from status.json; 
    // this may be overridden to integrate with any UI
    function _defaultHandleStatusUrl(data) {
      console.log(data);
      statusUrl = "//export.mapknitter.org" + data;
      opts.updater = opts.updater || _defaultUpdater;

      // repeatedly fetch the status.json
      updateInterval = setInterval(function intervalUpdater() {
        $.ajax(statusUrl + "?" + Date.now(), { // bust cache with timestamp
          type: "GET",
          crossDomain: true
        }).done(function(data) {
            opts.updater(data);
        });
      }, opts.frequency);
    }

    function _fetchStatusUrl(collection, scale) {
      opts.handleStatusUrl = opts.handleStatusUrl || _defaultHandleStatusUrl;

      $.ajax({
        url: "//export.mapknitter.org/export",
        crossDomain: true,
        type: "POST",
        data: {
          collection: JSON.stringify(collection.images),
          scale: scale
        },
        success: opts.handleStatusUrl // this handles the initial response
      });
    }

    _fetchStatusUrl(opts.collection, opts.scale);

  }
});

L.distortableCollection = function(id, options) {
  return new L.DistortableCollection(id, options);
};
