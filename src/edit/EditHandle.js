L.EditHandle = L.Marker.extend({
  initialize: function(overlay, corner, options) {
    var markerOptions,
        latlng = overlay.getCorner(corner);

    L.setOptions(this, options);

    this._overlay = overlay;
    this._corner = corner;

    markerOptions = {
      draggable: true,
      zIndexOffset: 10
    };

    if (options && options.hasOwnProperty("draggable")) {
      markerOptions.draggable = options.draggable;
    }

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
		this._overlay.fire("editstart");
  },

  _onHandleDragEnd: function() {
    this._fireEdit();
	},

  _fireEdit: function() {
    this._overlay.edited = true;
    this._overlay.fire("edit");
  },

  _bindListeners: function() {
    this.on(
      {
        dragstart: this._onHandleDragStart,
        drag: this._onHandleDrag,
        dragend: this._onHandleDragEnd
      },
      this
    );
    
    this._overlay.on("update", this.updateHandle, this);
    this._overlay._map.on("zoomend", this.updateHandle, this);
  },

  _unbindListeners: function() {
    this.off(
      {
        dragstart: this._onHandleDragStart,
        drag: this._onHandleDrag,
        dragend: this._onHandleDragEnd
      },
      this
    );
    
    this._overlay.off("update", this.updateHandle, this);
    this._overlay._map.off("zoomend", this.updateHandle, this);
  },

 /* Takes two latlngs and calculates the scaling difference. */
  _calculateScalingFactor: function(latlngA, latlngB) {
     var overlay = this._overlay,
       map = overlay._map,

       centerPoint = map.latLngToLayerPoint(overlay.getCenter()),
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
  },

 /* Takes two latlngs and calculates the angle between them. */
	calculateAngleDelta: function(latlngA, latlngB) {
    var overlay = this._overlay,
      map = overlay._map,

			centerPoint = map.latLngToLayerPoint(overlay.getCenter()),
			formerPoint = map.latLngToLayerPoint(latlngA),
			newPoint = map.latLngToLayerPoint(latlngB),

			initialAngle = Math.atan2(centerPoint.y - formerPoint.y, centerPoint.x - formerPoint.x),
			newAngle = Math.atan2(centerPoint.y - newPoint.y, centerPoint.x - newPoint.x);

		return newAngle - initialAngle;
	}
});
