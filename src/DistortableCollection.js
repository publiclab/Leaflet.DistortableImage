L.DistortableCollection = L.FeatureGroup.extend({
  include: L.Mixin.Events,


  // TODO: do feature groups only allow for click event groupings. do other events just not propogate
  onAdd: function (map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;
    this.eachLayer(function(layer) {
      L.DomEvent.on(layer._image, 'mousedown', this._toggleSelections);
    }, this);
   
  },

  onRemove: function(map) {
    window.mapp = map;
    // this.eachLayer(function (layer) {
    //   layer.on(this, 'mousedown', this._toggleSelections);
    // });
    // this.eachLayer(function (layer) {
      // this.on('mousedown', this._toggleSelections);
    // });
    // L.DomEvent.off(this, 'mousedown', this._toggleSelections);
    //  L.DomEvent.on(this, 'mousedown', this._toggleSelections);
  },

  _getSelectedImages: function () {
    return this.getLayers();
  },

  _toggleSelections: function (event) {
      window.prompt("you made it");
      window.ttarget = event;
    //   map = overlay._map;

    // if (!(group instanceof L.DistortableCollection) || this._mode === 'lock') { return; }

    // if (event.metaKey || event.ctrlKey) {
    //   L.DomUtil.toggleClass(target, 'selected');
    // }

    // if (L.DomUtil.hasClass(target, 'selected')) {
    //   group.addLayer(overlay);
    // } else {
    //   group.removeLayer(overlay);
    //   overlay.addTo(map);
    //   overlay.editing.enable();
    // }
  },

  /**
   * images in 'lock' mode are included in this feature group collection for functionalities 
   * such as export, but are filtered out for editing / dragging here
   */
  _calcCollectionFromPoints: function (cornerPointDelta, overlay) {
    var layersToMove = [];
    var transformation = new L.Transformation(1, -cornerPointDelta.x, 1, -cornerPointDelta.y);
    this.eachLayer(function (layer) {
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

  _updateCollectionFromPoints: function (cornerPointDelta, overlay) {
    
    var layersToMove = this._calcCollectionFromPoints(cornerPointDelta, overlay);

    layersToMove.forEach(function (layer) {
      layer._updateCornersFromPoints(layer._objD);
      layer.fire('update');
    });
  },
  
});