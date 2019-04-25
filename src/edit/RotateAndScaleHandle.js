L.RotateAndScaleHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotate',
		icon: new L.Icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
			iconSize: [32, 32],
			iconAnchor: [16, 16]}
		)
	},

	_onHandleDrag: function() {
		var overlay = this._handled,
			formerLatLng = this._handled._corners[this._corner],
			newLatLng = this.getLatLng(),

			angle = this._calculateAngle(formerLatLng, newLatLng),
			scale = this._calculateScalingFactor(formerLatLng, newLatLng);

		overlay.editing._rotateBy(angle);

		/* 
		  checks whether the "edgeMinWidth" property is set and tracks the minimum edge length;
		  this enables preventing scaling to zero, but we might also add an overall scale limit
		*/		
		if (this._handled.options.hasOwnProperty('edgeMinWidth')){
			var edgeMinWidth = this._handled.options.edgeMinWidth,
			    w = L.latLng(overlay._corners[0]).distanceTo(overlay._corners[1]),
			    h = L.latLng(overlay._corners[1]).distanceTo(overlay._corners[2]);
			if ((w > edgeMinWidth && h > edgeMinWidth) || scale > 1) {
				overlay.editing._scaleBy(scale);
			}
		} 

		overlay.fire('update');

		this._handled.editing._showToolbar();

	},

	updateHandle: function() {
		this.setLatLng(this._handled._corners[this._corner]);
	},

	/* Takes two latlngs and calculates the angle between them. */
	_calculateAngle: function(latlngA, latlngB) {
		var map = this._handled._map,

			centerPoint = map.latLngToLayerPoint(this._handled.getCenter()),
			formerPoint = map.latLngToLayerPoint(latlngA),
			newPoint = map.latLngToLayerPoint(latlngB),

			initialAngle = Math.atan2(centerPoint.y - formerPoint.y, centerPoint.x - formerPoint.x),
			newAngle = Math.atan2(centerPoint.y - newPoint.y, centerPoint.x - newPoint.x);

		return newAngle - initialAngle;
	},

	/* Takes two latlngs and calculates the scaling difference. */
	_calculateScalingFactor: function(latlngA, latlngB) {
		var map = this._handled._map,

			centerPoint = map.latLngToLayerPoint(this._handled.getCenter()),
			formerPoint = map.latLngToLayerPoint(latlngA),
			newPoint = map.latLngToLayerPoint(latlngB),

			formerRadiusSquared = this._d2(centerPoint, formerPoint),
			newRadiusSquared = this._d2(centerPoint, newPoint);

		return Math.sqrt(newRadiusSquared / formerRadiusSquared);
	},

	/* Distance between two points in cartesian space, squared (distance formula). */
	_d2: function(a, b) {
		var dx = a.x - b.x,
			dy = a.y - b.y;

		return Math.pow(dx, 2) + Math.pow(dy, 2);
	}
});
