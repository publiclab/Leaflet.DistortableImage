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

L.DistortableImageOverlay.addInitHook(function() {
	this.editing = new L.DistortableImage.Edit(this);

	if (this.options.editable) {
		L.DomEvent.on(this._image, 'load', this.editing.enable, this.editing);
	}
});