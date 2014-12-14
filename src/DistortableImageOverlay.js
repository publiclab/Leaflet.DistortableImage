L.DistortableImageOverlay = L.ImageOverlay.extend({
	options: {
		alt: '',
		height: 200
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
		/* End copied from L.ImageOverlay */

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

		if (this.options.corners) { this._corners = this.options.corners; }
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
		this._reset();
	},

	_reset: function() {
		var map = this._map,
			image = this._image,
			topLeft = map.latLngToLayerPoint(this._corners[0]),
			translation, warp,
			transformMatrix;

		transformMatrix = this._calculateProjectiveTransform(L.bind(map.latLngToContainerPoint, map));

		warp = L.DomUtil.getMatrixString(transformMatrix);
		translation = L.DomUtil.getTranslateString(topLeft);

		image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');

		/* Set origin to the upper-left corner rather than the center of the image, which is the default. */
		image.style['transform-origin'] = "0 0 0";
		image.style["-webkit-transform-origin"] = "0 0 0";
	},

	_animateZoom: function(event) {
		var map = this._map,
			image = this._image,
			nw = this._corners[0],
			latLngToNewLayerPoint = function(latlng) {
				return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
			},

			topLeft = latLngToNewLayerPoint(nw),
			transformMatrix = this._calculateProjectiveTransform(latLngToNewLayerPoint),

			warp = L.DomUtil.getMatrixString(transformMatrix),
			translation = L.DomUtil.getTranslateString(topLeft);

			image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
	},

	_calculateProjectiveTransform: function(latLngToCartesian) {
		var offset = latLngToCartesian(this._corners[0]),
			w = this._image.offsetWidth, 
			h = this._image.offsetHeight,
			c = [],
			j;

		/* Convert corners to container points (i.e. cartesian coordinates). */
		for (j = 0; j < this._corners.length; j++) {
			c.push(latLngToCartesian(this._corners[j])._subtract(offset));
		}

		/*
		 * This matrix describes the action of the CSS transform on each corner of the image.
		 * It maps from the coordinate system centered at the upper left corner of the image
		 *     to the region bounded by the latlngs in this._corners.
		 * For example:
		 *     0, 0, c[0].x, c[0].y
		 *     says that the upper-left corner of the image maps to the first latlng in this._corners.
		 */
		return L.MatrixUtil.general2DProjection(
			0, 0, c[0].x, c[0].y,
			w, 0, c[1].x, c[1].y,
			0, h, c[2].x, c[2].y,
			w, h, c[3].x, c[3].y
		);
	}
});
