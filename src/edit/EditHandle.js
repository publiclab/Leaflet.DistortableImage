L.EditHandle = L.Marker.extend({
	initialize: function(overlay, corner, options) {
		var markerOptions,
			latlng = overlay._corners[corner];

		L.setOptions(this, options);

		this._handled = overlay;
		this._corner = corner;

		markerOptions = {
			draggable: true,
			zIndexOffset: 10
		};

		L.Marker.prototype.initialize.call(this, latlng, markerOptions);
	},

	onAdd: function(map) {
		L.Marker.prototype.onAdd.call(this, map);
		this._bindListeners();

		this.updateHandle();
	},

	onRemove: function(map) {
		this._unbindListeners();
		L.Marker.prototype.onRemove.call(this, map);
	},

	_onHandleDragStart: function() {
		this._handled.fire('editstart');
	},

	_onHandleDragEnd: function() {
		this._fireEdit();
	},

	_fireEdit: function() {
		this._handled.edited = true;
		this._handled.fire('edit');
	},

	_bindListeners: function() {
		this.on({
			'dragstart': this._onHandleDragStart,
			'drag': this._onHandleDrag,
			'dragend': this._onHandleDragEnd
		}, this);

		this._handled._map.on('zoomend', this.updateHandle, this);

		this._handled.on('update', this.updateHandle, this);
	},

	_unbindListeners: function() {
		this.off({
			'dragstart': this._onHandleDragStart,
			'drag': this._onHandleDrag,
			'dragend': this._onHandleDragEnd
		}, this);

		this._handled._map.off('zoomend', this.updateHandle, this);
		this._handled.off('update', this.updateHandle, this);
	}
});