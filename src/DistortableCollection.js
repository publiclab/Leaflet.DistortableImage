L.DistortableCollection = L.FeatureGroup.extend({
  include: L.Mixin.Events,

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    L.DomEvent.on(map, "click", this._removeSelections, this);

    this.eachLayer(function(layer) {
      L.DomEvent.on(layer, "drag", this._dragMultiple, this);
      L.DomEvent.on(layer, "dragstart", this._dragStartMultiple, this);
    }, this);
  },

  isSelected: function(overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), "selected");
  },

  onRemove: function() {
    var map = this._map;

    L.DomEvent.off(map, "click", this._removeSelections, this);

    this.eachLayer(function(layer) {
      L.DomEvent.off(layer, "drag", this._dragMultiple, this);
      L.DomEvent.off(layer, "dragstart", this._dragStartMultiple, this);
    }, this);
  },

  _getSelectedImages: function() {
    return this.getLayers();
  },

  _dragStartMultiple: function(event) {
    var overlay = event.target,
      i;

    if (!this.isSelected(overlay)) {
      return;
    }

    this.eachLayer(function(layer) {
      for (i = 0; i < 4; i++) {
        if (layer !== overlay) {
          layer.editing._hideToolbar();
        }
        layer._dragStartPoints[i] = layer._map.latLngToLayerPoint(
          layer.getCorners()[i]
        );
      }
    });

    overlay._cornerPointDelta = {};
  },

  _dragMultiple: function(event) {
    var overlay = event.target,
      map = this._map,
      i;

    if (!this.isSelected(overlay)) {
      return;
    }

    overlay._dragPoints = {};

    for (i = 0; i < 4; i++) {
      overlay._dragPoints[i] = map.latLngToLayerPoint(overlay.getCorners()[i]);
    }

    overlay._cornerPointDelta = overlay._calcCornerPointDelta();

    this._updateCollectionFromPoints(overlay._cornerPointDelta, overlay);
  },

  _removeSelections: function() {
    this.eachLayer(function(layer) {
      L.DomUtil.removeClass(layer.getElement(), "selected");
      if (layer.editing.toolbar) {
        layer.editing._hideToolbar();
      }
    });
  },

  /**
   * images in 'lock' mode are included in this feature group collection for functionalities
   * such as export, but are filtered out for editing / dragging here
   */
  _calcCollectionFromPoints: function(cpd, overlay) {
    var layersToMove = [],
      transformation = new L.Transformation(1, -cpd.x, 1, -cpd.y);

    this.eachLayer(function(layer) {
      if (
        layer !== overlay &&
        layer.editing._mode !== "lock" &&
        this.isSelected(layer)
      ) {
        layer._objD = {};

        layer._objD.newVal = transformation.transform(
          layer._dragStartPoints[0]
        );
        layer._objD.newVal1 = transformation.transform(
          layer._dragStartPoints[1]
        );
        layer._objD.newVal2 = transformation.transform(
          layer._dragStartPoints[2]
        );
        layer._objD.newVal3 = transformation.transform(
          layer._dragStartPoints[3]
        );

        layersToMove.push(layer);
      }
    }, this);

    return layersToMove;
  },

  _updateCornersFromPoints: function(layer) {
    var map = this._map;
    var i = 0;
    for (var k in layer._objD) {
      layer._corners[i] = map.layerPointToLatLng(layer._objD[k]);
      i += 1;
    }

    layer._reset();
  },

  _updateCollectionFromPoints: function(cornerPointDelta, overlay) {
    var layersToMove = this._calcCollectionFromPoints(
      cornerPointDelta,
      overlay
    );

    layersToMove.forEach(function(layer) {
      this._updateCornersFromPoints(layer);
      layer.fire("update");
    }, this);
  }
});