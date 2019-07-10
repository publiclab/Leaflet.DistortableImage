L.RotateScaleHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotateScale',
		icon: L.icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
			iconSize: [32, 32],
			iconAnchor: [16, 16]
		})
	},

	_onHandleDrag: function(e) {
		var overlay = this._handled,
			map = this._map,
			edit = overlay.editing,
			formerLatLng = overlay.getCorner(this._corner),
			newLatLng = this.getLatLng(),

			angle = this.calculateAngleDelta(formerLatLng, newLatLng),
			scale = this._calculateScalingFactor(formerLatLng, newLatLng);
		
		if (angle !== 0) { edit._rotateBy(angle); }

		/* 
		  checks whether the "edgeMinWidth" property is set and tracks the minimum edge length;
		  this enables preventing scaling to zero, but we might also add an overall scale limit
		*/		
		// if (overlay.hasOwnProperty('edgeMinWidth')){
		// 	var edgeMinWidth = overlay.edgeMinWidth,
		// 	    w = L.latLng(overlay.getCorner(0)).distanceTo(overlay.getCorner(1)),
		// 			h = L.latLng(overlay.getCorner(1)).distanceTo(overlay.getCorner(2));
		// 	if ((w > edgeMinWidth && h > edgeMinWidth) || scale > 1) {
		// 		edit._scaleBy(scale);
		// 	}
		// } 

		// overlay.fire('update');
		// edit._updateToolbarPos();

		if (overlay.hasOwnProperty('edgeMinWidth')){
			var edgeMinWidth = overlay.edgeMinWidth,
				// sw = L.CRS.latLngToPoint(overlay.getCorner(2), map.getZoom()),
				// ne = L.CRS.latLngToPoint(overlay.getCorner(1), map.getZoom()),
      			ne = map.latLngToContainerPoint(overlay.getCorner(1)),
      			sw = map.latLngToContainerPoint(overlay.getCorner(2)),
				// corner1 = map.project(overlay.getCorner(0), map.getZoom()),
				// corner2 = map.project(overlay.getCorner(1), map.getZoom()),
				  // corner2 = map.latLngToContainerPoint(overlay.getCorner(1)),
				  bounds = L.bounds(sw, ne);
     			// w;
			// w = corner2.x - corner1.x;
			// h = Math.abs(corner1.y - corner2.y);
			// if (scale > 0) {
			// 	overlay.scale = scale;
			// 	edit._scaleBy2(scale);
				// overlay.fire("update");
            	// edit._updateToolbarPos();
			// }
			window.boundsa = bounds;
			// var intersect = corner1.intersect
			if ((bounds.getSize().x > 16 && bounds.getSize().y > 16) || scale > 1 ) {
				overlay.scale = scale;
				edit._scaleBy(scale);
				// this.updateHandle();
          		// overlay.fire("update");
          		// edit._updateToolbarPos();
			} else {
				// L.DomUtil.debounce(function() {
					// edit._disable();
					// this.dragging.disable();
					// this._unbindListeners();
					// var newZoom = map.getBoundsZoom(new L.latLngBounds(overlay.getCorner(2), overlay.getCorner(1)));
					// map.zoomIn(0.5);
					// map.panInsideBounds(new L.latLngBounds(overlay.getCorner(2), overlay.getCorner(1)));
					// map.setZoomAround(overlay.getCenter(), newZoom);
					// map.flyToBounds();
					// return false;
					L.DomEvent.stop(e);
					return L.Util.falseFn();
				// }, 350, true);
				// overlay._animateZoom();
				// map.zoomIn();
				// map.fitBounds()
			}
		}

		this.updateHandle();
		overlay.fire('update');
		edit._updateToolbarPos();
		// overlay.updateHandle();
	},

	updateHandle: function() {
		this.setLatLng(this._handled.getCorner(this._corner));
	},
});
