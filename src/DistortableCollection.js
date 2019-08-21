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
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.on(layer._image, {
      mousedown: this._deselectOthers,
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
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect,
    }, this);
  },

  _longPressMultiSelect: function(e) {
    if (!this.editable) { return; }

    e.preventDefault();

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (layer.getElement() === e.target && edit.enabled()) {
        L.DomUtil.toggleClass(layer.getElement(), 'selected');
        if (this.anySelected()) {
          edit._deselect();
          this.editing._addToolbar(); 
        }
        else { this.editing._removeToolbar(); }
      }
    }, this);
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
   * @param {number} cpd (=== cornerPointDelta)
   * @param {object} overlay
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
  }
});

L.distortableCollection = function(id, options) {
  return new L.DistortableCollection(id, options);
};
