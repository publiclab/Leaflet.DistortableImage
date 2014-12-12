L.Util.Matrix = {

	// Compute the adjugate of m
	adj: function(m) { 
		return [
			m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
			m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
			m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
		];
	},

	// multiply two matrices
	multmm: function(a, b) { 
		var c = [],
			i;

		for (i = 0; i < 4; i++) {
			for (var j = 0; j < 4; j++) {
				var cij = 0;
				for (var k = 0; k < 4; k++) {
					cij += a[3*i + k]*b[3*k + j];
				}
				c[3*i + j] = cij;
			}
		}
		return c;
	},

	// multiply matrix and vector
	multmv: function(m, v) { 
		return [
			m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
			m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
			m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
		];
	},

	basisToPoints: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		var m = [
			x1, x2, x3,
			y1, y2, y3,
			1,  1,  1
		];
		var v = L.Util.Matrix.multmv(L.Util.Matrix.adj(m), [x4, y4, 1]);
		return L.Util.Matrix.multmm(m, [
			v[0], 0, 0,
			0, v[1], 0,
			0, 0, v[2]
		]);
	},


	project: function(m, x, y) {
		var v = L.Util.Matrix.multmv(m, [x, y, 1]);
		return [v[0]/v[2], v[1]/v[2]];
	},

	general2DProjection: function(
	x1s, y1s, x1d, y1d,
	x2s, y2s, x2d, y2d,
	x3s, y3s, x3d, y3d,
	x4s, y4s, x4d, y4d
	) {
		var s = L.Util.Matrix.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
		var d = L.Util.Matrix.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
		return L.Util.Matrix.multmm(d, L.Util.Matrix.adj(s));
	}
};
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
	this.center = this.getCenter();
	this.pointer_distance = Math.sqrt(Math.pow(this.center[1]-$L.pointer.y,2)+Math.pow(this.center[0]-$L.pointer.x,2));
	this.pointer_angle = Math.atan2(this.center[1]-$L.pointer.y,this.center[0]-$L.pointer.x);
	for (var i in this.markers) {
		var marker = this.markers[i];
		var mx = this._overlay._map.latLngToLayerPoint(marker._latlng).x;
		var my = this._overlay._map.latLngToLayerPoint(marker._latlng).y;
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

  // has scope of img element; use this.parentObj
  onclick: function(e) {
	if ($L.selected === this.parentObj) {
		if (this.parentObj.locked !== true) {
			this.parentObj.toggleMode.apply(this.parentObj);
		}
	} else {
		this.parentObj.select.apply(this.parentObj);
	}
	// this prevents the event from propagating to the this._overlay._map object:
	L.DomEvent.stopPropagation(e);
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

});

// L.DistortableImageOverlay.addInitHook(function() {
// 	this.editing = new L.DistortableImage.Edit(this);

// 	if (this.options.editable) {
// 		this.editing.enable();
// 	}
// });