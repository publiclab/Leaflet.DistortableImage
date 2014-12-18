L.DistortableImageOverlay = L.ImageOverlay.extend({
  // runs after initialize()
  _initImage: function () {
    this._image = L.DomUtil.create('img',
    'leaflet-image-layer ' +  'leaflet-zoom-animated');
    // i don't even think these two fire:
    this._image.onselectstart = L.Util.falseFn;
    this._image.onmousemove = L.Util.falseFn;

    this._image.src = this._url;
    this._image.alt = this.options.alt;
    this.id = 'image-distort-'+$L.images.length
    this._image.id = this.id;
    this._image.parentObj = this

    // file it for *centralized control* -- gasp
    // no really, for deselection
    $L.images.push(this)

    // save me from madness if this doesn't make sense to you;
    // we can only attach events once the image element is loaded:
    this._image.onload = (function(s) {
      return function() {
        s._image.onclick = s.onclick
        // lock on doubleclick
        $('#'+s._image.id).dblclick(function(e){ this.parentObj.toggleLock.apply(this.parentObj) })
      }
    })(this)
 
    this.changeMode('distort')

    this.draggable = new L.Draggable(this._image);
    this.draggable.enable();
    if (this.options.locked) this.lock()

    this.draggable.on('dragstart',function() {
      this.dragStartPos = map.latLngToLayerPoint(this._bounds._northEast) // get position so we can track offset
      for (i in this.markers) {
        this.markers[i].startPos = this.markers[i].getLatLng()
      }
    },this)

    // update the points too
    this.draggable.on('drag',function() {
      dx = this.draggable._newPos.x-this.draggable._startPos.x
      dy = this.draggable._newPos.y-this.draggable._startPos.y

      for (i in this.markers) {
        var pos = map.latLngToLayerPoint(this.markers[i].startPos)
        pos.x += dx
        pos.y += dy
        this.markers[i].setLatLng(map.layerPointToLatLng(new L.Point(pos.x,pos.y)))
      }
      this.updateCorners()
      this.updateTransform()
    },this)

    this.draggable.on('dragend',function() {
      // undo the toggling of mode from the initial click
      this.toggleMode()
    },this)
 
  },

  initialize: function (url, options) { 
    this.options = options || {}
    // do we have to get native size with this virtual "nativeImg"
    // or could we have done it on this._image.onLoad?
    this.nativeImg = new Image()
    this.nativeImg.onload = L.bind(function(i) {

      // let's make it not native size, but proportional:
      var ratio = this.nativeImg.width/this.nativeImg.height
      var imgh = 200, imgw = 200*ratio

      // check if it came with four latlngs, not just one
      if (this.options['latlng']) {
        this.corners = []
        var latlng = this.options['latlng']
        for (i in latlng) {
          this.corners.push(map.latLngToContainerPoint(latlng[i]).x)
          this.corners.push(map.latLngToContainerPoint(latlng[i]).y)
        }
      } else {
        // place in middle
        var x = $(window).width()/2-imgw/2
        var y = $(window).height()/2-imgh/2
        this.corners = [
          x,       y,
          x+imgw,  y,
          x,       y+imgh,
          x+imgw,  y+imgh
        ]
      }
     
      var bounds = [];
      this.markers  = []
      // go through four corners
      for(var i = 0; i < 8; i = i+2) {
        // convert to lat/lng
        var a = map.layerPointToLatLng([this.corners[i],this.corners[i+1]]);
        var marker = new L.ImageMarker(
          [a.lat, a.lng],
          // might as well do this now, so there's no possibility 
          // of dragging between initialization and final image load
          { draggable: (this.options.locked != true) }
        )
        if (this.options.locked == true) marker.setFromIcons('locked')
        else marker.setFromIcons('grey')
        marker.addTo(map);
        marker.parentImage = this
        marker.orderId = i 
        this.markers.push(marker);
        bounds.push([a.lat,a.lng]);
        var addidclass = marker._icon;
        addidclass.id= "marker"+i+$('.image-distort').length;
        addidclass.className = addidclass.className + " corner";
      }
     
      // the zoom level at the time the image was created:
      this.defaultZoom = map._zoom; 
      this.transparent = false;
      this.hidden = false;
      this.outlined = false;
      this._url = url;
      this._bounds = L.latLngBounds(bounds);// (LatLngBounds, Object)
      this.initialPos = this.getPosition()
      // for tracking pans
      this.offsetX = 0
      this.offsetY = 0
     
      // weird, but this lets instances of DistorableImage 
      // retain the updateTransform() and other methods:
      this.updateTransform = this.updateTransform 
      this.updateCorners = this.updateCorners
     
      map.on('resize',function() {
        this.updateCorners(true) // use "resize" param
        this.updateTransform()
      },this);
     
      map.on('zoomend', function() {
        this.initialPos = this.getPosition()
        this.updateCorners()
        this.updateTransform()
      },this)
     
      map.on('zoomstart', function() {
        // add a new offset:
        this.offsetX += this.getPosition().x
                      - this.initialPos.x
        this.offsetY += this.getPosition().y 
                      - this.initialPos.y
      },this)

      // this also deselects other images:
      this.select()

      // this actually displays it on the map:
      this.bringToFront().addTo(map)
      this.updateTransform()

    },this, 'load');

    // fire!!
    this.nativeImg.src = url

    // we ought to separate Leaflet options from native options
    L.setOptions(this, options);
  },

  // empty handler; can be user-replaced:
  onSelect: function() {

  },

  // empty handler; can be user-replaced:
  onDeselect: function() {

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

  toggleLock: function() {
    if (this.locked) this.unlock()
    else this.lock()
  },

  // remember 'this' gets context of marker, not image
  distort: function() {
    this.updateCorners()
    this.updateTransform()
  },

  getPosition: function() {
    return map.latLngToLayerPoint(new L.latLng(map.getBounds()._northEast.lat,map.getBounds()._southWest.lng))
  },

  // recalc corners (x,y) from markers (lat,lng)
  updateCorners: function(resize) {
    // diff in element position vs. when first initialized;
    // this fixes the transform if you've panned the map, 
    // since the element itself moves when panning
    var dx = -(this.initialPos.x-this.getPosition().x)
    var dy = -(this.initialPos.y-this.getPosition().y)

    // this accounts for offsets due to panning then zooming:
    dx += this.offsetX 
    dy += this.offsetY

    this.corners = []
    for(i=0;i<this.markers.length;i++) {
      var pt = map.latLngToContainerPoint(this.markers[i]._latlng)
      this.corners.push(pt.x+dx,pt.y+dy)
    }
    this.debug()
  },

  updateTransform: function() {
    $L.transform2d(this._image, 
      this.corners[0], 
      this.corners[1], 
      this.corners[2], 
      this.corners[3], 
      this.corners[4], 
      this.corners[5], 
      this.corners[6], 
      this.corners[7]
    );
    this.debug()
  },

  toggleOutline: function() {
    this.outlined = !this.outlined;
    if (this.outlined) {
      $('#'+this._image.id).css('border','1px solid red');
    } else {
      $('#'+this._image.id).css('border', 'none');
    }
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

  // cheaply get center by averaging the corners
  getCenter: function() {
    var x = 0, y = 0
    for (var i in this.markers) { // NW,NE,SW,SE, ugh
      var pos = map.latLngToLayerPoint(this.markers[i]._latlng)
      x += pos.x
      y += pos.y
    }
    x /= 4
    y /= 4
    return [x,y]
  },

  debug: function() {
    if ($L.debug) {
      $('#debugmarkers').show()
      $('#debug-green').css('left',this.getPosition().x)
      $('#debug-green').css('top',this.getPosition().y)

      $('#debug-green').css('right',this.getPosition().y)
      $('#debugb').css('left',this.getPosition().x)
      $('#debugb').css('top',this.getPosition().y)
      $('#debugb').css('width',this.getPosition().x)
      $('#debugb').css('height',this.getPosition().y)
      $('#debug').css('left',this.initialPos.x)
      $('#debug').css('top',this.initialPos.y)
      for (i=0;i<4;i++) {
        $('#debug'+i).css('left',this.corners[2*i])
        $('#debug'+i).css('top',this.corners[2*i+1])
      }
    }
  }

});
