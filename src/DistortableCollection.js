L.DistortableCollection = L.FeatureGroup.extend({
  options: {
    editable: true
  },

  initialize: function(options) {
    L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, options);

    this.editable = this.options.editable;
  },

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    if (this.editable) { this.editing.enable(); }

    /** 
     * although we have a DistortableCollection.Edit class that handles collection events to keep our code managable,
     * events that need to be added on individual images are kept here to do so through `layeradd`.
     */
    this.on('layeradd', this._addEvents, this);
    this.on('layerremove', this._removeEvents, this);
  },

  onRemove: function() {
    if (this.editing) { this.editing.disable(); }

    this.off('layeradd', this._addEvents, this);
    this.off('layerremove', this._removeEvents, this);
  },

  _addEvents: function(e) {
    var layer = e.layer;

    L.DomEvent.on(layer, {
      dragstart: this._dragStartMultiple, 
      drag: this._dragMultiple
    }, this);

    L.DomEvent.on(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect  /* Enable longpress for multi select for touch devices. */
    }, this);
  },

  _removeEvents: function(e) {
    var layer = e.layer; 

    L.DomEvent.off(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple
    }, this);

    L.DomEvent.off(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect
    }, this);
  },

  _longPressMultiSelect: function(e) {
    var image = e.target;

     e.preventDefault();
     if (this.editable) { 
       L.DomUtil.toggleClass(image, 'selected');
       this.editing._addToolbar();
     }
  },

  isSelected: function (overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), 'selected');
  },

  anySelected: function() {
    var layerArr = this.getLayers();
    return layerArr.some(this.isSelected.bind(this));
  },

  _toggleMultiSelect: function(e, edit) {
    if (e.shiftKey) {
      /** conditional prevents disabled images from flickering multi-select mode */
      if (edit.enabled()) { L.DomUtil.toggleClass(e.target, 'selected'); }
    }

    if (this.anySelected()) {
      edit._deselect();
    } else {
      this.editing._removeToolbar();
    }
  },

  _deselectOthers: function(e) {
    if (!this.editable) { return; }

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (layer.getElement() !== e.target) {
        edit._deselect();
      } else {
        this._toggleMultiSelect(e, edit);
      }
    }, this);

    L.DomEvent.stopPropagation(e);
  },

  _dragStartMultiple: function(e) {
    var overlay = e.target,
        i;

    if (!this.isSelected(overlay) || !overlay.editing.enabled()) { 
      return; 
    }

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      edit._deselect();

      for (i = 0; i < 4; i++) {
        layer._dragStartPoints[i] = layer._map.latLngToLayerPoint(layer.getCorner(i));
      }
    });
  },

  _dragMultiple: function(e) {
    var overlay = e.target,
        map = this._map,
        i;

    if (!this.isSelected(overlay) || !overlay.editing.enabled()) {
      return;
    }

    overlay._dragPoints = {};

    for (i = 0; i < 4; i++) {
      overlay._dragPoints[i] = map.latLngToLayerPoint(overlay.getCorner(i));
    }

    var cpd = overlay._calcCornerPointDelta();

    this._updateCollectionFromPoints(cpd, overlay);
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
      layer.setCornersFromPoints(layer._cpd);
    });
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
