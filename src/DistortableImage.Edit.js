L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
	initialize: function(overlay) {
		this._overlay = overlay;

			this.dragging = new L.Draggable(overlay._image);
			this.dragging.enable();
			if (this.options.locked) this.lock()

			this.changeMode('distort')

			// this.dragging.on('dragstart',function() {
			//   this.dragStartPos = map.latLngToLayerPoint(this._bounds._northEast) // get position so we can track offset
			//   for (i in this.markers) {
			//     this.markers[i].startPos = this.markers[i].getLatLng()
			//   }
			// },this)

			// // update the points too
			// this.dragging.on('drag',function() {
			//   dx = this.dragging._newPos.x-this.dragging._startPos.x
			//   dy = this.dragging._newPos.y-this.dragging._startPos.y

			//   for (i in this.markers) {
			//     var pos = map.latLngToLayerPoint(this.markers[i].startPos)
			//     pos.x += dx
			//     pos.y += dy
			//     this.markers[i].setLatLng(map.layerPointToLatLng(new L.Point(pos.x,pos.y)))
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

  rotateStart: function(e) {
    this.center = this.getCenter()
    this.pointer_distance = Math.sqrt(Math.pow(this.center[1]-$L.pointer.y,2)+Math.pow(this.center[0]-$L.pointer.x,2))
    this.pointer_angle = Math.atan2(this.center[1]-$L.pointer.y,this.center[0]-$L.pointer.x)
    for (var i in this.markers) {
      var marker = this.markers[i]
      var mx = map.latLngToLayerPoint(marker._latlng).x
      var my = map.latLngToLayerPoint(marker._latlng).y
      marker.angle = Math.atan2(my-this.center[1],mx-this.center[0])
      marker.distance = (mx-this.center[0])/Math.cos(marker.angle)
    }
  },

  // rotate and scale; scaling isn't real -- it just tracks distance from "center", and can distort the image in some cases
  rotate: function(e) {
    // use center to rotate around a point
    var distance = Math.sqrt(Math.pow(this.center[1]-$L.pointer.y,2)+Math.pow(this.center[0]-$L.pointer.x,2))
    var distance_change = distance - this.pointer_distance
    var angle = Math.atan2(this.center[1]-$L.pointer.y,this.center[0]-$L.pointer.x)
    var angle_change = angle-this.pointer_angle

    // keyboard keypress event is not hooked up:
    if ($L.shifted) angle_change = 0 

    // use angle to recalculate each of the points in this.parent_shape.points
    for (var i in this.markers) {
      var marker = this.markers[parseInt(i)]
      this.markers[parseInt(i)]._latlng = map.layerPointToLatLng(new L.point(
        [   this.center[0]
          + Math.cos(marker.angle+angle_change)
          * (marker.distance+distance_change),
            this.center[1]
          + Math.sin(marker.angle+angle_change)
          * (marker.distance+distance_change)
        ]))
      marker.update()
    }
    this.updateCorners()
    this.updateTransform()
  },

  // has scope of img element; use this.parentObj
  onclick: function(e) {
    if ($L.selected == this.parentObj) {
      if (this.parentObj.locked != true) {
        this.parentObj.toggleMode.apply(this.parentObj)
      }
    } else {
      this.parentObj.select.apply(this.parentObj)
    }
    // this prevents the event from propagating to the map object:
    L.DomEvent.stopPropagation(e);
  },

	// change between 'distort' and 'rotate' mode
	toggleMode: function() {
		if (this.mode == 'rotate') {
			this.changeMode('distort')
		} else {
			this.changeMode('rotate')
		}
	},

	changeMode: function(mode) {
		this.mode = mode
		$.each(this.markers,function(i,m) {
			if (mode == 'rotate') {
				m.off('dragstart');
				m.off('drag');
				m.on('dragstart',this.parentImage.rotateStart,this.parentImage);
				m.on('drag',this.parentImage.rotate,this.parentImage);
				m.setFromIcons('red')
			} else if (mode == 'locked') {
				m.off('dragstart');
				m.off('drag');
				// setIcon and draggable.disable() conflict;
				// described here but not yet fixed: 
				// https://github.com/Leaflet/Leaflet/issues/2578
				//m.draggable.disable()
				m.setFromIcons('locked')
			} else { // default
				m.off('drag');
				m.on('drag',this.parentImage.distort,this.parentImage);
				m.setFromIcons('grey')
			}
		})
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
		this.isolated = !this.isolated
		if (this.isolated) {
			$.each($L.images,function(i,img) {
				img.hidden = false
				img.setOpacity(1)
			})
		} else {
			$.each($L.images,function(i,img) {
				img.hidden = true
				img.setOpacity(0)
			})
		}
		this.hidden = false
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
		this.locked = true
		this.off('dragstart');
		this.off('drag');
		this.draggable.disable()
		this.changeMode('locked')
	},

	unlock: function() {
		this.locked = false
		this.draggable.enable()
		this.changeMode('distort')
	},

  deselect: function() {
    $L.selected = false
    for (i in this.markers) {
      // this isn't a good way to hide markers:
      map.removeLayer(this.markers[i])
    }
    if (this.outlineBtn) {
      // delete existing buttons
      this.outlineBtn._container.remove()
      this.transparencyBtn._container.remove()
      this.deleteBtn._container.remove()
    }
    this.onDeselect()
  },

  select: function() {
    // deselect other images
    $.each($L.images,function(i,d) {
      d.deselect.apply(d)
    })

    // re-establish order
    $L.impose_order()
    $L.selected = this
    // show corner markers
    for (i in this.markers) {
      this.markers[i].addTo(map)
    }

    // create buttons
    this.transparencyBtn = L.easyButton('fa-adjust', 
      (function (s) {
        return function() {
          s.toggleTransparency();
        }
      })(this),
      'Toggle Image Transparency',
      map,
      this
    )
    
    this.outlineBtn = L.easyButton('fa-square-o', 
      (function (s) {
        return function() {
          s.toggleOutline();
        }
      })(this),
      'Outline',
      map,
      this
    )
  
    this.deleteBtn = L.easyButton('fa-bitbucket', 
      function () {
        map.removeLayer($(this.parentImgId));
        for(var i=0; i<4; i++)
        map.removeLayer(this.markers[i]);
      },
     'Delete Image')

    this.bringToFront()
    this.onSelect()
  },	

});

L.DistortableImageOverlay.addInitHook(function() {
	this.editing = new L.DistortableImage.Edit(this);

	if (this.options.editable) {
		this.editing.enable();
	}
});