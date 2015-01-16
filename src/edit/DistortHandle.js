L.DistortHandle = L.EditHandle.extend({
	options: {
		TYPE: 'distort',
		icon: new L.Icon({
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABH0lEQVR4nKXTvy5EURDH8c8V/SJBr9HzBFiN/7wAzWolIoqloCBRiJ7GvoBd/0IhnsB6hO0pWE+wintOcnKzZMUkN5Mzmd/3zNyZk5XLZf+xvi6xUeyjiU984AVVDBeT+wvnZVxioBCfDN8O1nHbrYIl1IP4HjMYxBBm8RDO11gsAkZQQ4Y9LOAZ7dDGE+ZwEHJqsZ0IqISb73Bc7DOxQzyGSiopYC34s1/E0U5TTQSMBf/aA6CZaiIgC77TAyDmZCmgFfxED4CY00oB9eC3egBsp5oIOMeXfJF2fxFXMS8f70UKeJNvWAcnaGAKJfl4p+XbdxRyNoJGVnhMK/JVLv1QQTtcdBMDxbfQwDg2sSofVUf+w65C2e+poFjBn+0bdEY280EXr3wAAAAASUVORK5CYII%3D',
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
