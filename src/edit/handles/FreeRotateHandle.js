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
    const overlay = this._handled;
    const map = overlay._map;
    const formerLatLng = overlay.getCorner(this._corner);
    const newLatLng = this.getLatLng();
    const angle = this.calculateAngleDelta(formerLatLng, newLatLng);
    const scale = this._calculateScalingFactor(formerLatLng, newLatLng);

    if (angle !== 0) { overlay.rotateBy(angle, 'rad'); }

    let edgeMinWidth = overlay.edgeMinWidth;
    if (!edgeMinWidth) { edgeMinWidth = 50; } /* just in case */

    const corner1 = map.latLngToContainerPoint(overlay.getCorner(0));
    const corner2 = map.latLngToContainerPoint(overlay.getCorner(1));
    const w = Math.abs(corner1.x - corner2.x);
    const h = Math.abs(corner1.y - corner2.y);
    const distance = Math.sqrt(w * w + h * h);
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
