L.WarpHandle = L.EditHandle.extend({
	options: {
		TYPE: 'warp'
	},

	_onHandleDrag: function() {
		this._handled._updateCorner(this._corner, this.getLatLng());
	}
});