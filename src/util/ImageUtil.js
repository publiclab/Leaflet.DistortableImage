L.ImageUtil = {

  getCmPerPixel(overlay) {
    const map = overlay._map;

    const dist = map
        .latLngToLayerPoint(overlay.getCorner(0))
        .distanceTo(map.latLngToLayerPoint(overlay.getCorner(1)));

    return (dist * 100) / overlay.getElement().width;
  },
};
