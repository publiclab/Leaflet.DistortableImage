L.DistortableCollection = L.FeatureGroup.extend({

  // DistortableImage.Edit events are automatically propogated to the feature group
  
//   initialize: function () {

//     L.featureGroup.prototype.initialize.call(this);

//   },

  _getSelectedImages: function () {
    return this.getLayers();
  },

  _calcCollectionFromPoints: function (cornerPointDelta, overlay) {
    var layersToMove = [];
    var transformation = new L.Transformation(1, -cornerPointDelta.x, 1, -cornerPointDelta.y);
    this.eachLayer(function (layer) {
      if (layer !== overlay) {
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

//   _toggleSelections: function (event) {
//     var overlay = this._overlay,
//       target = event.target,
//       map = overlay._map;

//     if (event.metaKey || event.ctrlKey) {
//       // TODO: make a toggleClass DOM Util method
//       $(target).toggleClass('selected');
//     }

//     if (L.DomUtil.hasClass(target, 'selected')) {
//       window.imagesFeatureGroup.addLayer(overlay);
//     } else {
//       window.imagesFeatureGroup.removeLayer(overlay);
//       // window.overlay = overlay;
//       overlay.addTo(map);
//       overlay.editing.enable();
//       // overlay._reset();
//       // overlay.fire('update');
//     }
//   },
});