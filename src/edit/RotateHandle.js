L.RotateHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotate',
		icon: new L.Icon({ 
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABG0lEQVR4nKXSvS5EURTF8d8V/SBBr9F7A4zGNy9AQytRKIaCgkQhehrzAmZ8hUI8wYxHmJ7CjCcYxT0nublmJlecZueerPXf69y9k0a57D9nqMfdJI7QRBtfaKCC8bw4ySVYww1G+jRsYwsPvRKsohbMT5jHKMawgOfwfYeVPGACVSQ4xDLe0AldX7GI46CpxudEwE7o/IizPvHhBC8hyU4WsBnq5QBzPBdZTwRMhfpeANDMeiIgCbVbABA1SRbQCnWmACBqWllALdS9AoD9rCcCrvAtXaSDAeYKlqTjvc4CPqQb1sU56phFSTreOen2nQbNdvD8WuV16SqX+iTohEb38WI4J6hjGrvYkI6qK/1htyH2Z9aQT/Dn8wMV5jnxJDAcbAAAAABJRU5ErkJggg%3D%3D',
			iconSize: [16, 16],
			iconAnchor: [8, 8]}
		)
	},

	_onHandleDrag: function() {
		var overlay = this._handled,
			formerLatLng = this._handled._corners[this._corner],
			newLatLng = this.getLatLng(),

			angle = this._calculateAngle(formerLatLng, newLatLng),
			scale = this._calculateScalingFactor(formerLatLng, newLatLng);

		overlay.editing._rotateBy(angle);
		overlay.editing._scaleBy(scale);

		overlay.fire('update');
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
