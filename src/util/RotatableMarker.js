L.RotatableMarker = L.Marker.extend({

	options: {
		rotation: 0
	},

	initialize: function(latlng, options) {
		L.Marker.prototype.initialize.call(this, latlng, options);
		this.setRotation(this.options.rotation);
	},

	setRotation: function(theta) {
		this._rotation = theta;
		
		this.update();
		this.fire('rotate', { rotation: this._rotation });

		return this;
	},

	getRotation: function() {
		return this._rotation;
	},

	_setPos: function(pos) {
		var rotation = this.getRotation(),
			transformString = [L.DomUtil.getTranslateString(pos), L.DomUtil.getRotateString(rotation, 'rad')].join(' ');

		this._icon._leaflet_pos = pos;
		this._icon.style[L.DomUtil.TRANSFORM] = transformString;

		if (this._shadow) {
			this._shadow._leaflet_pos = pos;
			this._shadow.style[L.DomUtil.TRANSFORM] = transformString;
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	}
});

L.rotatableMarker = function(latlng, options) {
	return new L.RotatableMarker(latlng, options);
};