L.RotateScaleHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotateScale',
		icon: L.icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
			iconSize: [32, 32],
			iconAnchor: [16, 16]
		})
	},

	_onHandleDrag: function() {
		var overlay = this._handled,
			edit = overlay.editing,
			formerLatLng = overlay.getCorner(this._corner),
			newLatLng = this.getLatLng(),

			angle = this.calculateAngleDelta(formerLatLng, newLatLng),
			scale = this._calculateScalingFactor(formerLatLng, newLatLng);
		
		if (angle !== 0) { edit._rotateBy(angle); }

		/* 
		  checks whether the "edgeMinWidth" property is set and tracks the minimum edge length;
		  this enables preventing scaling to zero, but we might also add an overall scale limit
		*/		
		if (overlay.hasOwnProperty('edgeMinWidth')){
			var edgeMinWidth = overlay.edgeMinWidth,
			    w = L.latLng(overlay.getCorner(0)).distanceTo(overlay.getCorner(1)),
					h = L.latLng(overlay.getCorner(1)).distanceTo(overlay.getCorner(2));
			if ((w > edgeMinWidth && h > edgeMinWidth) || scale > 1) {
				edit._scaleBy(scale);
			}
		} 

		overlay.fire('update');
		edit._updateToolbarPos();
	},

	updateHandle: function() {
		this.setLatLng(this._handled.getCorner(this._corner));
	},
});
