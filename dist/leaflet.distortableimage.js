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

		if (options && options.hasOwnProperty('draggable')) {
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
	}

});

L.DistortHandle = L.EditHandle.extend({
	options: {
		TYPE: 'distort',
		icon: new L.Icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==',
			iconSize: [32, 32],
			iconAnchor: [16, 16]}
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

			angle = this._calculateAngle(formerLatLng, newLatLng),
			scale = this._calculateScalingFactor(formerLatLng, newLatLng);

		overlay.editing._rotateBy(angle);
		overlay.editing._scaleBy(scale);

		overlay.fire('update');
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
		crossOrigin: true
	},

	initialize: function(url, options) {
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
	});

L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
	options: {
		actions: [
			ToggleTransparency,
			RemoveOverlay,
			ToggleOutline,
			ToggleEditable,
			ToggleRotateDistort,
			ToggleExport
		]
	}
});

L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
	options: {
		opacity: 0.7,
		outline: '1px solid red',
		keymap: {
			68: '_toggleRotateDistort', // d
			69: '_toggleIsolate', // e
			73: '_toggleIsolate', // i
			76: '_toggleLock', // l
			79: '_toggleOutline', // o
			82: '_toggleRotateDistort', // r
			84: '_toggleTransparency', // t
		}
	},

	initialize: function(overlay) {
		this._overlay = overlay;

		/* Interaction modes. */
		this._mode = this._overlay.options.mode || 'distort';
		this._transparent = false;
		this._outlined = false;
	},

	/* Run on image seletion. */
	addHooks: function() {
		var overlay = this._overlay,
			map = overlay._map,
			i;

			/* bring the selected image into view */
			overlay.bringToFront();

		this._lockHandles = new L.LayerGroup();
		for (i = 0; i < 4; i++) {
			this._lockHandles.addLayer(new L.LockHandle(overlay, i, { draggable: false }));
		}

		this._distortHandles = new L.LayerGroup();
		for (i = 0; i < 4; i++) {
			this._distortHandles.addLayer(new L.DistortHandle(overlay, i));
		}

		this._rotateHandles = new L.LayerGroup();
		for (i = 0; i < 4; i++) {
			this._rotateHandles.addLayer(new L.RotateHandle(overlay, i));
		}

		this._handles = {
			'lock':		 this._lockHandles,
			'distort': this._distortHandles,
			'rotate':	this._rotateHandles
		};

		if (this._mode === 'lock') {
			map.addLayer(this._lockHandles);
		} else {
			this._mode = 'distort';
			map.addLayer(this._distortHandles);
			this._enableDragging();
		}

		//overlay.on('click', this._showToolbar, this);
		L.DomEvent.on(overlay._image, 'click', this._showToolbar, this);

		/* Enable hotkeys. */
		L.DomEvent.on(window, 'keydown', this._onKeyDown, this);

		overlay.fire('select');

	},

	/* Run on image deseletion. */
	removeHooks: function() {
		var overlay = this._overlay,
			map = overlay._map;

		// L.DomEvent.off(window, 'keydown', this._onKeyDown, this);

		L.DomEvent.off(overlay._image, 'click', this._showToolbar, this);

		// First, check if dragging exists;
		// it may be off due to locking
		if (this.dragging) { this.dragging.disable(); }
		delete this.dragging;

		map.removeLayer(this._handles[this._mode]);

 		/* Disable hotkeys. */
		L.DomEvent.off(window, 'keydown', this._onKeyDown, this);

		overlay.fire('deselect');
	},

	_rotateBy: function(angle) {
		var overlay = this._overlay,
			map = overlay._map,
			center = map.latLngToLayerPoint(overlay.getCenter()),
			i, p, q;

		for (i = 0; i < 4; i++) {
			p = map.latLngToLayerPoint(overlay._corners[i]).subtract(center);
			q = new L.Point(
				Math.cos(angle)*p.x - Math.sin(angle)*p.y,
				Math.sin(angle)*p.x + Math.cos(angle)*p.y
			);
			overlay._corners[i] = map.layerPointToLatLng(q.add(center));
		}

		overlay._reset();
	},

	_scaleBy: function(scale) {
		var overlay = this._overlay,
			map = overlay._map,
			center = map.latLngToLayerPoint(overlay.getCenter()),
			i, p;

		for (i = 0; i < 4; i++) {
			p = map.latLngToLayerPoint(overlay._corners[i])
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

		/* Hide toolbars while dragging; click will re-show it */
		this.dragging.on('dragstart', this._hideToolbar, this);

		/*
		 * Adjust default behavior of L.Draggable.
		 * By default, L.Draggable overwrites the CSS3 distort transform
		 * that we want when it calls L.DomUtil.setPosition.
		 */
		this.dragging._updatePosition = function() {
			var delta = this._newPos.subtract(map.latLngToLayerPoint(overlay._corners[0])),
				currentPoint, i;

			this.fire('predrag');

			for (i = 0; i < 4; i++) {
				currentPoint = map.latLngToLayerPoint(overlay._corners[i]);
				overlay._corners[i] = map.layerPointToLatLng(currentPoint.add(delta));
			}
			overlay._reset();
			overlay.fire('update');

			this.fire('drag');
		};
	},

	_onKeyDown: function(event) {
		var keymap = this.options.keymap,
			handlerName = keymap[event.which];

		if (handlerName !== undefined) {
			this[handlerName].call(this);
		}
	},

	_toggleRotateDistort: function() {
		var map = this._overlay._map;

		map.removeLayer(this._handles[this._mode]);

		/* Switch mode. */
		if (this._mode === 'rotate') { this._mode = 'distort'; }
		else { this._mode = 'rotate'; }

		map.addLayer(this._handles[this._mode]);
	},

	_toggleTransparency: function() {
		var image = this._overlay._image,
			opacity;

		this._transparent = !this._transparent;
		opacity = this._transparent ? this.options.opacity : 1;

		L.DomUtil.setOpacity(image, opacity);
		image.setAttribute('opacity', opacity);
	},

	_toggleOutline: function() {
		var image = this._overlay._image,
			opacity, outline;

		this._outlined = !this._outlined;
		opacity = this._outlined ? this.options.opacity / 2 : 1;
		outline = this._outlined ? this.options.outline : 'none';

		L.DomUtil.setOpacity(image, opacity);
		image.setAttribute('opacity', opacity);

		image.style.outline = outline;
	},

	_toggleLock: function() {
		var map = this._overlay._map;

		map.removeLayer(this._handles[this._mode]);
		/* Switch mode. */
		if (this._mode === 'lock') {
			this._mode = 'distort';
			this._enableDragging();
		} else {
			this._mode = 'lock';
			if (this.dragging) { this.dragging.disable(); }
			delete this.dragging;
		}

		map.addLayer(this._handles[this._mode]);
	},

	_hideToolbar: function() {
		var map = this._overlay._map;
		if (this.toolbar) {
			map.removeLayer(this.toolbar);
			this.toolbar = false;
		}
	},

	_showToolbar: function(event) {
		var overlay = this._overlay,
                     target = event.target,
			map = overlay._map;

		/* Ensure that there is only ever one toolbar attached to each image. */
		this._hideToolbar();
		var point;
		if (event.containerPoint) { point = event.containerPoint; }
		else { point = target._leaflet_pos; }
		var raised_point = map.containerPointToLatLng(new L.Point(point.x,point.y-20));
		raised_point.lng = overlay.getCenter().lng;
		this.toolbar = new L.DistortableImage.EditToolbar(raised_point).addTo(map, overlay);
		overlay.fire('toolbar:created');

		L.DomEvent.stopPropagation(event);
	},


	// Based on https://github.com/publiclab/mapknitter/blob/8d94132c81b3040ae0d0b4627e685ff75275b416/app/assets/javascripts/mapknitter/Map.js#L47-L82
	_toggleExport: function (){
		var map = this._overlay._map; 
		var overlay = this._overlay;

		// make a new image
		var downloadable = new Image();
		
		downloadable.id = downloadable.id || "tempId12345";
		$('body').append(downloadable);

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
 
			if (window && window.hasOwnProperty('warpWebGl')) {
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
		L.DomEvent.on(this._image, 'load', this.editing.enable, this.editing);
	}

	this.on('remove', function () {
		if (this.editing) { this.editing.disable(); }
	});
});
