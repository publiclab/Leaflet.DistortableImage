L.FreeRotateHandle = L.EditHandle.extend({
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

  _onHandleDrag() {
    let overlay = this._handled;
    let map = overlay._map;
    let edgeMinWidth = overlay.edgeMinWidth;
    let formerLatLng = overlay.getCorner(this._corner);
    let newLatLng = this.getLatLng();
    let angle = this.calculateAngleDelta(formerLatLng, newLatLng);
    let scale = this._calculateScalingFactor(formerLatLng, newLatLng);

    if (angle !== 0) {
      overlay.rotateBy(angle, 'rad');
    }

    if (!edgeMinWidth) {
      edgeMinWidth = 50;
    } /* just in case */
    let corner1 = map.latLngToContainerPoint(overlay.getCorner(0));
    let corner2 = map.latLngToContainerPoint(overlay.getCorner(1));
    let w = Math.abs(corner1.x - corner2.x);
    let h = Math.abs(corner1.y - corner2.y);
    let distance = Math.sqrt(w * w + h * h);
    if (distance > edgeMinWidth || scale > 1) {
      overlay.scaleBy(scale);
    } else {
      overlay.scaleBy(1);
    }
  },

  updateHandle() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.freeRotateHandle = (overlay, idx, options) => {
  return new L.FreeRotateHandle(overlay, idx, options);
};
