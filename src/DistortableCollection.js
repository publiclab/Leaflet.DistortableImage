L.DistortableCollection = L.FeatureGroup.extend({
  include: L.Mixin.Events,

  // TODO: save all essential image properties in an easily iterable object locally


  // TODO: do feature groups only allow for click event groupings. do other events just not propogate
  onAdd: function (map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;
    this._members = {};

    window._members = this._members;

    L.DomEvent.on(map, 'layeradd', this._getFeatureGroupId, this);
    L.DomEvent.on(map, 'click', this._removeSelections, this);
    
    
  },

  onRemove: function() {
    var map = this._map;
    L.DomEvent.off(map, 'layeradd', this._getFeatureGroupId, this);
    L.DomEvent.off(map, 'click', this._removeSelections, this);
    // window.map = map;
    // this.eachLayer(function (layer) {
    //   L.DomEvent.on(layer._image, 'mousedown', this._toggleSelections, this);
    // }, this);
  },

  _getSelectedImages: function () {
    return this.getLayers();
  },

  _getFeatureGroupId: function (event) {
    window.eventy = event;
    var layer = event.layer;
    window.layery = layer;

    if (event.layer instanceof L.DistortableCollection) {
      this._id = this.getLayerId(event.layer);
    }

    this.eachLayer(function(layer) {
      this._members[this.getLayerId(layer)] = { 
        layer: layer,
        mode: layer.editing._mode,
        image: layer._image
      };
    }, this);

    for (var k in this._members) {
      L.DomEvent.on(this._members[k].image, "mousedown", this._toggleSelections, this);
      L.DomEvent.on(this._members[k].layer, "drag", this._dragMultiple, this);
      L.DomEvent.on(this._members[k].layer, 'dragstart', this._dragStartMultiple, this);
      // L.DomEvent.on(this._map, 'click', this._removeSelections, this);
    }
  },

  _dragMultiple: function (event) {
    var layer = event.target,
      map = this._map,
      i;
 
    // var layer = this,
      // map = this._map,
      // i;

    window.eventT = event;

    // if (!this.isSelected(overlay)) { return; }
    // if (this._group._getSelectedImages().length <= 1) { return; }

    layer._dragPoints = {};

    for (i = 0; i < 4; i++) {
      layer._dragPoints[i] = map.latLngToLayerPoint(layer.getCorners()[i]);
    }

    layer._cornerPointDelta = this._calcCornerPointDelta(layer);

    this._updateCollectionFromPoints(layer._cornerPointDelta, layer);
  },

  _dragStartMultiple: function (event) {
    var overlay = event.target,
      i;

    // if (!this.isSelected(overlay)) { return; }
    // if (!(this._group instanceof L.DistortableCollection)) { return; }
    // if (this._group._getSelectedImages().length <= 1) { return; }

    this.eachLayer(function (layer) {
      for (i = 0; i < 4; i++) {
        if (layer !== overlay) { layer.editing._hideToolbar(); }
        layer._dragStartPoints[i] = layer._map.latLngToLayerPoint(layer.getCorners()[i]);
      }
    });

    overlay._cornerPointDelta = {};
  },

  _calcCornerPointDelta: function (layer) {
    return layer._dragStartPoints[0].subtract(layer._dragPoints[0]);
  },

  _toggleSelections: function (event) {
    var target = event.target,
      members = this._members,
      member;

    for (var k in members) {
      if (members[k].image === target) {
        member = members[k];
        break;
      }
    }

    if (member) {
      if (member.mode === 'lock') { return; }
    }

    if (event.metaKey || event.ctrlKey) {
      L.DomUtil.toggleClass(target, 'selected');
    }
  },

  _removeSelections: function () {
    this.eachLayer(function (layer) {
      L.DomUtil.removeClass(layer.getElement(), 'selected');
      if (layer.editing.toolbar) { layer.editing._hideToolbar(); }
    });
  },

  /**
   * images in 'lock' mode are included in this feature group collection for functionalities 
   * such as export, but are filtered out for editing / dragging here
   */
  _calcCollectionFromPoints: function (cornerPointDelta, overlay) {
    var layersToMove = [];
    var transformation = new L.Transformation(1, -cornerPointDelta.x, 1, -cornerPointDelta.y);
    this.eachLayer(function (layer) {
      window.layerrr = layer;
      if (layer !== overlay && layer.editing._mode !== 'lock') {
        layer._objD = {};

        layer._objD.newVal = transformation.transform(layer._dragStartPoints[0]);
        layer._objD.newVal1 = transformation.transform(layer._dragStartPoints[1]);
        layer._objD.newVal2 = transformation.transform(layer._dragStartPoints[2]);
        layer._objD.newVal3 = transformation.transform(layer._dragStartPoints[3]);

        layersToMove.push(layer);
      }
    });

    return layersToMove;
  },

  _updateCornersFromPoints: function (layer) {
    var map = this._map;
    var i = 0;
    for (var k in layer._objD) {
      layer._corners[i] = map.layerPointToLatLng(layer._objD[k]);
      i += 1;
    }

    layer._reset();
  },

  _updateCollectionFromPoints: function (cornerPointDelta, overlay) {
    
    var layersToMove = this._calcCollectionFromPoints(cornerPointDelta, overlay);

    layersToMove.forEach(function (layer) {
      this._updateCornersFromPoints(layer);
      layer.fire('update');
    }, this);
  },
  
});