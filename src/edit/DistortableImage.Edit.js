L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
	initialize: function(overlay) {
		this._overlay = overlay;

		this._cornerMarkers = new L.LayerGroup();

		// this.dragging.on('dragstart',function() {
		// 	this.dragStartPos = map.latLngToLayerPoint(this._bounds._northEast) // get position so we can track offset
		// 	for (i in this.markers) {
		// 		this.markers[i].startPos = this.markers[i].getLatLng()
		// 	}
		// }, this)

		// // update the points too
		// this.dragging.on('drag',function() {
		// 	dx = this.dragging._newPos.x-this.dragging._startPos.x
		// 	dy = this.dragging._newPos.y-this.dragging._startPos.y

		// 	for (i in this.markers) {
		// 		var pos = map.latLngToLayerPoint(this.markers[i].startPos)
		// 		pos.x += dx
		// 		pos.y += dy
		// 		this.markers[i].setLatLng(map.layerPointToLatLng(new L.Point(pos.x,pos.y)))
		// 	}
		// 	this.updateCorners()
		// 	this.updateTransform()
		// }, this);

		// this.dragging.on('dragend',function() {
		// 	if (this.mode == 'rotate') this.mode = 'distort'
		// 	else this.mode = 'rotate'
		// 	this.changeMode()
		// }, this);		
	},

	addHooks: function() {
		var overlay = this._overlay,
			map = overlay._map;

		for (var i = 0, l = overlay._corners.length; i < l; i++) {
			this._cornerMarkers.addLayer(new L.WarpHandle(overlay, i));
		}

		// this.dragging = new L.Draggable(this._overlay._image);
		// this.dragging.enable();

		map.addLayer(this._cornerMarkers);
	},

	removeHooks: function() {

	},

	// rotateStart: function() {
	// 	var map = this._map;

	// 	this.center = this.getCenter();
	// 	this.pointer_distance = Math.sqrt(Math.pow(this.center[1]-L.MatrixUtil.pointer.y,2)+Math.pow(this.center[0]-L.MatrixUtil.pointer.x, 2));
	// 	this.pointer_angle = Math.atan2(this.center[1]-L.MatrixUtil.pointer.y,this.center[0]-L.MatrixUtil.pointer.x);
	// 	for (var i in this.markers) {
	// 		var marker = this.markers[i];
	// 		var mx = map.latLngToLayerPoint(marker._latlng).x;
	// 		var my = map.latLngToLayerPoint(marker._latlng).y;
	// 		marker.angle = Math.atan2(my-this.center[1],mx-this.center[0]);
	// 		marker.distance = (mx-this.center[0])/Math.cos(marker.angle);
	// 	}
	// },

	// rotate and scale; scaling isn't real -- it just tracks distance from "center", and can distort the image in some cases
	// rotate: function() {
	// 	var map = this._map;

	// 	// use center to rotate around a point
	// 	var distance = Math.sqrt(Math.pow(this.center[1]-L.MatrixUtil.pointer.y,2)+Math.pow(this.center[0]-L.MatrixUtil.pointer.x,2));
	// 	var distance_change = distance - this.pointer_distance;
	// 	var angle = Math.atan2(this.center[1]-L.MatrixUtil.pointer.y,this.center[0]-L.MatrixUtil.pointer.x);
	// 	var angle_change = angle-this.pointer_angle;

	// 	// keyboard keypress event is not hooked up:
	// 	if (false) {
	// 		angle_change = 0;
	// 	}

	// 	// use angle to recalculate each of the points in this.parent_shape.points
	// 	for (var i in this.markers) {
	// 		var marker = this.markers[parseInt(i)];
	// 		this.markers[parseInt(i)]._latlng = map.layerPointToLatLng(new L.point(
	// 			[   this.center[0] +
	// 					Math.cos(marker.angle+angle_change) *
	// 					(marker.distance+distance_change),
	// 				this.center[1] +
	// 					Math.sin(marker.angle+angle_change) *
	// 					(marker.distance+distance_change)
	// 			]));
	// 		marker.update();
	// 	}
	// 	this.updateCorners();
	// 	this.updateTransform();
	// },	

	// change between 'distort' and 'rotate' mode
	// _toggleMode: function() {
	// 	var setRed = function(i,m) { m.setFromIcons('red'); },
	// 		setGrey = function(i,m) { m.setFromIcons('grey'); };

	// 	for (var i in this.markers) {
	// 		if (this.mode === 'rotate') {
	// 			this.markers[i].off('dragstart');
	// 			this.markers[i].off('drag');
	// 			this.markers[i].on('dragstart',this.rotateStart,this);
	// 			this.markers[i].on('drag',this.rotate,this);
	// 			$.each(this.markers, setRed);
	// 		} else {
	// 			this.markers[i].off('drag');
	// 			this.markers[i].on('drag',this.distort,this);
	// 			$.each(this.markers, setGrey);
	// 		}
	// 	}
	// },

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

	// lock: function() {
	// 	this.locked = true;
	// 	$.each(this.markers,function(i,m) {
	// 		m.setFromIcons('locked');
	// 	});
	// },

	// unlock: function() {
	// 	this.locked = false;
	// 	this.mode = 'distort';
	// 	$.each(this.markers,function(i,m) {
	// 		m.setFromIcons('grey');
	// 	});
	// },

	// toggleOutline: function() {
	// 	this.outlined = !this.outlined;
	// 	if (this.outlined) {
	// 		this.setOpacity(0.4);
	// 		$(this._image).css('border','1px solid red');
	// 	} else {
	// 		this.setOpacity(1);
	// 		$(this._image).css('border', 'none');
	// 	}
	// }	

});

L.DistortableImageOverlay.addInitHook(function() {
	this.editing = new L.DistortableImage.Edit(this);

	if (this.options.editable) {
		L.DomEvent.on(this._image, 'load', this.editing.enable, this);
	}
});