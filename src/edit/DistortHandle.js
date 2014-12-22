L.DistortHandle = L.EditHandle.extend({
	options: {
		TYPE: 'distort',
		icon: new L.Icon({
			iconUrl: '../src/images/circle-o_444444_16.png',
			iconSize: [16, 16],
			iconAnchor: [8, 8]}
		)
	},

	updateHandle: function() {
		this.setLatLng(this._handled._corners[this._corner]);
	},

	_onHandleDrag: function() {
		this._handled._updateCorner(this._corner, this.getLatLng());

		this._handled.fire('update');
	}
});