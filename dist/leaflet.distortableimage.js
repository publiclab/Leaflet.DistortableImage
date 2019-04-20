L.DomUtil = L.extend(L.DomUtil, {
	getMatrixString: function(m) {
		var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,

			/* 
		     * Since matrix3d takes a 4*4 matrix, we add in an empty row and column, which act as the identity on the z-axis.
		     * See:
		     *     http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
		     *     https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#M.C3.B6bius'_homogeneous_coordinates_in_projective_geometry
		     */
			matrix = [
				m[0], m[3], 0, m[6],
				m[1], m[4], 0, m[7],
				   0,    0, 1,    0,
				m[2], m[5], 0, m[8]
			],

			str = is3d ? 'matrix3d(' + matrix.join(',') + ')' : '';

		if (!is3d) {
			console.log('Your browser must support 3D CSS transforms in order to use DistortableImageOverlay.');
		}

		return str;
	},

	getRotateString: function(angle, units) {
		var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,
			open = 'rotate' + (is3d ? '3d' : '') + '(',
			rotateString = (is3d ? '0, 0, 1, ' : '') + angle + units;
			
		return open + rotateString + ')';
	},

	toggleClass: function(el, className) {
		var c = className;
		return this.hasClass(el, c) ? this.removeClass(el, c) : this.addClass(el, c);
	}

});

L.Map.include({
	_newLayerPointToLatLng: function(point, newZoom, newCenter) {
		var topLeft = L.Map.prototype._getNewTopLeftPoint.call(this, newCenter, newZoom)
				.add(L.Map.prototype._getMapPanePos.call(this));
		return this.unproject(point.add(topLeft), newZoom);
	}
});
L.MatrixUtil = {

	// Compute the adjugate of m
	adj: function(m) { 
		return [
			m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
			m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
			m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
		];
	},

	// multiply two 3*3 matrices
	multmm: function(a, b) { 
		var c = [],
			i;

		for (i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				var cij = 0;
				for (var k = 0; k < 3; k++) {
					cij += a[3*i + k]*b[3*k + j];
				}
				c[3*i + j] = cij;
			}
		}
		return c;
	},

	// multiply a 3*3 matrix and a 3-vector
	multmv: function(m, v) { 
		return [
			m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
			m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
			m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
		];
	},

	// multiply a scalar and a 3*3 matrix
	multsm: function(s, m) {
		var matrix = [];

		for (var i = 0, l = m.length; i < l; i++) {
			matrix.push(s*m[i]);
		}

		return matrix;
	},

	basisToPoints: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		var m = [
				x1, x2, x3,
				y1, y2, y3,
				1,  1,  1
			],
			v = L.MatrixUtil.multmv(L.MatrixUtil.adj(m), [x4, y4, 1]);

		return L.MatrixUtil.multmm(m, [
			v[0], 0, 0,
			0, v[1], 0,
			0, 0, v[2]
		]);
	},


	project: function(m, x, y) {
		var v = L.MatrixUtil.multmv(m, [x, y, 1]);
		return [v[0]/v[2], v[1]/v[2]];
	},

	general2DProjection: function(
	x1s, y1s, x1d, y1d,
	x2s, y2s, x2d, y2d,
	x3s, y3s, x3d, y3d,
	x4s, y4s, x4d, y4d
	) {
		var s = L.MatrixUtil.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s),
			d = L.MatrixUtil.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d),
			m = L.MatrixUtil.multmm(d, L.MatrixUtil.adj(s));

		/* 
		 *	Normalize to the unique matrix with m[8] == 1. 
		 * 	See: http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
		 */
		return L.MatrixUtil.multsm(1/m[8], m);
	}
};
L.TrigUtil = {

  calcAngleDegrees: function(x, y) {
    return Math.atan2(y, x) * 180 / Math.PI;
  }

};
L.EXIF = function getEXIFdata(img) {
  if (Object.keys(EXIF.getAllTags(img)).length !== 0) {
    console.log(EXIF.getAllTags(img));
    var GPS = EXIF.getAllTags(img),
      altitude;

    /* If the lat/lng is available. */
    if (
      typeof GPS.GPSLatitude !== "undefined" &&
      typeof GPS.GPSLongitude !== "undefined"
    ) {
      // sadly, encoded in [degrees,minutes,seconds]
      // primitive value = GPS.GPSLatitude[x].numerator
      var lat =
        GPS.GPSLatitude[0] +
        GPS.GPSLatitude[1] / 60 +
        GPS.GPSLatitude[2] / 3600;
      var lng =
        GPS.GPSLongitude[0] +
        GPS.GPSLongitude[1] / 60 +
        GPS.GPSLongitude[2] / 3600;

      if (GPS.GPSLatitudeRef !== "N") {
        lat = lat * -1;
      }
      if (GPS.GPSLongitudeRef === "W") {
        lng = lng * -1;
      }
    }

    // Attempt to use GPS compass heading; will require
    // some trig to calc corner points, which you can find below:

    var angle = 0;
    // "T" refers to "True north", so -90.
    if (GPS.GPSImgDirectionRef === "T") {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    }
    // "M" refers to "Magnetic north"
    else if (GPS.GPSImgDirectionRef === "M") {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    } else {
      console.log("No compass data found");
    }

    console.log("Orientation:", GPS.Orientation);

    /* If there is orientation data -- i.e. landscape/portrait etc */
    if (GPS.Orientation === 6) {
      //CCW
      angle += (Math.PI / 180) * -90;
    } else if (GPS.Orientation === 8) {
      //CW
      angle += (Math.PI / 180) * 90;
    } else if (GPS.Orientation === 3) {
      //180
      angle += (Math.PI / 180) * 180;
    }

    /* If there is altitude data */
    if (
      typeof GPS.GPSAltitude !== "undefined" &&
      typeof GPS.GPSAltitudeRef !== "undefined"
    ) {
      // Attempt to use GPS altitude:
      // (may eventually need to find EXIF field of view for correction)
      if (
        typeof GPS.GPSAltitude !== "undefined" &&
        typeof GPS.GPSAltitudeRef !== "undefined"
      ) {
        altitude =
          GPS.GPSAltitude.numerator / GPS.GPSAltitude.denominator +
          GPS.GPSAltitudeRef;
      } else {
        altitude = 0; // none
      }
    }
  } else {
    alert("EXIF initialized. Press again to view data in console.");
  }
};

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
		this._handled.fire("editstart");
  },

  _onHandleDragEnd: function() {
    this._fireEdit();
	},

  _fireEdit: function() {
    this._handled.edited = true;
    this._handled.fire("edit");
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

    this._handled._map.on("zoomend", this.updateHandle, this);

    this._handled.on("update", this.updateHandle, this);
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

    this._handled._map.off("zoomend", this.updateHandle, this);
    this._handled.off("update", this.updateHandle, this);
  }
});

L.LockHandle = L.EditHandle.extend({
	options: {
		TYPE: 'lock',
		icon: new L.Icon({ 
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAD8SURBVO3BPU7CYAAA0AdfjIcQlRCQBG7C3gk2uIPG2RC3Dk16Gz0FTO1WZs/gwGCMP/2+xsSl7+n1er1Iz9LtRQjaPeMeO+TinLDCJV78YqjdA04YodKuxhUaPGoRxMmxwRQZSt87Yo4KExGCeAUyLLFB4bMacxywEClIU2KDKXbInTUYo8JCgoFuGoxQO5uiwY1EA91VmDqrcKeDoX8WdNNgjApvmGGLXKIgXY0xGkxQYItrrFFIEKQ5Yo4KEx9yrDFDhlKkIF6NOQ5Y+KpAhiXWKEQI4pxwiwoLPyuxwQw75FoE7fZYocFEuwI7jHCBV39gL92TXq/Xi/AOcmczZmaIMScAAAAASUVORK5CYII=',
			iconSize: [32, 32],
			iconAnchor: [16, 16]}
		)
	},

	/* cannot be dragged */
	_onHandleDrag: function() {
	},

	updateHandle: function() {
		this.setLatLng(this._handled._corners[this._corner]);
		L.DomUtil.removeClass(this._handled.getElement(), 'selected');
	}

});

L.DistortHandle = L.EditHandle.extend({
  options: {
    TYPE: "distort",
    icon: new L.Icon({
      iconUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  },

  updateHandle: function() {
    this.setLatLng(this._handled._corners[this._corner]);
	},

  _onHandleDrag: function() {
    this._handled._updateCorner(this._corner, this.getLatLng());

    this._handled.fire("update");
    this._handled.editing._showToolbar();
  }
});

L.RotateAndScaleHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotate',
		icon: new L.Icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
			iconSize: [32, 32],
			iconAnchor: [16, 16]}
		)
	},

	_onHandleDrag: function() {
		var overlay = this._handled,
			formerLatLng = this._handled._corners[this._corner],
			newLatLng = this.getLatLng(),

			angle = this._calculateAngle(formerLatLng, newLatLng),
			scale = this._calculateScalingFactor(formerLatLng, newLatLng);

		overlay.editing._rotateBy(angle);

		/* 
		  checks whether the "edgeMinWidth" property is set and tracks the minimum edge length;
		  this enables preventing scaling to zero, but we might also add an overall scale limit
		*/		
		if (this._handled.options.hasOwnProperty('edgeMinWidth')){
			var edgeMinWidth = this._handled.options.edgeMinWidth,
			    w = L.latLng(overlay._corners[0]).distanceTo(overlay._corners[1]),
			    h = L.latLng(overlay._corners[1]).distanceTo(overlay._corners[2]);
			if ((w > edgeMinWidth && h > edgeMinWidth) || scale > 1) {
				overlay.editing._scaleBy(scale);
			}
		} 

		overlay.fire('update');

		this._handled.editing._showToolbar();

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

L.RotateHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotate',
		icon: new L.Icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
			iconSize: [32, 32],
			iconAnchor: [16, 16]}
		)
	},
	
	_onHandleDrag: function() {
		var overlay = this._handled,
			formerLatLng = this._handled._corners[this._corner],
			newLatLng = this.getLatLng(),
			angle = this._calculateAngle(formerLatLng, newLatLng);

	 	overlay.editing._rotateBy(angle);

		overlay.fire('update');

		this._handled.editing._showToolbar();
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

L.ScaleHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotate',
		icon: new L.Icon({
			iconUrl:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0NTkiIGhlaWdodD0iNDY0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iIj48cmVjdCBpZD0iYmFja2dyb3VuZHJlY3QiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHg9IjAiIHk9IjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgY2xhc3M9IiIgc3R5bGU9IiIvPjxnIGNsYXNzPSJjdXJyZW50TGF5ZXIiIHN0eWxlPSIiPjx0aXRsZT5MYXllciAxPC90aXRsZT48cGF0aCBkPSJNNDU5LjA0OTE1OTUzMDQ3MTM0LDg2LjkyNjIzNDUxMjU1MDAyIFYwIGgtODUuNzE0NTczMzU2MzEyMDkgdjI3LjA0MzcxNzQwMzkwNDQ1MiBIODUuNzE0NTczMzU2MzEyMDMgVjAgSDAgdjg2LjkyNjIzNDUxMjU1MDAyIGgyNS43MTQzNzIwMDY4OTM2MjYgdjI4OS43NTQxMTUwNDE4MzM0IEgwIHY4Ni45MjYyMzQ1MTI1NTAwMiBoODUuNzE0NTczMzU2MzEyMDkgdi0yNy4wNDM3MTc0MDM5MDQ0NTIgaDI4NS43MTUyNDQ1MjEwNDAzIHYyNy4wNDM3MTc0MDM5MDQ0NTIgaDg1LjcxNDU3MzM1NjMxMjA5IHYtODYuOTI2MjM0NTEyNTUwMDIgaC0yMy44MDk2MDM3MTAwODY2OSBWODYuOTI2MjM0NTEyNTUwMDIgSDQ1OS4wNDkxNTk1MzA0NzEzNCB6TTM4NC43NjMxOTU5NTUwMDA5LDEyLjU1NjAxMTY1MTgxMjc4MSBoNjEuOTA0OTY5NjQ2MjI1Mzk2IHY2Mi43ODAwNTgyNTkwNjM5MSBoLTYxLjkwNDk2OTY0NjIyNTM5NiBWMTIuNTU2MDExNjUxODEyNzgxIHpNMTIuMzgwOTkzOTI5MjQ1MDUsMTIuNTU2MDExNjUxODEyNzgxIGg2MS45MDQ5Njk2NDYyMjUzOTYgdjYyLjc4MDA1ODI1OTA2MzkxIEgxMi4zODA5OTM5MjkyNDUwNSBWMTIuNTU2MDExNjUxODEyNzgxIHpNNzQuMjg1OTYzNTc1NDcwNTMsNDUxLjA1MDU3MjQxNTEyMDY2IEgxMi4zODA5OTM5MjkyNDUwNSB2LTYyLjc4MDA1ODI1OTA2MzkxIGg2MS45MDQ5Njk2NDYyMjUzOTYgVjQ1MS4wNTA1NzI0MTUxMjA2NiB6TTQ0NS43MTU3ODE0NTI4MjI3NCw0NTEuMDUwNTcyNDE1MTIwNjYgaC02Mi44NTczNTM3OTQ2Mjg4NjQgdi02Mi43ODAwNTgyNTkwNjM5MSBoNjIuODU3MzUzNzk0NjI4ODY0IFY0NTEuMDUwNTcyNDE1MTIwNjYgek00MDcuNjIwNDE1NTE2Njg0MjYsMzc2LjY4MDM0OTU1NDM4MzQ0IGgtMzYuMTkwNTk3NjM5MzMxNzcgdjMyLjgzODc5OTcwNDc0MTEyIEg4NS43MTQ1NzMzNTYzMTIwMyB2LTMyLjgzODc5OTcwNDc0MTEyIEg0OS41MjM5NzU3MTY5ODAzMiBWODYuOTI2MjM0NTEyNTUwMDIgaDM2LjE5MDU5NzYzOTMzMTc3IFY1MC4yMjQwNDY2MDcyNTExMjUgaDI4Ny42MjAwMTI4MTc4NDcyIHYzNi43MDIxODc5MDUyOTg5IGgzNC4yODU4MjkzNDI1MjQ4MzUgVjM3Ni42ODAzNDk1NTQzODM0NCB6IiBpZD0ic3ZnXzIiIGNsYXNzPSIiIGZpbGw9IiMxYTFhZWIiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L3N2Zz4=',
			iconSize: [32, 32],
			iconAnchor: [16, 16]}
		)
	},

	_onHandleDrag: function() {
		var overlay = this._handled,
			formerLatLng = this._handled._corners[this._corner],
			newLatLng = this.getLatLng(),

			scale = this._calculateScalingFactor(formerLatLng, newLatLng);

		overlay.editing._scaleBy(scale);

		overlay.fire('update');

		this._handled.editing._showToolbar();
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

L.DistortableImageOverlay = L.ImageOverlay.extend({
	include: L.Mixin.Events,

	options: {
		alt: '',
		height: 200,
		crossOrigin: true,
		edgeMinWidth: 500,
	},

	initialize: function(url, options) {
			this._toolArray = L.DistortableImage.EditToolbarDefaults;
			this._url = url;
			this._rotation = this.options.rotation;

			L.setOptions(this, options);
	},

	onAdd: function(map) {
		/* Copied from L.ImageOverlay */
		this._map = map;

		if (!this._image) { this._initImage(); }
		if (!this._events) { this._initEvents(); }

		map._panes.overlayPane.appendChild(this._image);

		map.on('viewreset', this._reset, this);
		/* End copied from L.ImageOverlay */

		/* Use provided corners if available */
		if (this.options.corners) {
			this._corners = this.options.corners;
			if (map.options.zoomAnimation && L.Browser.any3d) {
				map.on('zoomanim', this._animateZoom, this);
			}

			/* This reset happens before image load; it allows
			 * us to place the image on the map earlier with
			 * "guessed" dimensions. */
			this._reset();
		}

		/* Have to wait for the image to load because
		 * we need to access its width and height. */
		L.DomEvent.on(this._image, 'load', function() {
			this._initImageDimensions();
			this._reset();
			/* Initialize default corners if not already set */
			if (!this._corners) {
				if (map.options.zoomAnimation && L.Browser.any3d) {
					map.on('zoomanim', this._animateZoom, this);
				}
			}
		}, this);

		this.fire('add');
	},

	onRemove: function(map) {
		this.fire('remove');

		L.ImageOverlay.prototype.onRemove.call(this, map);
	},

	_initImage: function () {
		L.ImageOverlay.prototype._initImage.call(this);

		L.extend(this._image, {
			alt: this.options.alt
		});
	},

	_addTool: function(tool) {
		this._toolArray.push(tool);
		L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
			options: {
				actions: this._toolArray
			}
		});
	},

	_initImageDimensions: function() {
		var map = this._map,

			originalImageWidth = L.DomUtil.getStyle(this._image, 'width'),
			originalImageHeight = L.DomUtil.getStyle(this._image, 'height'),

			aspectRatio = parseInt(originalImageWidth) / parseInt(originalImageHeight),

			imageHeight = this.options.height,
			imageWidth = parseInt(aspectRatio*imageHeight),

			center = map.latLngToContainerPoint(map.getCenter()),
			offset = new L.Point(imageWidth, imageHeight).divideBy(2);

		if (this.options.corners) { this._corners = this.options.corners; }
		else {
			this._corners = [
				map.containerPointToLatLng(center.subtract(offset)),
				map.containerPointToLatLng(center.add(new L.Point(offset.x, - offset.y))),
				map.containerPointToLatLng(center.add(new L.Point(- offset.x, offset.y))),
				map.containerPointToLatLng(center.add(offset))
			];
		}
	},

 	_initEvents: function() {
 		this._events = [ 'click' ];

 		for (var i = 0, l = this._events.length; i < l; i++) {
	 		L.DomEvent.on(this._image, this._events[i], this._fireMouseEvent, this);
 		}
 	},

 	/* See src/layer/vector/Path.SVG.js in the Leaflet source. */
 	_fireMouseEvent: function(event) {
 		if (!this.hasEventListeners(event.type)) { return; }

		var map = this._map,
			containerPoint = map.mouseEventToContainerPoint(event),
			layerPoint = map.containerPointToLayerPoint(containerPoint),
			latlng = map.layerPointToLatLng(layerPoint);

		this.fire(event.type, {
			latlng: latlng,
			layerPoint: layerPoint,
			containerPoint: containerPoint,
			originalEvent: event
		});
 	},

	_updateCorner: function(corner, latlng) {
		this._corners[corner] = latlng;
		this._reset();
	},

	// fires a reset after all corner positions are updated instead of after each one (above). Use for translating
	_updateCorners: function (latlngObj) {
		var i = 0;
		for (var k in latlngObj) {
			this._corners[i] = latlngObj[k];
			i += 1;
		}

		this._reset();
	},

	_updateCornersFromPoints: function (pointsObj) {
		var map = this._map;
		var i = 0;
		for (var k in pointsObj) {
			this._corners[i] = map.layerPointToLatLng(pointsObj[k]);
			i += 1;
		}

		this._reset();
	},

	/* Copied from Leaflet v0.7 https://github.com/Leaflet/Leaflet/blob/66282f14bcb180ec87d9818d9f3c9f75afd01b30/src/dom/DomUtil.js#L189-L199 */
	/* since L.DomUtil.getTranslateString() is deprecated in Leaflet v1.0 */
	_getTranslateString: function (point) {
		// on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
		// makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
		// (same speed either way), Opera 12 doesn't support translate3d

		var is3d = L.Browser.webkit3d,
		    open = 'translate' + (is3d ? '3d' : '') + '(',
		    close = (is3d ? ',0' : '') + ')';

		return open + point.x + 'px,' + point.y + 'px' + close;
	},

	_reset: function() {
		var map = this._map,
			image = this._image,
			latLngToLayerPoint = L.bind(map.latLngToLayerPoint, map),

			transformMatrix = this._calculateProjectiveTransform(latLngToLayerPoint),
			topLeft = latLngToLayerPoint(this._corners[0]),

			warp = L.DomUtil.getMatrixString(transformMatrix),
			translation = this._getTranslateString(topLeft);

		/* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
		image._leaflet_pos = topLeft;

		image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');

		/* Set origin to the upper-left corner rather than the center of the image, which is the default. */
		image.style[L.DomUtil.TRANSFORM + '-origin'] = "0 0 0";
	},

	/*
	 * Calculates the transform string that will be correct *at the end* of zooming.
	 * Leaflet then generates a CSS3 animation between the current transform and
	 *		 future transform which makes the transition appear smooth.
	 */
	_animateZoom: function(event) {
		var map = this._map,
			image = this._image,
			latLngToNewLayerPoint = function(latlng) {
				return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
			},

			transformMatrix = this._calculateProjectiveTransform(latLngToNewLayerPoint),
			topLeft = latLngToNewLayerPoint(this._corners[0]),

			warp = L.DomUtil.getMatrixString(transformMatrix),
			translation = this._getTranslateString(topLeft);

		/* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
		image._leaflet_pos = topLeft;

		if (!L.Browser.gecko) {
			image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
		}
	},

	getCorners: function() {
		return this._corners;
	},

	getCorner: function(i) {
		return this._corners[i];
	},

	/*
	 * Calculates the centroid of the image.
	 *		 See http://stackoverflow.com/questions/6149175/logical-question-given-corners-find-center-of-quadrilateral
	 */
	getCenter: function(ll2c, c2ll) {
		var map = this._map,
			latLngToCartesian = ll2c ? ll2c : map.latLngToLayerPoint,
			cartesianToLatLng = c2ll ? c2ll: map.layerPointToLatLng,
			nw = latLngToCartesian.call(map, this._corners[0]),
			ne = latLngToCartesian.call(map, this._corners[1]),
			se = latLngToCartesian.call(map, this._corners[2]),
			sw = latLngToCartesian.call(map, this._corners[3]),

			nmid = nw.add(ne.subtract(nw).divideBy(2)),
			smid = sw.add(se.subtract(sw).divideBy(2));

		return cartesianToLatLng.call(map, nmid.add(smid.subtract(nmid).divideBy(2)));
	},

	// Use for translation calculations - for translation the delta for 1 corner applies to all 4
	_calcCornerPointDelta: function () {
		return this._dragStartPoints[0].subtract(this._dragPoints[0]);
	},

	_calcCenterTwoCornerPoints: function (topLeft, topRight) {
			var toolPoint = { x: "", y: "" };

      toolPoint.x = topRight.x + (topLeft.x - topRight.x) / 2;
			toolPoint.y = topRight.y + (topLeft.y - topRight.y) / 2;
			
			return toolPoint;
	},

	_calculateProjectiveTransform: function(latLngToCartesian) {
		/* Setting reasonable but made-up image defaults
		 * allow us to place images on the map before
		 * they've finished downloading. */
		var offset = latLngToCartesian(this._corners[0]),
			w = this._image.offsetWidth || 500,
			h = this._image.offsetHeight || 375,
			c = [],
			j;
		/* Convert corners to container points (i.e. cartesian coordinates). */
		for (j = 0; j < this._corners.length; j++) {
			c.push(latLngToCartesian(this._corners[j])._subtract(offset));
		}

		/*
		 * This matrix describes the action of the CSS transform on each corner of the image.
		 * It maps from the coordinate system centered at the upper left corner of the image
		 *		 to the region bounded by the latlngs in this._corners.
		 * For example:
		 *		 0, 0, c[0].x, c[0].y
		 *		 says that the upper-left corner of the image maps to the first latlng in this._corners.
		 */
		return L.MatrixUtil.general2DProjection(
			0, 0, c[0].x, c[0].y,
			w, 0, c[1].x, c[1].y,
			0, h, c[2].x, c[2].y,
			w, h, c[3].x, c[3].y
		);
	}
});

L.distortableImageOverlay = function(id, options) {
	return new L.DistortableImageOverlay(id, options);
};




L.DistortableCollection = L.FeatureGroup.extend({
  include: L.Mixin.Events,

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    L.DomEvent.on(document, "keydown", this._onKeyDown, this);
    L.DomEvent.on(map, "click", this._deselectAll, this);

    /**
     * the box zoom override works, but there is a bug involving click event propogation.
     * keeping uncommented for now so that it isn't used as a multi-select mechanism
     */

    // L.DomEvent.on(map, "boxzoomend", this._addSelections, this);

    this.eachLayer(function(layer) {
      L.DomEvent.on(layer._image, "mousedown", this._deselectOthers, this);
      L.DomEvent.on(layer, "dragstart", this._dragStartMultiple, this);
      L.DomEvent.on(layer, "drag", this._dragMultiple, this);
    }, this);
  },

  onRemove: function() {
    var map = this._map;

    L.DomEvent.off(document, "keydown", this._onKeyDown, this);
    L.DomEvent.off(map, "click", this._deselectAll, this);
    // L.DomEvent.off(map, "boxzoomend", this._addSelections, this);

    this.eachLayer(function(layer) {
      L.DomEvent.off(layer._image, "mousedown", this._deselectOthers, this);
      L.DomEvent.off(layer, "dragstart", this._dragStartMultiple, this);
      L.DomEvent.off(layer, "drag", this._dragMultiple, this);
    }, this);
  },

  isSelected: function(overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), "selected");
  },

  _toggleMultiSelect: function(event, edit) {
    if (edit._mode === "lock") { return; }

    if (event.metaKey || event.ctrlKey) {
      L.DomUtil.toggleClass(event.target, "selected");
    }
  },

  _deselectOthers: function(event) {
    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (layer._image !== event.target) {
        edit._hideMarkers();
      } else {
        this._toggleMultiSelect(event, edit);
      }
    }, this);

    L.DomEvent.stopPropagation(event);
  },

  _addSelections: function(e) {
    var box = e.boxZoomBounds,
      i = 0;

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (edit.toolbar) {
        edit._hideToolbar();
      }
      for (i = 0; i < 4; i++) {
        if (box.contains(layer.getCorner(i)) && edit._mode !== "lock") {
          L.DomUtil.addClass(layer.getElement(), "selected");
          break;
        }
      }
    });
  },

  _onKeyDown: function(e) {
    if (e.key === "Escape") {
      this._deselectAll();
    }
  },

  _dragStartMultiple: function(event) {
    var overlay = event.target,
      i;

    if (!this.isSelected(overlay)) {
      return;
    }

    this.eachLayer(function(layer) {
      for (i = 0; i < 4; i++) {
        if (layer !== overlay) {
          layer.editing._hideToolbar();
        }
        layer._dragStartPoints[i] = layer._map.latLngToLayerPoint(
          layer.getCorner(i)
        );
      }
    });
  },

  _dragMultiple: function(event) {
    var overlay = event.target,
      map = this._map,
      i;

    if (!this.isSelected(overlay)) {
      return;
    }

    overlay._dragPoints = {};

    for (i = 0; i < 4; i++) {
      overlay._dragPoints[i] = map.latLngToLayerPoint(overlay.getCorner(i));
    }

    var cpd = overlay._calcCornerPointDelta();

    this._updateCollectionFromPoints(cpd, overlay);
  },

  _deselectAll: function() {
    this.eachLayer(function(layer) {
      var edit = layer.editing;

      L.DomUtil.removeClass(layer.getElement(), "selected");
      if (edit.toolbar) {
        edit._hideToolbar();
      }
      edit._hideMarkers();
    });
  },

  /**
   * images in 'lock' mode are included in this feature group collection for functionalities
   * such as export, but are filtered out for editing / dragging here
   */
  _calcCollectionFromPoints: function(cpd, overlay) {
    var layersToMove = [],
      p = new L.Transformation(1, -cpd.x, 1, -cpd.y);

    this.eachLayer(function(layer) {
      if (
        layer !== overlay &&
        layer.editing._mode !== "lock" &&
        this.isSelected(layer)
      ) {
        layer._cpd = {};

        layer._cpd.val0 = p.transform(layer._dragStartPoints[0]);
        layer._cpd.val1 = p.transform(layer._dragStartPoints[1]);
        layer._cpd.val2 = p.transform(layer._dragStartPoints[2]);
        layer._cpd.val3 = p.transform(layer._dragStartPoints[3]);

        layersToMove.push(layer);
      }
    }, this);

    return layersToMove;
  },

  /**
   * cpd === cornerPointDelta
   */
  _updateCollectionFromPoints: function(cpd, overlay) {
    var layersToMove = this._calcCollectionFromPoints(cpd, overlay);

    layersToMove.forEach(function(layer) {
      layer._updateCornersFromPoints(layer._cpd);
      layer.fire("update");
    }, this);
  }
});

L.distortableCollection = function(id, options) {
  return new L.DistortableCollection(id, options);
};
L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
		initialize: function(map, overlay, options) {
			this._overlay = overlay;
			this._map = map;

			LeafletToolbar.ToolbarAction.prototype.initialize.call(this, options);
		}
	}),

	ToggleTransparency = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-adjust"></span>',
			tooltip: 'Toggle Image Transparency',
			title: 'Toggle Image Transparency'
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleTransparency();
			this.disable();
		}
	}),

	ToggleOutline = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-square-o"></span>',
			tooltip: 'Toggle Image Outline',
			title: 'Toggle Image Outline'
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleOutline();
			this.disable();
		}
	}),

	RemoveOverlay = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-trash"></span>',
			tooltip: 'Delete image',
			title: 'Delete image'
		}},

		addHooks: function() {
			var map = this._map;

			map.removeLayer(this._overlay);
			this._overlay.fire('delete');
			this.disable();
		}
	}),

	ToggleEditable = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-lock"></span>',
			tooltip: 'Lock / Unlock editing',
			title: 'Lock / Unlock editing'
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleLock();
			this.disable();
		}
	}),

	ToggleRotateDistort = EditOverlayAction.extend({
		initialize: function(map, overlay, options) {
			var icon = overlay.editing._mode === 'rotate' ? 'image' : 'rotate-left';

			options = options || {};
			options.toolbarIcon = {
				html: '<span class="fa fa-' + icon + '"></span>',
				tooltip: 'Rotate',
				title: 'Rotate'
			};

			EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
		},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleRotateDistort();
			editing._showToolbar();
			this.disable();
		}
	}),


	ToggleExport = EditOverlayAction.extend({
		options: {
			toolbarIcon: {
				html: '<span class="fa fa-download"></span>',
				tooltip: 'Export Image',
				title: 'Export Image'
			}
		},

		addHooks: function ()
		{
			var editing = this._overlay.editing;

			editing._toggleExport();
			this.disable();
		}
	}),

	ToggleOrder = EditOverlayAction.extend({
		options: {
			toolbarIcon: {
				html: '<span class="fa fa-sort"></span>',
				tooltip: 'Change order',
				title: 'Toggle order'
			}
		},

		addHooks: function ()
		{
			var editing = this._overlay.editing;

			editing._toggleOrder();
			this.disable();
		}
	}),

  EnableEXIF = EditOverlayAction.extend({
  options: {
    toolbarIcon: {
      html: '<span class="fa fa-compass"></span>',
      tooltip: "Enable EXIF",
      title: "Geocode Image"
    }
  },

  addHooks: function() {
    var image = this._overlay._image;
    EXIF.getData(image, L.EXIF(image));
  }
  });

L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
	options: {
		actions: [
			ToggleTransparency,
			RemoveOverlay,
			ToggleOutline,
			ToggleEditable,
			ToggleRotateDistort,
			ToggleExport,
      EnableEXIF,
      ToggleOrder
    ]
	},
	
	// todo: move to some sort of util class, these methods could be useful in future
  _rotateToolbarAngleDeg: function(angle) {
		var div = this._container,
			divStyle = div.style;

		var oldTransform = divStyle.transform;
		
		divStyle.transform = oldTransform + "rotate(" + angle + "deg)";
    divStyle.transformOrigin = "1080% 650%";

		this._rotateToolbarIcons(angle);
	},
	
	_rotateToolbarIcons: function(angle) {
		var icons = document.querySelectorAll(".fa");

		for (var i = 0; i < icons.length; i++) {
			icons.item(i).style.transform = "rotate(" + -angle + "deg)";
		}
	},

});

L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
  options: {
    opacity: 0.7,
    outline: "1px solid red",
    keymap: {
      8: "_removeOverlay", // backspace windows / delete mac
      46: "_removeOverlay", // delete windows / delete + fn mac
      20: "_toggleRotate", // CAPS
      27: "_deselect", // esc
      68: "_toggleRotateDistort", // d
      69: "_toggleIsolate", // e
      73: "_toggleIsolate", // i
      74: "_sendUp", // j
      75: "_sendDown", // k
      76: "_toggleLock", // l
      79: "_toggleOutline", // o
      82: "_toggleRotateDistort", // r
      83: "_toggleScale", // s
      84: "_toggleTransparency" // t
    }
  },

  initialize: function(overlay) {
    this._overlay = overlay;
    this._toggledImage = false;

    /* Interaction modes. */
    this._mode = this._overlay.options.mode || "distort";
    this._transparent = false;
    this._outlined = false;
  },

  /* Run on image selection. */
  addHooks: function() {
    var overlay = this._overlay,
      map = overlay._map,
      i;

    this._lockHandles = new L.LayerGroup();
    for (i = 0; i < 4; i++) {
      this._lockHandles.addLayer(
        new L.LockHandle(overlay, i, { draggable: false })
      );
    }

    this._distortHandles = new L.LayerGroup();
    for (i = 0; i < 4; i++) {
      this._distortHandles.addLayer(new L.DistortHandle(overlay, i));
    }

    this._rotateHandles = new L.LayerGroup(); // handle includes rotate AND scale
    for (i = 0; i < 4; i++) {
      this._rotateHandles.addLayer(new L.RotateAndScaleHandle(overlay, i));
    }

    this._scaleHandles = new L.LayerGroup();
    for (i = 0; i < 4; i++) {
      this._scaleHandles.addLayer(new L.ScaleHandle(overlay, i));
    }

    this.__rotateHandles = new L.LayerGroup(); // individual rotate
    for (i = 0; i < 4; i++) {
      this.__rotateHandles.addLayer(new L.RotateHandle(overlay, i));
    }

    this._handles = {
      lock: this._lockHandles,
      distort: this._distortHandles,
      rotate: this._rotateHandles,
      scale: this._scaleHandles,
      rotateStandalone: this.__rotateHandles
    };

    if (this._mode === "lock") {
      map.addLayer(this._lockHandles);
    } else {
      this._mode = "distort";
      map.addLayer(this._distortHandles);
      this._distortHandles.eachLayer(function(layer) {
        layer.setOpacity(0);
        layer.dragging.disable();
        layer.options.draggable = false;
      });
      this._enableDragging();
    }

    this._initToolbar();

    this._overlay._dragStartPoints = {
      0: new L.point(0, 0),
      1: new L.point(0, 0),
      2: new L.point(0, 0),
      3: new L.point(0, 0)
    };

    L.DomEvent.on(map, "click", this._deselect, this);
    L.DomEvent.on(overlay._image, "click", this._select, this);

    /* Enable hotkeys. */
    L.DomEvent.on(window, "keydown", this._onKeyDown, this);

    overlay.fire("select");
  },

  /* Run on image deselection. */
  removeHooks: function() {
    var overlay = this._overlay,
      map = overlay._map;

    L.DomEvent.off(map, "click", this._deselect, this);
    L.DomEvent.off(overlay._image, "click", this._select, this);

    // First, check if dragging exists - it may be off due to locking
    if (this.dragging) { this.dragging.disable(); }
    delete this.dragging;

    if (this.toolbar) { this._hideToolbar(); }
    if (this.editing) { this.editing.disable(); }

    map.removeLayer(this._handles[this._mode]);

    /* Disable hotkeys. */
    L.DomEvent.off(window, "keydown", this._onKeyDown, this);

    overlay.fire("deselect");
  },

  _initToolbar: function() {
    this._showToolbar();
    this.toolbar._hide();
    this.toolbar._tip.style.opacity = 0;
  },

  confirmDelete: function() {
    return window.confirm("Are you sure you want to delete?");
  },

  _rotateBy: function(angle) {
    var overlay = this._overlay,
      map = overlay._map,
      center = map.latLngToLayerPoint(overlay.getCenter()),
      i,
      p,
      q;

    for (i = 0; i < 4; i++) {
      p = map.latLngToLayerPoint(overlay._corners[i]).subtract(center);
      q = new L.Point(
        Math.cos(angle) * p.x - Math.sin(angle) * p.y,
        Math.sin(angle) * p.x + Math.cos(angle) * p.y
      );
      overlay._corners[i] = map.layerPointToLatLng(q.add(center));
    }

    overlay._reset();
  },

  _scaleBy: function(scale) {
    var overlay = this._overlay,
      map = overlay._map,
      center = map.latLngToLayerPoint(overlay.getCenter()),
      i,
      p;

    for (i = 0; i < 4; i++) {
      p = map
        .latLngToLayerPoint(overlay._corners[i])
        .subtract(center)
        .multiplyBy(scale)
        .add(center);
      overlay._corners[i] = map.layerPointToLatLng(p);
    }

    overlay._reset();
  },

  _enableDragging: function() {
    var overlay = this._overlay,
      map = overlay._map;

    this.dragging = new L.Draggable(overlay._image);
    this.dragging.enable();

    /* Hide toolbars and markers while dragging; click will re-show it */
    this.dragging.on("dragstart", function() {
      overlay.fire("dragstart");
      this._hideToolbar();
    },this);

    /*
     * Adjust default behavior of L.Draggable.
     * By default, L.Draggable overwrites the CSS3 distort transform
     * that we want when it calls L.DomUtil.setPosition.
     */
    this.dragging._updatePosition = function() {
      var delta = this._newPos.subtract(
          map.latLngToLayerPoint(overlay._corners[0])
        ),
        currentPoint,
        i;

      this.fire("predrag");

      for (i = 0; i < 4; i++) {
        currentPoint = map.latLngToLayerPoint(overlay._corners[i]);
        overlay._corners[i] = map.layerPointToLatLng(currentPoint.add(delta));
			}
			
      overlay._reset();
      overlay.fire("update");
      overlay.fire("drag");

      this.fire("drag");
    };
  },

  _onKeyDown: function(event) {
    var keymap = this.options.keymap,
      handlerName = keymap[event.which];

    if (handlerName !== undefined && this._overlay.options.suppressToolbar !== true) {
      this[handlerName].call(this);
    }
  },

  _toggleRotateDistort: function() {
    var map = this._overlay._map;

    map.removeLayer(this._handles[this._mode]);

    /* Switch mode. */
		if (this._mode === "rotate") { this._mode = "distort"; } 
		else { this._mode = "rotate"; }

    this._showToolbar();

    map.addLayer(this._handles[this._mode]);
  },

  _toggleScale: function() {
		var map = this._overlay._map;
		
    if (this._mode === "lock") { return; }

    map.removeLayer(this._handles[this._mode]);

		if (this._mode === "scale") { this._mode = "distort"; } 
		else { this._mode = "scale"; }

    this._showToolbar();

    map.addLayer(this._handles[this._mode]);
  },

  _toggleRotate: function() {
		var map = this._overlay._map;
		
		if (this._mode === "lock") { return; }

    map.removeLayer(this._handles[this._mode]);
    this._mode = "rotateStandalone";

		this._showToolbar();
		
    map.addLayer(this._handles[this._mode]);
  },

  _toggleTransparency: function() {
    var image = this._overlay._image,
      opacity;

    this._transparent = !this._transparent;
    opacity = this._transparent ? this.options.opacity : 1;

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute("opacity", opacity);
  },

  _toggleOutline: function() {
    var image = this._overlay._image,
      opacity,
      outline;

    this._outlined = !this._outlined;
    opacity = this._outlined ? this.options.opacity / 2 : 1;
    outline = this._outlined ? this.options.outline : "none";

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute("opacity", opacity);

    image.style.outline = outline;
  },

  _sendUp: function() {
    this._overlay.bringToFront();
  },

  _sendDown: function() {
    this._overlay.bringToBack();
  },

  _toggleLock: function() {
    var map = this._overlay._map;

    map.removeLayer(this._handles[this._mode]);
    /* Switch mode. */
    if (this._mode === "lock") {
      this._mode = "distort";
      this._enableDragging();
    } else {
      this._mode = "lock";
      if (this.dragging) { this.dragging.disable(); }
      delete this.dragging;
    }

    map.addLayer(this._handles[this._mode]);
  },

  _select: function(event) {
    this._showToolbar(event);
    this._showMarkers();

    L.DomEvent.stopPropagation(event);
  },

  _deselect: function(event) {
    this._hideToolbar(event);
    this._hideMarkers();
  },

  _hideToolbar: function() {
    var map = this._overlay._map;
    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    }
  },

  _showMarkers: function() {
    if (this._mode === "lock") { return; }
    var currentHandle = this._handles[this._mode];
    currentHandle.eachLayer(function(layer) {
      layer.setOpacity(1);
      layer.dragging.enable();
      layer.options.draggable = true;
    });
  },

  _hideMarkers: function() {
    var currentHandle = this._handles[this._mode];
    currentHandle.eachLayer(function(layer) {
      var drag = layer.dragging,
        opts = layer.options;

      layer.setOpacity(0);
      if (drag) {
        drag.disable();
      }
      if (opts.draggable) {
        opts.draggable = false;
      }
    });
  },

  // TODO: toolbar for multiple image selection
  _showToolbar: function() {
    var overlay = this._overlay,
      map = overlay._map;

    /* Ensure that there is only ever one toolbar attached to each image. */
    this._hideToolbar();

    //Find the topmost point on the image.
    var corners = overlay.getCorners();
    var maxLat = -Infinity;
    for (var i = 0; i < corners.length; i++) {
      if (corners[i].lat > maxLat) {
        maxLat = corners[i].lat;
      }
    }

    //Longitude is based on the centroid of the image.
    var raised_point = overlay.getCenter();
    raised_point.lat = maxLat;

    if (this._overlay.options.suppressToolbar !== true) {
      this.toolbar = new L.DistortableImage.EditToolbar(raised_point).addTo(
        map,
        overlay
      );
      overlay.fire("toolbar:created");
    }
  },

  _removeOverlay: function() {
    var overlay = this._overlay;
    if (this._mode !== "lock") {
      var choice = this.confirmDelete();
      if (choice) {
        this._hideToolbar();
        overlay._map.removeLayer(overlay);
        overlay.fire("delete");
        this.disable();
      }
    }
  },

  // compare this to using overlay zIndex
  _toggleOrder: function() {
    if (this._toggledImage) {
      this._overlay.bringToFront();
      this._toggledImage = false;
    } else {
      this._overlay.bringToBack();
      this._toggledImage = true;
    }
  },

  // Based on https://github.com/publiclab/mapknitter/blob/8d94132c81b3040ae0d0b4627e685ff75275b416/app/assets/javascripts/mapknitter/Map.js#L47-L82
  _toggleExport: function() {
    var map = this._overlay._map;
    var overlay = this._overlay;

    // make a new image
    var downloadable = new Image();

    downloadable.id = downloadable.id || "tempId12345";
    $("body").append(downloadable);

    downloadable.onload = function onLoadDownloadableImage() {
      var height = downloadable.height,
        width = downloadable.width,
        nw = map.latLngToLayerPoint(overlay._corners[0]),
        ne = map.latLngToLayerPoint(overlay._corners[1]),
        sw = map.latLngToLayerPoint(overlay._corners[2]),
        se = map.latLngToLayerPoint(overlay._corners[3]);

      // I think this is to move the image to the upper left corner,
      // jywarren: i think we may need these or the image goes off the edge of the canvas
      // jywarren: but these seem to break the distortion math...

      // jywarren: i think it should be rejiggered so it
      // finds the most negative values of x and y and then
      // adds those to all coordinates

      //nw.x -= nw.x;
      //ne.x -= nw.x;
      //se.x -= nw.x;
      //sw.x -= nw.x;

      //nw.y -= nw.y;
      //ne.y -= nw.y;
      //se.y -= nw.y;
      //sw.y -= nw.y;

      // run once warping is complete
      downloadable.onload = function() {
        $(downloadable).remove();
      };

      if (window && window.hasOwnProperty("warpWebGl")) {
        warpWebGl(
          downloadable.id,
          [0, 0, width, 0, width, height, 0, height],
          [nw.x, nw.y, ne.x, ne.y, se.x, se.y, sw.x, sw.y],
          true // trigger download
        );
      }
    };

    downloadable.src = overlay.options.fullResolutionSrc || overlay._image.src;
  },

  toggleIsolate: function() {
    // this.isolated = !this.isolated;
    // if (this.isolated) {
    // 	$.each($L.images,function(i,img) {
    // 		img.hidden = false;
    // 		img.setOpacity(1);
    // 	});
    // } else {
    // 	$.each($L.images,function(i,img) {
    // 		img.hidden = true;
    // 		img.setOpacity(0);
    // 	});
    // }
    // this.hidden = false;
    // this.setOpacity(1);
  }
});

L.DistortableImageOverlay.addInitHook(function() {
  this.editing = new L.DistortableImage.Edit(this);

  if (this.options.editable) {
    L.DomEvent.on(this._image, "load", this.editing.enable, this.editing);
  }

	this.on('remove', function () {
		if (this.editing) { this.editing.disable(); }
	});
});

L.Map.mergeOptions({ boxSelector: true, boxZoom: false });

// used for multiple image select. Temporarily disabled until click
// propagation issue is fixed

L.Map.BoxSelectHandle = L.Map.BoxZoom.extend({

  initialize: function (map) {
    this._map = map;
    this._container = map._container;
    this._pane = map._panes.overlayPane;
  },

  addHooks: function () {
    L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
  },

  removeHooks: function () {
    L.DomEvent.off(this._container, 'mousedown', this._onMouseDown, this);
  },

  _onMouseDown: function (e) {
    if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

    L.DomUtil.disableTextSelection();
    L.DomUtil.disableImageDrag();

    this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

    this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
    L.DomUtil.setPosition(this._box, this._startLayerPoint);

    this._container.style.cursor = 'crosshair';

    L.DomEvent
      .on(document, 'mousemove', this._onMouseMove, this)
      .on(document, 'mouseup', this._onMouseUp, this)
      .preventDefault(e);

    this._map.fire('boxzoomstart');
  },

  _onMouseMove: function (e) {
    var startPoint = this._startLayerPoint,
      box = this._box,

      layerPoint = this._map.mouseEventToLayerPoint(e),
      offset = layerPoint.subtract(startPoint),

      newPos = new L.Point(
        Math.min(layerPoint.x, startPoint.x),
        Math.min(layerPoint.y, startPoint.y));

    L.DomUtil.setPosition(box, newPos);

    box.style.width = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
    box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
  },

  _onMouseUp: function (e) {
    var map = this._map,
      layerPoint = map.mouseEventToLayerPoint(e);

    if (this._startLayerPoint.equals(layerPoint)) { return; }

    this._boxBounds = new L.LatLngBounds(
      map.layerPointToLatLng(this._startLayerPoint),
      map.layerPointToLatLng(layerPoint));

    this._finish();

    map.fire('boxzoomend', { boxZoomBounds: this._boxBounds });

    // this._finish();
  },

  _finish: function () {
    $(this._map.boxSelector._box).remove();
    // L.DomUtil.remove(this._box);
    // L.DomUtil.remove(this._map.boxSelector);
    this._container.style.cursor = '';

    L.DomUtil.enableTextSelection();
    L.DomUtil.enableImageDrag();

    L.DomEvent
      .off(document, 'mousemove', this._onMouseMove)
      .off(document, 'mouseup', this._onMouseUp);
  },
});

L.Map.addInitHook('addHandler', 'boxSelector', L.Map.BoxSelectHandle);