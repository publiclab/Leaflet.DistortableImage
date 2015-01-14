L.LockHandle = L.EditHandle.extend({
	options: {
		TYPE: 'lock',
		icon: new L.Icon({ 
			iconUrl: '../src/images/close_444444_16.png',
			iconSize: [16, 16],
			iconAnchor: [8, 8]}
		)
	},

	_onHandleDrag: function() {
		//this.setLatLng(this._handled._corners[this._corner]);
	},

	updateHandle: function() {
		this._handled._updateCorner(this._corner, this.getLatLng());

		//this._handled.fire('update');
	}

});
