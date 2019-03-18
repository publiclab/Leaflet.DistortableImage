L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
	options: {
		opacity: 0.7,
		outline: '1px solid red',
		keymap: {
			8: "_removeOverlay", // backspace windows / delete mac
			46: "_removeOverlay", // delete windows / delete + fn mac
			20: '_toggleRotate', // CAPS
			68: '_toggleRotateDistort', // d
			69: '_toggleIsolate', // e
			73: '_toggleIsolate', // i
			74: '_sendUp', // j
			75: '_sendDown', // k
			76: '_toggleLock', // l
			79: '_toggleOutline', // o
			82: '_toggleRotateDistort', // r
			83: '_toggleScale', // s
			84: '_toggleTransparency', // t
		}
	},

	initialize: function(overlay) {
		this._overlay = overlay;
		this._toggledImage = false;

		/* Interaction modes. */
		this._mode = this._overlay.options.mode || 'distort';
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
			this._lockHandles.addLayer(new L.LockHandle(overlay, i, { draggable: false }));
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
			'lock':		 this._lockHandles,
			'distort': this._distortHandles,
			'rotate':	this._rotateHandles,
			'scale': this._scaleHandles,
			'rotateStandalone': this.__rotateHandles
		};

    if (this._mode === 'lock') {
			map.addLayer(this._lockHandles);
		} else {
			this._mode = 'distort';
			map.addLayer(this._distortHandles);
			this._enableDragging();
		}

		L.DomEvent.on(map, 'click', this._removeSelections, this);

		L.DomEvent.on(overlay, 'dragstart', this._dragStartMultiple, this);

		L.DomEvent.on(overlay, 'drag', this._dragMultiple, this);

		//overlay.on('click', this._showToolbar, this);
		L.DomEvent.on(overlay._image, 'click', this._showToolbar, this);

		L.DomEvent.on(overlay._image, 'mousedown', this._showSelected, this);

		/* Enable hotkeys. */
		L.DomEvent.on(window, 'keydown', this._onKeyDown, this);

		overlay.fire('select');

	},

	/* Run on image deselection. */
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

  confirmDelete: function () {
    return window.confirm("Are you sure you want to delete?");
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

	// drag events for multiple images are separated out from enableDragging initialization -- two different concepts
	_dragStartMultiple: function() {
		var overlay = this._overlay,
			map = overlay._map;

		// pass by value alternative for future code refactoring possibility
		// overlay._initialCorners = JSON.parse(JSON.stringify(overlay.getCorners()));

		// var obj = {};
		// var marker = L.marker([35.10418, -106.62987]).bindPopup("I am a Marker");
		// var polyline = L.polyline([[35.10418, -106.62987], [35.19738, -106.875], [35.07946, -106.80634]], { color: 'red', weight: 8 }).bindPopup("I am a Polyline"); 
		// var pointsLayerGroup = L.layerGroup([marker, polyline]).addTo(map);
		// this.pointsLayerGroup = L.layerGroup().addTo(map);
		// window.pointsLayerGroup = this.pointsLayerGroup;
		// window.points2LayerGroup = points2LayerGroup;
		overlay._initialCornerPoints = {};
		
		window.obj = {};

		window.obj.initVal = 0;
		window.obj.initVal1 = 0;
		window.obj.initVal2 = 0;
		window.obj.initVal3 = 0;

		var i = 0;
		for (var k in window.obj) {
			window.obj[k] = map.latLngToLayerPoint(window.img.getCorners()[i]);
			overlay._initialCornerPoints[k] = map.latLngToLayerPoint(overlay.getCorners()[i]);
			i += 1;
		}

		overlay._cornerPointChanges = {};

	},

	_dragMultiple: function() {
		var overlay = this._overlay,
			map = overlay._map;

		overlay._currentCornerPoints = {};

		var i = 0;
		for (var k in window.obj) {
			overlay._currentCornerPoints[k] = map.latLngToLayerPoint(overlay.getCorners()[i]);
			i += 1;
		}

		// this.pointsLayerGroup.addLayer(overlay);

		this.calcCornerChanges(overlay);

		var objD = this.calcNewCorners(overlay);

		this._updateCorners(objD, overlay);
	},

	calcCornerChanges: function(overlay) {
		overlay._cornerPointChanges.changes = overlay._initialCornerPoints.initVal.x - overlay._currentCornerPoints.initVal.x;
		overlay._cornerPointChanges.changes1 = overlay._initialCornerPoints.initVal.y - overlay._currentCornerPoints.initVal.y;

		overlay._cornerPointChanges.changes2 = overlay._initialCornerPoints.initVal1.x - overlay._currentCornerPoints.initVal1.x;
		overlay._cornerPointChanges.changes3 = overlay._initialCornerPoints.initVal1.y - overlay._currentCornerPoints.initVal1.y;

		overlay._cornerPointChanges.changes4 = overlay._initialCornerPoints.initVal2.x - overlay._currentCornerPoints.initVal2.x;
		overlay._cornerPointChanges.changes5 = overlay._initialCornerPoints.initVal2.y - overlay._currentCornerPoints.initVal2.y;

		overlay._cornerPointChanges.changes6 = overlay._initialCornerPoints.initVal3.x - overlay._currentCornerPoints.initVal3.x;
		overlay._cornerPointChanges.changes7 = overlay._initialCornerPoints.initVal3.y - overlay._currentCornerPoints.initVal3.y;
	},

	calcNewCorners: function(overlay) {
		var objD = {};
		objD.newVal = [window.obj.initVal.x - overlay._cornerPointChanges.changes, window.obj.initVal.y - overlay._cornerPointChanges.changes1];
		objD.newVal1 = [window.obj.initVal1.x - overlay._cornerPointChanges.changes2, window.obj.initVal1.y - overlay._cornerPointChanges.changes3];
		objD.newVal2 = [window.obj.initVal2.x - overlay._cornerPointChanges.changes4, window.obj.initVal2.y - overlay._cornerPointChanges.changes5];
		objD.newVal3 = [window.obj.initVal3.x - overlay._cornerPointChanges.changes6, window.obj.initVal3.y - overlay._cornerPointChanges.changes7];
		
		return objD;
	},

	// TODO: move to overlay class
	_updateCorners: function(objD, overlay) {
		window.overlay = overlay;
		var imgAry = this.getImages();
		var i = 0;
		for (var k in objD) {
			imgAry[0]._updateCorner(i, overlay._map.layerPointToLatLng(objD[k]));
			i += 1;
		}

		imgAry[0].fire('update');
	},

	// cannot use the DistortableImageOverlay update corner method for this
	// _updateImageCorner: function(img, corner, latlng) {

	// 	imgAry[0].getCorners()[i].lat = overlay._map.layerPointToLatLng(objD[k]).lat;
	// 	imgAry[0].getCorners()[i].lng = overlay._map.layerPointToLatLng(objD[k]).lng;
	// },

	getImages: function() {
		// this._overlay._map.getPane('overlayPane').children();
		var image_array = [];

		window.imagesLayerGroup.eachLayer(function (layer) {
			image_array.push(layer);
		});

		return image_array;
		// this._polyline = L.polyline(polyline_array);
		// this._overlay._map.eachLayer(function (layer) {
		// 	if layer 
		// 	console.log(layer.name);
		// });
	},

	_enableDragging: function() {
		var overlay = this._overlay,
			map = overlay._map;

		this.dragging = new L.Draggable(overlay._image);
		this.dragging.enable();

		/* Hide toolbars while dragging; click will re-show it */
		this.dragging.on('dragstart', function () {
			overlay.fire('dragstart');
			this._hideToolbar();
		}, this);

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
			overlay.fire('drag');

			this.fire('drag');
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
		if (this._mode === 'rotate') { this._mode = 'distort'; }
		else { this._mode = 'rotate'; }

		map.addLayer(this._handles[this._mode]);
	},

	_toggleScale: function() {
		var map = this._overlay._map;

		map.removeLayer(this._handles[this._mode]);

		this._mode = 'scale';

		map.addLayer(this._handles[this._mode]);
	},

	_toggleRotate: function() {
		var map = this._overlay._map;

		map.removeLayer(this._handles[this._mode]);

		this._mode = 'rotateStandalone';

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
		if (this._overlay.options.suppressToolbar !== true) {
		this.toolbar = new L.DistortableImage.EditToolbar(raised_point).addTo(map, overlay);
		overlay.fire('toolbar:created');
		}

		L.DomEvent.stopPropagation(event);
	},
	
	_showSelected: function(event) {
		if (event.metaKey || event.ctrlKey) {
			$(event.target).toggleClass('selected');
		}
	},

	_removeSelections: function() {
		$('.selected').removeClass('selected');
	},

  _removeOverlay: function () {
    var overlay = this._overlay;
    if (this._mode !== "lock") {
      var choice = this.confirmDelete();
      if (choice) {
        overlay._map.removeLayer(overlay);
        overlay.fire('delete');
        this.disable();
      }
    }
  },
	// compare this to using overlay zIndex
	_toggleOrder: function () {
	if (this._toggledImage) {
		this._overlay.bringToFront();
		this._toggledImage = false;
		}
	else {
		this._overlay.bringToBack();
		this._toggledImage = true;
		}
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
