L.DistortableCollection = L.FeatureGroup.extend({
  options: {
    editable: true,
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
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.on(layer._image, {
      mousedown: this._decollectOthers,
      /* Enable longpress for multi select for touch devices. */
      contextmenu: this._longPressMultiSelect,
    }, this);
  },

  _removeEvents: function(e) {
    var layer = e.layer;

    L.DomEvent.off(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.off(layer._image, {
      mousedown: this._decollectOthers,
      contextmenu: this._longPressMultiSelect,
    }, this);
  },

  _longPressMultiSelect: function(e) {
    if (!this.editable) { return; }

    e.preventDefault();

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (layer.getElement() === e.target && edit.enabled()) {
        L.DomUtil.toggleClass(layer.getElement(), 'collected');
        if (this.anyCollected()) {
          layer._unpick();
          this.editing._addToolbar();
        } else {
          this.editing._removeToolbar();
        }
      }
    }, this);
  },

  isCollected: function(overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), 'collected');
  },

  anyCollected: function() {
    var layerArr = this.getLayers();
    return layerArr.some(this.isCollected.bind(this));
  },

  _toggleMultiCollect: function(e, layer) {
    if (e.shiftKey) {
      /** conditional prevents disabled images from flickering multi-select mode */
      if (layer.editing.enabled()) {
        L.DomUtil.toggleClass(e.target, 'collected');
      }
    }

    if (this.anyCollected()) { layer._unpick(); }
    else { this.editing._removeToolbar(); }
  },

  _decollectOthers: function(e) {
    if (!this.editable) { return; }

    this.eachLayer(function(layer) {
      if (layer.getElement() !== e.target) {
        layer._unpick();
      } else {
        this._toggleMultiCollect(e, layer);
      }
    }, this);

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  _dragStartMultiple: function(e) {
    var overlay = e.target;
    var map = this._map;

    if (!this.isCollected(overlay)) { return; }

    var layersToMove = this._toMove(overlay);

    layersToMove.forEach(function(layer) {
      layer._dragStartPoints = {};
      layer._unpick();
      for (var i = 0; i < 4; i++) {
        var c = layer.getCorner(i);
        layer._dragStartPoints[i] = map.latLngToLayerPoint(c);
      }
    });
  },

  _dragMultiple: function(e) {
    var overlay = e.target;
    var edit = overlay.editing;
    var map = this._map;

    if (!this.isCollected(overlay)) { return; }

    var topLeft = map.latLngToLayerPoint(overlay.getCorner(0));
    var delta = edit.dragging._startPos.subtract(topLeft);

    this._updateCollectionFromPoints(delta, overlay);
  },

  _toRemove: function() {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var mode = layer.editing._mode;
      return (this.isCollected(layer) && mode !== 'lock');
    }, this);
  },

  _toMove: function(overlay) {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var mode = layer.editing._mode;
      return layer !== overlay && this.isCollected(layer) && mode !== 'lock';
    }, this);
  },

  _updateCollectionFromPoints: function(delta, overlay) {
    var layersToMove = this._toMove(overlay);
    var p = new L.Transformation(1, -delta.x, 1, -delta.y);

    layersToMove.forEach(function(layer) {
      var movedPoints = {};
      for (var i = 0; i < 4; i++) {
        movedPoints[i] = p.transform(layer._dragStartPoints[i]);
      }
      layer.setCornersFromPoints(movedPoints);
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
      if (this.isCollected(layer)) {
        var sections = layer._image.src.split('/');
        var filename = sections[sections.length-1];
        var zc = layer.getCorners();
        var corners = [
          {lat: zc[0].lat, lon: zc[0].lng},
          {lat: zc[1].lat, lon: zc[1].lng},
          {lat: zc[3].lat, lon: zc[3].lng},
          {lat: zc[2].lat, lon: zc[2].lng},
        ];
        json.images.push({
          id: this.getLayerId(layer),
          src: layer._image.src,
          width: layer._image.width,
          height: layer._image.height,
          image_file_name: filename,
          nodes: corners,
          cm_per_pixel: L.ImageUtil.getCmPerPixel(layer),
        });
      }
    }, this);

    json.images = json.images.reverse();
    json.avg_cm_per_pixel = this._getAvgCmPerPixel(json.images);

    return json;
  },
});

L.distortableCollection = function(id, options) {
  return new L.DistortableCollection(id, options);
};
