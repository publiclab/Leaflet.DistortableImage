L.Toolbar2.Control = L.Toolbar2.extend({
	statics: {
		baseClass: 'leaflet-control-toolbar ' + L.Toolbar2.baseClass
	},

	initialize: function(options) {
		L.Toolbar2.prototype.initialize.call(this, options);

		this._control = new L.Control.Toolbar(this.options);
	},

	onAdd: function(map) {
		this._control.addTo(map);

		L.Toolbar2.prototype.onAdd.call(this, map);

		this.appendToContainer(this._control.getContainer());
	},

	onRemove: function(map) {
		L.Toolbar2.prototype.onRemove.call(this, map);
		if (this._control.remove) {this._control.remove();}  // Leaflet 1.0
		else {this._control.removeFrom(map);}
	}
});

L.Control.Toolbar = L.Control.extend({
	onAdd: function() {
		return L.DomUtil.create('div', '');
	}
});

L.toolbar.control = function(options) {
    return new L.Toolbar2.Control(options);
};
