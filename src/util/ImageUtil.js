L.ImageUtil = {

  getCmPerPixel(overlay) {
    var map = overlay._map;

    var dist = map
        .latLngToLayerPoint(overlay.getCorner(0))
        .distanceTo(map.latLngToLayerPoint(overlay.getCorner(1)));

    return (dist * 100) / overlay.getElement().width;
  },
};
