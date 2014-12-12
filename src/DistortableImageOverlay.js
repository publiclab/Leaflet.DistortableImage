L.DistortableImageOverlay = L.ImageOverlay.extend({
	options: {
		alt: '',
		height: 200
	},

	initialize: function(url, options) {
		this._url = url;

		L.setOptions(this, options);
	},

	_initImage: function () {
		L.ImageOverlay.prototype._initImage.call(this);

		L.extend(this._image, {
			alt: this.options.alt
		});
	},

	_onLoad: function() {
		if (this.options.corners) {
			this._corners = this.options.corners;
		}
	},

	onAdd: function(map) {
		var aspectRatio = this._image.width / this._image.height,

			mapHeight = L.DomUtil.getStyle(map._container, 'height'),
			mapWidth = L.Domutil.getStyle(map._container, 'width'),

			imageHeight = this.options.height,
			imageWidth = aspectRatio*imageHeight,

			center = map.latLngToContainerPoint(map.getCenter()),
			offset = new L.Point(mapWidth - imageWidth, mapHeight - imageHeight).divideBy(2);

		if (this.options.corners) { this._corners = this.options.corners; }
		else {
			this._corners = [
				map.containerPointToLatLng(center.subtract(offset)),
				map.containerPointToLatLng(center.add(new L.Point(offset.x, - offset.y))),
				map.containerPointToLatLng(center.add(offset)),
				map.containerPointToLatLng(center.add(new L.Point(- offset.x, offset.y)))
			];
		}

		this._map = map;

	},

	// recalc corners (x,y) from markers (lat,lng)
	_updateCorner: function(index, newCorner) {
		this._corners[index] = newCorner;
		this.distort();
	},

	// use CSS to transform the image
	_reset: function() {
		var map = this._map,
			image = this._image,
			topLeft = map.latLngToLayerPoint(this._corners[0]),
			transform,
			transformString;      

		L.DomUtil.setPosition(image, topLeft);

		transform = this._calculateProjectiveTransform();
		transformString = "matrix3d(" + transform.join(", ") + ")";   

		image.style["-webkit-transform"] = transformString;
		image.style["-moz-transform"] = transformString;
		image.style["-o-transform"] = transformString;
		image.style.transform = transformString;

		image.style['transform-origin'] = "0 0 0";
		image.style["-webkit-transform-origin"] = "0 0 0";
	},

	_calculateProjectiveTransform: function() {
		var w = this._image.offsetWidth, 
			h = this._image.offsetHeight,
			c = [],
			t, i, j, l;

		/* Convert corners to container points (i.e. cartesian coordinates). */
		for (j = 0; j < this._corners.length; j++) {
			c.push(this._map.latLngToContainerPoint(this._corners[j]));
		}

		t = L.Util.Matrix.general2DProjection(
			0, 0, c[0].x, c[0].y,
			w, 0, c[1].x, c[1].y,
			0, h, c[2].x, c[2].y,
			w, h, c[3].x, c[3].y
		);

		/* Normalize the matrix. */
		for(i = 0, l = t.length; t < l; i++) { 
			t[i] = t[i]/t[8];
		}

		return [
			t[0], t[3], 0, t[6],
			t[1], t[4], 0, t[7],
				 0,    0, 1,    0,
			t[2], t[5], 0, t[8]
		];    
	},

	_animateZoom: function() {

	},

	toggleOutline: function() {
		this.outlined = !this.outlined;
		if (this.outlined) {
			$('#'+this._image.id).css('border','1px solid red');
		} else {
			$('#'+this._image.id).css('border', 'none');
		}
	},

	// cheaply get center by averaging the corners
	// TODO: Replace by simple centroid calculation.
	//     * See http://stackoverflow.com/questions/6149175/logical-question-given-corners-find-center-of-quadrilateral
	// getCenter: function() {
	//  var x = 0, y = 0,
	//    i, l;

	//  for (i = 0; l = this._corners.length; i < l; i++) {
	//    var pos = map.latLngToLayerPoint(this._corners[i]);
	//    x += pos.x;
	//    y += pos.y;
	//  }
	//  x /= 4;
	//  y /= 4;
	//  return [x,y];
	// },
});
