L.DistortableCollection = L.FeatureGroup.extend({
  include: L.Mixin.Events,

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    L.DomEvent.on(document, "keydown", this._onKeyDown, this);

    L.DomEvent.on(map, "click", this._removeSelections, this);
    L.DomEvent.on(map, "boxzoomend", this._addSelections, this);
    
    this.eachLayer(function(layer) {
      L.DomEvent.on(layer, "dragstart", this._dragStartMultiple, this);
      L.DomEvent.on(layer, "drag", this._dragMultiple, this);
    }, this);
  },

  onRemove: function() {
    var map = this._map;

    L.DomEvent.off(document, "keydown", this._onKeyDown, this);

    L.DomEvent.off(map, "click", this._removeSelections, this);
    L.DomEvent.off(map, "boxzoomend", this._addSelections, this);

    this.eachLayer(function(layer) {
      L.DomEvent.off(layer, "dragstart", this._dragStartMultiple, this);
      L.DomEvent.off(layer, "drag", this._dragMultiple, this);
    }, this);
  },


  isSelected: function (overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), "selected");
  },

  _addSelections: function(e) {
    var box = e.boxZoomBounds,
      i = 0;

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (edit.toolbar) { edit._hideToolbar(); }
      for (i = 0; i < 4; i++) {
        if (box.contains(layer.getCorners()[i]) && edit._mode !== "lock") {
          L.DomUtil.addClass(layer.getElement(), "selected");
          break;
        }
      }
    });
  },

  _onKeyDown: function (e) {
    if (e.key === 'Escape') {
      this._removeSelections();
    }
  },

  _dragStartMultiple: function(event) {
    var overlay = event.target,
      i;

    if (!this.isSelected(overlay)) { return; }

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
  },

  _dragMultiple: function(event) {
    var overlay = event.target,
      map = this._map,
      i;

    if (!this.isSelected(overlay)) { return; }

    overlay._dragPoints = {};

    for (i = 0; i < 4; i++) {
      overlay._dragPoints[i] = map.latLngToLayerPoint(overlay.getCorners()[i]);
    }

    var cornerPointDelta = overlay._calcCornerPointDelta();

    this._updateCollectionFromPoints(cornerPointDelta, overlay);
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
      p = new L.Transformation(1, -cpd.x, 1, -cpd.y);

    this.eachLayer(function(layer) {
      if (
        layer !== overlay &&
        layer.editing._mode !== "lock" &&
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
    var layersToMove = this._calcCollectionFromPoints(
      cpd,
      overlay
    );

    layersToMove.forEach(function(layer) {
      layer._updateCornersFromPoints(layer._cpd);
      layer.fire("update");
    }, this);
  }
});