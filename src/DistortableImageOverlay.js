L.DistortableImageOverlay = L.ImageOverlay.extend({
	options: {
		alt: '',
		height: 200,
		rotation: 0
	},

	initialize: function(url, options) {
		this._url = url;
		this._rotation = this.options.rotation;

		L.setOptions(this, options);
	},

	onAdd: function(map) {
		/* Copied from L.ImageOverlay */
		this._map = map;

		if (!this._image) {
			this._initImage();
		}

		map._panes.overlayPane.appendChild(this._image);

		map.on('viewreset', this._reset, this);

		if (map.options.zoomAnimation && L.Browser.any3d) {
			map.on('zoomanim', this._animateZoom, this);
		}

		/* Have to wait for the image to load because we need to access its width and height. */
		L.DomEvent.on(this._image, 'load', function() {
			this._initImageDimensions();
			this._reset();
		}, this);		
	},

	_initImage: function () {
		L.ImageOverlay.prototype._initImage.call(this);

		L.extend(this._image, {
			alt: this.options.alt
		});
	},

	_initImageDimensions: function() {
		var map = this._map,

			originalImageWidth = L.DomUtil.getStyle(this._image, 'width'),
			originalImageHeight = L.DomUtil.getStyle(this._image, 'height'),

			aspectRatio = originalImageWidth / originalImageHeight,
			mapHeight = L.DomUtil.getStyle(map._container, 'height'),
			mapWidth = L.DomUtil.getStyle(map._container, 'width'),

			imageHeight = this.options.height,
			imageWidth = aspectRatio*imageHeight,

			center = map.latLngToContainerPoint(map.getCenter()),
			offset = new L.Point(mapWidth - imageWidth, mapHeight - imageHeight).divideBy(2);

		if (!this.options.corners) { this._corners = this.options.corners; }
		else {
			this._corners = [
				map.containerPointToLatLng(center.subtract(offset)),
				map.containerPointToLatLng(center.add(new L.Point(offset.x, - offset.y))),
				map.containerPointToLatLng(center.add(offset)),
				map.containerPointToLatLng(center.add(new L.Point(- offset.x, offset.y)))
			];
		}
	},

	_updateCorner: function(corner, latlng) {
		this._corners[corner] = latlng;
		this.distort();
	},

	// use CSS to transform the image
	_reset: function() {
		var map = this._map,
			image = this._image,
			topLeft = map.latLngToLayerPoint(this._corners[0]),
			warp, translation,
			transformMatrix;

		transformMatrix = this._calculateProjectiveTransform();
		// transformMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

		warp = L.DomUtil.getMatrixString(transformMatrix);
		// rotation = L.DomUtil.getRotateString(this._rotation, 'rad');
		translation = L.DomUtil.getTranslateString(topLeft);
		// scaling = ''; // TODO 

		image.style[L.DomUtil.TRANSFORM] = [warp, translation].join(' ');
	},

	_calculateProjectiveTransform: function() {
		var offset = this._map.latLngToContainerPoint(this._corners[0]),
			w = this._image.offsetWidth, 
			h = this._image.offsetHeight,
			c = [],
			j;

		/* Convert corners to container points (i.e. cartesian coordinates). */
		for (j = 0; j < this._corners.length; j++) {
			c.push(this._map.latLngToContainerPoint(this._corners[j])._subtract(offset));
		}

		return L.MatrixUtil.general2DProjection(
			0, 0, c[0].x, c[0].y,
			-w, 0, c[1].x, c[1].y,
			0, h, c[2].x, c[2].y,
			-w, h, c[3].x, c[3].y
		);
	},

	// TODO
	_animateZoom: function() {

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
