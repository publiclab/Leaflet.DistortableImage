L.RotateScaleHandle = L.EditHandle.extend({
  options: {
    TYPE: 'freeRotate',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var map = overlay._map;
    var edgeMinWidth = overlay.edgeMinWidth;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();
    var angle = this.calculateAngleDelta(formerLatLng, newLatLng);
    var scale = this._calculateScalingFactor(formerLatLng, newLatLng);

    if (angle !== 0) { overlay.rotateBy(angle); }

    if (!edgeMinWidth) { edgeMinWidth = 50; } /* just in case */
    var corner1 = map.latLngToContainerPoint(overlay.getCorner(0));
    var corner2 = map.latLngToContainerPoint(overlay.getCorner(1));
    var w = Math.abs(corner1.x - corner2.x);
    var h = Math.abs(corner1.y - corner2.y);
    var distance = Math.sqrt(w * w + h * h);
    if (distance > edgeMinWidth || scale > 1) {
      overlay.scaleBy(scale);
    } else {
      overlay.scaleBy(1);
    }
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});
