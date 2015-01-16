L.LockHandle = L.EditHandle.extend({
	options: {
		TYPE: 'lock',
		icon: new L.Icon({ 
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA3ElEQVR4nM3TMU4CQRSH8d8qJ6AgFia2xksYkj0AhVa2JhRGbfEENJyA3oIjUHkFG42tHUE08QAGC8YwjG8LQsOrdnfm+/Y/7+1WdV3bpQ52ogPBJW6CfUcY4aRcaGXX1xijwjEeMvgJp7jAOd6jBKMEwwDDApYS3DYdoY+f7H6AlwyGt/SiUDDBVSFpF3AXsybBn+TO//qK4EjQEU+hjfvg+YagY9Wws2ijdWMbBdMCfk1pysZuJMy/g48C7mKOTzziEEssmhL0UornDGY9nW+rUU9yQbV3P9PW9QuPNylUonujQAAAAABJRU5ErkJggg%3D%3D',
			iconSize: [16, 16],
			iconAnchor: [8, 8]}
		)
	},

	/* cannot be dragged */
	_onHandleDrag: function() {
	},

	updateHandle: function() {
		this.setLatLng(this._handled._corners[this._corner]);
	}

});
