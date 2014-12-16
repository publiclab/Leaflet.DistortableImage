L.DomUtil = L.extend(L.DomUtil, {
	getMatrixString: function(m) {
		var is3d = L.Browser.webkit3d,
			/* Since matrix3d takes a 4*4 matrix, we add in an empty row and column, which act as the identity on the z-axis. */
			matrix = [
				m[0], m[3], 0, m[6],
				m[1], m[4], 0, m[7],
				   0,    0, 1,    0,
				m[2], m[5], 0, m[8]
			];

		if (!is3d) { throw 'Your browser must support 3D CSS transforms in order to use DistortableImageOverlay.'; }

		return 'matrix3d(' + matrix.join(',') + ')';
	},

	getRotateString: function(angle, units) {
		var is3d = L.Browser.webkit3d,
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
L.RotatableMarker = L.Marker.extend({

	options: {
		rotation: 0
	},

	initialize: function(latlng, options) {
		L.Marker.prototype.initialize.call(this, latlng, options);
		this.setRotation(this.options.rotation);
	},

	setRotation: function(theta) {
		this._rotation = theta;
		
		this.update();
		this.fire('rotate', { rotation: this._rotation });

		return this;
	},

	getRotation: function() {
		return this._rotation;
	},

	_setPos: function(pos) {
		var rotation = this.getRotation(),
			transformString = [L.DomUtil.getTranslateString(pos), L.DomUtil.getRotateString(rotation, 'rad')].join(' ');

		this._icon._leaflet_pos = pos;
		this._icon.style[L.DomUtil.TRANSFORM] = transformString;

		if (this._shadow) {
			this._shadow._leaflet_pos = pos;
			this._shadow.style[L.DomUtil.TRANSFORM] = transformString;
		}

		this._zIndex = pos.y + this.options.zIndexOffset;

		this._resetZIndex();
	}
});

L.rotatableMarker = function(latlng, options) {
	return new L.RotatableMarker(latlng, options);
};
L.EditHandle = L.RotatableMarker.extend({
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

		if (this._handled.getRotation) {
			markerOptions.rotation = this._handled.getRotation();
		}

		L.RotatableMarker.prototype.initialize.call(this, latlng, markerOptions);
	},

	onAdd: function(map) {
		L.RotatableMarker.prototype.onAdd.call(this, map);
		this._bindListeners();

		this.updateHandle();
	},

	onRemove: function(map) {
		this._unbindListeners();
		L.RotatableMarker.prototype.onRemove.call(this, map);
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
L.RotateHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotate',
		icon: new L.Icon({ 
			iconUrl: '../src/images/circle-o_cc4444_16.png',
			iconSize: [16, 16],
			iconAnchor: [8, 8]}
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
L.WarpHandle = L.EditHandle.extend({
	options: {
		TYPE: 'warp',
		icon: new L.Icon({ 
			iconUrl: '../src/images/circle-o_444444_16.png',
			iconSize: [16, 16],
			iconAnchor: [8, 8]}
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
<<<<<<< HEAD:DistortableImageOverlay.js
L.ImageMarker = L.Marker.extend({
  // icons generated from FontAwesome at: http://fa2png.io/
  icons: { grey: 'circle-o_444444_16.png',
            red: 'circle-o_cc4444_16.png',
         locked: 'close_444444_16.png'
  },
  options: {
    pane: 'markerPane',
    icon: false,
    // title: '',
    // alt: '',
    clickable: true,
    draggable: true, 
    keyboard: true,
    zIndexOffset: 0,
    opacity: 1,
    riseOnHover: true,
    riseOffset: 250
  },
  setFromIcons: function(name) {
    this.setIcon(new L.Icon({iconUrl:$L.options.img_dir+this.icons[name],iconSize:[16,16],iconAnchor:[8,8]}));
  }
  
});

=======
>>>>>>> Rename production files for distribution.:DistortableImage.js
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
			topLeft = map.latLngToContainerPoint(this._corners[0]),
			translation, warp,
			transformMatrix;

		transformMatrix = this._calculateProjectiveTransform(L.bind(map.latLngToContainerPoint, map));

		warp = L.DomUtil.getMatrixString(transformMatrix);
		translation = L.DomUtil.getTranslateString(topLeft);

		/* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
		image._leaflet_pos = topLeft;

		image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');

		/* Set origin to the upper-left corner rather than the center of the image, which is the default. */
		image.style[L.DomUtil.TRANSFORM + '-origin'] = "0 0 0";
	},

	/*
	 * Calculates the transform string that will be correct *at the end* of zooming.
	 * Leaflet then generates a CSS3 animation between the current transform and 
	 *     future transform which makes the transition appear smooth.
	 */
	_animateZoom: function(event) {
		var map = this._map,
			image = this._image,
			nw = this._corners[0],
			latLngToNewLayerPoint = function(latlng) {
				return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
			},

			topLeft = map.layerPointToContainerPoint(latLngToNewLayerPoint(nw)),
			transformMatrix = this._calculateProjectiveTransform(latLngToNewLayerPoint),

			warp = L.DomUtil.getMatrixString(transformMatrix),
			translation = L.DomUtil.getTranslateString(topLeft);

		/* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
		image._leaflet_pos = topLeft;

		image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
	},

	getCorners: function() {
		return this._corners;
	},

	/*
	 * Calculates the centroid of the image.
	 *     See http://stackoverflow.com/questions/6149175/logical-question-given-corners-find-center-of-quadrilateral
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

L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
	initialize: function(overlay) {
		this._overlay = overlay;
		this._mode = 0; // warp
	},

	addHooks: function() {
		var overlay = this._overlay,
			map = overlay._map,
			i;

		this._warpHandles = new L.LayerGroup();
		for (i = 0; i < 4; i++) {
			this._warpHandles.addLayer(new L.WarpHandle(overlay, i));
		}

		this._rotateHandles = new L.LayerGroup();
		for (i = 0; i < 4; i++) {
			this._rotateHandles.addLayer(new L.RotateHandle(overlay, i));
		}

		this._handles = [this._warpHandles, this._rotateHandles];


		/* TODO: Tell L.Draggable how to find the position of the image. */
		this._enableDragging();

		map.addLayer(this._warpHandles);

		/* TODO: Why doesn't this._overlay.on('click') work? */
		L.DomEvent.on(this._overlay._image, 'click', this._toggleMode, this);
		L.DomEvent.on(this._overlay._image, 'click', this._showToolbar, this);
	},

	_toggleMode: function() {
		var map = this._overlay._map;

		map.removeLayer(this._handles[this._mode]);

		/* Switch mode. */
		this._mode = (this._mode + 1) % 2;

		map.addLayer(this._handles[this._mode]);
	},

	removeHooks: function() {
		var map = this._overlay._map;

		map.removeLayer(this._handles[this._mode]);
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

		/* 
		 * Adjust default behavior of L.Draggable.
	     * By default, L.Draggable overwrites the CSS3 warp transform 
	     *     that we want when it calls L.DomUtil.setPosition.
		 */
		this.dragging._updatePosition = function() {
			var delta = this._newPos.subtract(map.latLngToContainerPoint(overlay._corners[0])),
				currentPoint, i;

			this.fire('predrag');

			for (i = 0; i < 4; i++) {
				currentPoint = map.latLngToContainerPoint(overlay._corners[i]);
				overlay._corners[i] = map.containerPointToLatLng(currentPoint.add(delta));
			}
			overlay._reset();
			overlay.fire('update');

			this.fire('drag');
		};

		this.dragging.on('dragend', this._toggleMode, this);
	},

	_showToolbar: function() {

	},

	// onclick: function() {
	// 	var map = this._map;

	// 	// first, delete existing buttons
	// 	$('#image-distort-transparency').parent().remove();
	// 	$('#image-distort-outline').parent().remove();
	// 	$('#image-distort-delete').parent().remove();

	// 	this.transparencyBtn = L.easyButton('fa-adjust', 
	// 		 function () {
	// 			 var e = $('#'+$('#image-distort-outline')[0].getAttribute('parentImgId'))[0];
	// 			 if (e.opacity === 1) {
	// 				 L.setOpacity(e,0.7);
	// 				 e.setAttribute('opacity',0.7);
	// 			 } else {
	// 				 L.setOpacity(e,1);
	// 				 e.setAttribute('opacity',1);
	// 			 }
	// 		 },
	// 		'Toggle Image Transparency'
	// 	).getContainer(); //.children[0]
		
	// 	this.outlineBtn = L.easyButton('fa-square-o', 
	// 																 function () {
	// 																	 this.scope.toggleOutline();
	// 																 },
	// 																 'Outline',
	// 																 map,
	// 																 this
	// 	);
 
	// 	this.deleteBtn = L.easyButton('fa-bitbucket', 
	// 		function () {
	// 			map.removeLayer($(this.parentImgId));
	// 			for(var i=0; i < 4; i++) {
	// 				map.removeLayer(this.markers[i]);
	// 			}
	// 		},
	// 	 'Delete Image'
	// 	);
	// },	

});

L.DistortableImageOverlay.addInitHook(function() {
	this.editing = new L.DistortableImage.Edit(this);

	if (this.options.editable) {
		L.DomEvent.on(this._image, 'load', this.editing.enable, this.editing);
	}
});