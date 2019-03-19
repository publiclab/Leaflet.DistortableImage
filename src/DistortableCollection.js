L.DistortableCollection = L.FeatureGroup.extend({

  // DistortableImage.Edit events are automatically propogated to the feature group
  
//   initialize: function () {

//     L.featureGroup.prototype.initialize.call(this);

//   },

  _getSelectedImages: function () {
    return this.getLayers();
  },

  _updateCollectionFromPoints: function (layersToMove) {
    layersToMove.forEach(function (layer) {
      layer._updateCornersFromPoints(layer._objD);
      layer.fire('update');
    });
  },


//   // drag events for multiple images are separated out from enableDragging initialization -- two different concepts
//   _dragStartMultiple: function() {
//     var overlay = this._overlay,
//       map = overlay._map;

//     if (!L.DomUtil.hasClass(overlay.getElement(), 'selected')) { return; }
//     if (window.imagesFeatureGroup._getSelectedImages().length <= 1) { return; }

//     overlay._startCornerPoints = {};

//     window.obj = {};

//     window.obj.initVal = 0;
//     window.obj.initVal1 = 0;
//     window.obj.initVal2 = 0;
//     window.obj.initVal3 = 0;

//     var i = 0;
//     for (var k in window.obj) {
//       window.obj[k] = map.latLngToLayerPoint(window.img.getCorners()[i]);
//       overlay._startCornerPoints[k] = map.latLngToLayerPoint(overlay.getCorners()[i]);
//       i += 1;
//     }

//     overlay._cornerPointDelta = {};

//   },

//   _dragMultiple: function () {
//     var overlay = this._overlay,
//       map = overlay._map;

//     if (!L.DomUtil.hasClass(overlay.getElement(), 'selected')) { return; }
//     if (window.imagesFeatureGroup._getSelectedImages().length <= 1) { return; }

//     overlay._currentCornerPoints = {};

//     var i = 0;
//     for (var k in window.obj) {
//       overlay._currentCornerPoints[k] = map.latLngToLayerPoint(overlay.getCorners()[i]);
//       i += 1;
//     }

//     var cornerPointDelta = this.calcCornerDelta(overlay);

//     var objD = this.calcNewCorners(cornerPointDelta);

//     this._updateCorners(objD);
//   },

//   calcCornerDelta: function (overlay) {
//     return overlay._startCornerPoints.initVal.subtract(overlay._currentCornerPoints.initVal);
//   },

//   calcNewCorners: function (cornerPointDelta) {
//     var objD = {};
//     var transformation = new L.Transformation(1, -cornerPointDelta.x, 1, -cornerPointDelta.y);
//     objD.newVal = transformation.transform(window.obj.initVal);
//     objD.newVal1 = transformation.transform(window.obj.initVal1);
//     objD.newVal2 = transformation.transform(window.obj.initVal2);
//     objD.newVal3 = transformation.transform(window.obj.initVal3);

//     return objD;
//   },

//   // TODO: rename so not the same overlay class method
//   _updateCorners: function (objD) {

//     var imgAry = window.imagesFeatureGroup._getSelectedImages();

//     imgAry[0]._updateCornersFromPoints(objD);

//     imgAry[0].fire('update');
//   },

//   _getSelectedImages: function () {

//     return this.getLayers();

//     // TODO: polyline for selection so that it doesn't get distorted
//     // this._polyline = L.polyline(polyline_array);
//     // this._overlay._map.eachLayer(function (layer) {
//     // 	if layer 
//     // 	console.log(layer.name);
//     // });
//   },

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