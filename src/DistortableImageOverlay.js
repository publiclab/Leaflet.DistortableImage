L.DistortableImageOverlay = L.ImageOverlay.extend({
  // runs after initialize()
  _initImage: function () {
    this._image = L.DomUtil.create('img',
    'leaflet-image-layer ' +  'leaflet-zoom-animated');
    this._image.onclick = (function(s){ return function() {s.onclick()} })(this);
    this._image.onselectstart = L.Util.falseFn;
    this._image.onmousemove = L.Util.falseFn;
    this._image.src = this._url;
    this._image.alt = this.options.alt;
    this.id = 'image-distort-'+$('.image-distort').length
    this._image.id = this.id;

    this._image.onload = (function(s) {
      return function() {
        s._image.onclick = function() {
          if (s.mode == 'rotate') s.mode = 'distort'
          else s.mode = 'rotate'
          s.changeMode.apply(s)
        }
      }
    })(this)
 
    this.mode = 'distort'
    this.changeMode()

    this.draggable = new L.Draggable(this._image);
    this.draggable.enable();

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
      if (this.mode == 'rotate') this.mode = 'distort'
      else this.mode = 'rotate'
      this.changeMode()
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
        var marker = new L.ImageMarker([a.lat, a.lng])
        marker.setFromIcons('grey')
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
      this.opaque = false;
      this.outlined = false;
      this._url = url;
      this._bounds = L.latLngBounds(bounds);// (LatLngBounds, Object)
      this.initialPos = this.getPosition()
      // tracking pans
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

      // this actually displays it on the map:
      this.bringToFront().addTo(map);

    },this, 'load');

    // fire!!
    this.nativeImg.src = url

    // we ought to separate Leaflet options from native options
    L.setOptions(this, options);
  },

  // change between 'distort' and 'rotate' mode
  changeMode: function() {
    for (var i in this.markers) {
      if (this.mode == 'rotate') {
        this.markers[i].off('dragstart');
        this.markers[i].off('drag');
        this.markers[i].on('dragstart',this.rotateStart,this);
        this.markers[i].on('drag',this.rotate,this);
        $.each(this.markers,function(i,m) {
          m.setFromIcons('red')
        })
      } else {
        this.markers[i].off('drag');
        this.markers[i].on('drag',this.distort,this);
        $.each(this.markers,function(i,m) {
          m.setFromIcons('grey')
        })
      }
    }
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
  },

  toggleOutline: function() {
    this.outlined = !this.outlined;
    if (this.outlined) {
      this.setOpacity(0.4);
      $('#'+this._image.id).css('border','1px solid red');
    } else {
      this.setOpacity(1);
      $('#'+this._image.id).css('border', 'none');
    }
  },

  onclick: function(e) {
    // first, delete existing buttons
    $('#image-distort-transparency').parent().remove();
    $('#image-distort-outline').parent().remove();
    $('#image-distort-delete').parent().remove();

    this.transparencyBtn = L.easyButton('fa-adjust', 
       function () {
         var e = $('#'+$('#image-distort-outline')[0].getAttribute('parentImgId'))[0]
         if (e.opacity == 1) {
           L.setOpacity(e,0.7);
           e.setAttribute('opacity',0.7);
         } else {
           L.setOpacity(e,1);
           e.setAttribute('opacity',1);
         }
       },
      'Toggle Image Transparency'
    ).getContainer()//.children[0]
    
    this.outlineBtn = L.easyButton('fa-square-o', 
                                   function () {
                                     this.scope.toggleOutline();
                                   },
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
     'Delete Image'
    )
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
    if (false) angle_change = 0 

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

  lock: function() {
    this.locked = true
    $.each(this.markers,function(i,m) {
      m.setFromIcons('locked')
    })
  },

  unlock: function() {
    this.locked = false
    this.mode = 'distort'
    $.each(this.markers,function(i,m) {
      m.setFromIcons('grey')
    })
  }

});
