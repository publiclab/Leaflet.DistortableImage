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

		// transformMatrix = this._calculateProjectiveTransform();
		transformMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

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
			w, 0, c[1].x, c[1].y,
			0, h, c[2].x, c[2].y,
			w, h, c[3].x, c[3].y
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

L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
	initialize: function(overlay) {
		this._overlay = overlay;

			this.dragging = new L.Draggable(overlay._image);
			this.dragging.enable();
			if (this.options.locked) { this.lock(); }

			this.changeMode('distort');

			// this.dragging.on('dragstart',function() {
			//   this.dragStartPos = this._overlay._map.latLngToLayerPoint(this._bounds._northEast) // get position so we can track offset
			//   for (i in this.markers) {
			//     this.markers[i].startPos = this.markers[i].getLatLng()
			//   }
			// },this)

			// // update the points too
			// this.dragging.on('drag',function() {
			//   dx = this.dragging._newPos.x-this.dragging._startPos.x
			//   dy = this.dragging._newPos.y-this.dragging._startPos.y

			//   for (i in this.markers) {
			//     var pos = this._overlay._map.latLngToLayerPoint(this.markers[i].startPos)
			//     pos.x += dx
			//     pos.y += dy
			//     this.markers[i].setLatLng(this._overlay._map.layerPointToLatLng(new L.Point(pos.x,pos.y)))
			//   }
			//   this.updateCorners()
			//   this.updateTransform()
			// }, this);

			// this.dragging.on('dragend',function() {
			//   // undo the toggling of mode from the initial click
			//   this.toggleMode()
			// }, this);
		
	},

	addHooks: function() {

	},

	removeHooks: function() {

	},

	rotateStart: function() {
		var map = this._map;

		this.center = this.getCenter();
		this.pointer_distance = Math.sqrt(Math.pow(this.center[1]-L.MatrixUtil.pointer.y,2)+Math.pow(this.center[0]-L.MatrixUtil.pointer.x, 2));
		this.pointer_angle = Math.atan2(this.center[1]-L.MatrixUtil.pointer.y,this.center[0]-L.MatrixUtil.pointer.x);
		for (var i in this.markers) {
			var marker = this.markers[i];
			var mx = map.latLngToLayerPoint(marker._latlng).x;
			var my = map.latLngToLayerPoint(marker._latlng).y;
			marker.angle = Math.atan2(my-this.center[1],mx-this.center[0]);
			marker.distance = (mx-this.center[0])/Math.cos(marker.angle);
		}
	},

	// rotate and scale; scaling isn't real -- it just tracks distance from "center", and can distort the image in some cases
	rotate: function() {
		// use center to rotate around a point
		var distance = Math.sqrt(Math.pow(this.center[1]-$L.pointer.y,2)+Math.pow(this.center[0]-$L.pointer.x,2));
		var distance_change = distance - this.pointer_distance;
		var angle = Math.atan2(this.center[1]-$L.pointer.y,this.center[0]-$L.pointer.x);
		var angle_change = angle-this.pointer_angle;

		// keyboard keypress event is not hooked up:
		if ($L.shifted) { angle_change = 0; }

		// use angle to recalculate each of the points in this.parent_shape.points
		for (var i in this.markers) {
		  var marker = this.markers[parseInt(i)];
		  this.markers[parseInt(i)]._latlng = this._overlay._map.layerPointToLatLng(new L.point(
			[   this.center[0] + 
					Math.cos(marker.angle+angle_change) *
				   (marker.distance + distance_change),
				this.center[1] + 
					Math.sin(marker.angle+angle_change) * 
					(marker.distance + distance_change)
			]));
		  marker.update();
		}
		this.updateCorners();
		this.updateTransform();
	},

	// change between 'distort' and 'rotate' mode
	toggleMode: function() {
		if (this.mode === 'rotate') {
			this.changeMode('distort');
		} else {
			this.changeMode('rotate');
		}
	},

	changeMode: function(mode) {
		this.mode = mode;
		$.each(this.markers,function(i,m) {
			if (mode === 'rotate') {
				m.off('dragstart');
				m.off('drag');
				m.on('dragstart',this.parentImage.rotateStart,this.parentImage);
				m.on('drag',this.parentImage.rotate,this.parentImage);
				m.setFromIcons('red');
			} else if (mode === 'locked') {
				m.off('dragstart');
				m.off('drag');
				// setIcon and draggable.disable() conflict;
				// described here but not yet fixed: 
				// https://github.com/Leaflet/Leaflet/issues/2578
				//m.draggable.disable()
				m.setFromIcons('locked');
			} else { // default
				m.off('drag');
				m.on('drag',this.parentImage.distort,this.parentImage);
				m.setFromIcons('grey');
			}
		});
	},

	toggleTransparency: function() {
		this.transparent = !this.transparent;
		if (this.transparent) {
			this.setOpacity(0.4);
		} else {
			this.setOpacity(1);
		}
	},

	toggleIsolate: function() {
		this.isolated = !this.isolated;
		if (this.isolated) {
			$.each($L.images,function(i,img) {
				img.hidden = false;
				img.setOpacity(1);
			});
		} else {
			$.each($L.images,function(i,img) {
				img.hidden = true;
				img.setOpacity(0);
			});
		}
		this.hidden = false;
		this.setOpacity(1);
	},

	toggleVisibility: function() {
		this.hidden = !this.hidden;
		if (this.hidden) {
			this.setOpacity(1);
		} else {
			this.setOpacity(0);
		}
	},	

	// This overlaps somewhat with the changeMode() method. 
	// Could consolidate.
	lock: function() {
		this.locked = true;
		this.off('dragstart');
		this.off('drag');
		this.draggable.disable();
		this.changeMode('locked');
	},

	unlock: function() {
		this.locked = false;
		this.draggable.enable();
		this.changeMode('distort');
	},

	deselect: function() {
		$L.selected = false;
		for (var i in this.markers) {
			// this isn't a good way to hide markers:
			this._overlay._map.removeLayer(this.markers[i]);
		}
		if (this.outlineBtn) {
			// delete existing buttons
			this.outlineBtn._container.remove();
			this.transparencyBtn._container.remove();
			this.deleteBtn._container.remove();
		}
		this.onDeselect();
	},

	select: function() {
		// deselect other images
		$.each($L.images,function(i,d) {
			d.deselect.apply(d);
		});

		// re-establish order
		$L.impose_order();
		$L.selected = this;
		// show corner markers
		for (var i in this.markers) {
			this.markers[i].addTo(this._overlay._map);
		}

		// create buttons
		this.transparencyBtn = L.easyButton('fa-adjust', 
			L.bind(function() { this.toggleTransparency(); }, this),
			'Toggle Image Transparency',
			this._overlay._map,
			this
		);

		this.outlineBtn = L.easyButton('fa-square-o',
			L.bind(function() { this.toggleOutline(); }, this),
			'Outline',
			this._overlay._map,
			this
		);

		this.deleteBtn = L.easyButton('fa-bitbucket',
			L.bind(function () {
				this._overlay._map.removeLayer($(this.parentImgId));
				for (var i = 0; i < 4; i++) { 
					this._overlay._map.removeLayer(this.markers[i]); 
				}
			}, this),
		'Delete Image');

		this.bringToFront();
		this.onSelect();
	},

	toggleOutline: function() {
		this.outlined = !this.outlined;
		if (this.outlined) {
			this.setOpacity(0.4);
			$(this._image).css('border','1px solid red');
		} else {
			this.setOpacity(1);
			$(this._image).css('border', 'none');
		}
	}
});

// L.DistortableImageOverlay.addInitHook(function() {
// 	this.editing = new L.DistortableImage.Edit(this);

// 	if (this.options.editable) {
// 		this.editing.enable();
// 	}
// });