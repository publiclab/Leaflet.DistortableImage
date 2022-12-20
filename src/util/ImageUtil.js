L.ImageUtil = {

  getCmPerPixel(overlay) {
    let map = overlay._map;

    let dist = map
        .latLngToLayerPoint(overlay.getCorner(0))
        .distanceTo(map.latLngToLayerPoint(overlay.getCorner(1)));

    return (dist * 100) / overlay.getElement().width;
  },
};
