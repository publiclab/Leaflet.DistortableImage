L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
	options: {
		opacity: 0.7,
		outline: '1px solid red',
		keymap: {
			68: '_toggleRotateDistort', // d
			73: '_toggleIsolate', // i
			76: '_toggleEnabled', // l
			79: '_toggleOutline', // o
			82: '_toggleRotateDistort', // r
			84: '_toggleTransparency', // t
		}
	},

	initialize: function(overlay) {
		this._overlay = overlay;

		/* Interaction modes. */
		this._transparent = false;
		this._outlined = false;
	},

	addHooks: function() {
		var overlay = this._overlay,
			map = overlay._map,
			i;

		this._distortHandles = new L.LayerGroup();
		for (i = 0; i < 4; i++) {
			this._distortHandles.addLayer(new L.DistortHandle(overlay, i));
		}

		this._rotateHandles = new L.LayerGroup();
		for (i = 0; i < 4; i++) {
			this._rotateHandles.addLayer(new L.RotateHandle(overlay, i));
		}

		this._mode = 'distort';
		this._handles = { 
			'distort': this._distortHandles, 
			'rotate':  this._rotateHandles
		};

		map.addLayer(this._distortHandles);

		this._enableDragging();

		overlay.on('click', this._showToolbar, this);

		/* Enable hotkeys. */
		L.DomEvent.on(window, 'keydown', this._onKeyDown, this);
	},

	removeHooks: function() {
		var overlay = this._overlay,
			map = overlay._map;

		// L.DomEvent.off(window, 'keydown', this._onKeyDown, this);

		overlay.off('click', this._showToolbar, this);

		this.dragging.disable();
		delete this.dragging;

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
	     * By default, L.Draggable overwrites the CSS3 distort transform 
	     *     that we want when it calls L.DomUtil.setPosition.
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

	_toggleEnabled: function() {
		if (this.enabled()) { 
			this.disable(); 
		}
		else { 
			this.enable(); 
		}
	},

	_showToolbar: function(event) {
		new L.Toolbar.Popup(event.latlng, L.DistortableImage.EDIT_TOOLBAR)
			.addTo(this._overlay._map, this._overlay);
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
	},

	toggleVisibility: function() {
		// this.hidden = !this.hidden;
		// if (this.hidden) {
		// 	this.setOpacity(1);
		// } else {
		// 	this.setOpacity(0);
		// }
	},

	deselect: function() {
		// $L.selected = false;
		// for (var i in this.markers) {
		// 	// this isn't a good way to hide markers:
		// 	this._overlay._map.removeLayer(this.markers[i]);
		// }
		// if (this.outlineBtn) {
		// 	// delete existing buttons
		// 	this.outlineBtn._container.remove();
		// 	this.transparencyBtn._container.remove();
		// 	this.deleteBtn._container.remove();
		// }
		// this.onDeselect();
	},

	select: function() {
		// // deselect other images
		// $.each($L.images,function(i,d) {
		// 	d.deselect.apply(d);
		// });

		// // re-establish order
		// $L.impose_order();
		// $L.selected = this;
		// // show corner markers
		// for (var i in this.markers) {
		// 	this.markers[i].addTo(this._overlay._map);
		// }

		// // create buttons
		// this.transparencyBtn = L.easyButton('fa-adjust', 
		// 	L.bind(function() { this.toggleTransparency(); }, this),
		// 	'Toggle Image Transparency',
		// 	this._overlay._map,
		// 	this
		// );

		// this.outlineBtn = L.easyButton('fa-square-o',
		// 	L.bind(function() { this.toggleOutline(); }, this),
		// 	'Outline',
		// 	this._overlay._map,
		// 	this
		// );

		// this.deleteBtn = L.easyButton('fa-bitbucket',
		// 	L.bind(function () {
		// 		this._overlay._map.removeLayer($(this.parentImgId));
		// 		for (var i = 0; i < 4; i++) { 
		// 			this._overlay._map.removeLayer(this.markers[i]); 
		// 		}
		// 	}, this),
		// 'Delete Image');

		// this.bringToFront();
		// this.onSelect();
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