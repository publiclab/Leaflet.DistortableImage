$L = {
  debug: false,
  images: [],
  pointer: {x:0,y:0},
  initialize: function(options) {

    this.options = options || {}

    // disable some default Leaflet interactions
    // not really sure why this is necessary
    map.touchZoom.disable();
    map.doubleClickZoom.disable();

    map.on('mousemove',function(e) {
      this.pointer = map.latLngToLayerPoint(e.latlng)
    },this)

    if (this.options['uploadBtn']) {
      // create upload button
      L.easyButton('fa-file-image-o', 
        function (){ $("#inputimage").click(); },
        'Upload image'
      );
      // file observer
      $(":file").change(function () {
        if (this.files && this.files[0]) {
          var reader = new FileReader();
          reader.onload = function(e) {
            img = new L.DistortableImageOverlay(e.target.result);
          }
          reader.readAsDataURL(this.files[0]);
        }
      });
    }
  },

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
    var c = Array(9);
    for (var i = 0; i != 3; ++i) {
      for (var j = 0; j != 3; ++j) {
        var cij = 0;
        for (var k = 0; k != 3; ++k) {
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

  pdbg: function(m, v) {
    var r = $L.multmv(m, v);
    return r + " (" + r[0]/r[2] + ", " + r[1]/r[2] + ")";
  },

  basisToPoints: function(x1, y1, x2, y2, x3, y3, x4, y4) {
    var m = [
      x1, x2, x3,
      y1, y2, y3,
      1,  1,  1
    ];
    var v = $L.multmv($L.adj(m), [x4, y4, 1]);
    return $L.multmm(m, [
      v[0], 0, 0,
      0, v[1], 0,
      0, 0, v[2]
    ]);
  },

  general2DProjection: function(
    x1s, y1s, x1d, y1d,
    x2s, y2s, x2d, y2d,
    x3s, y3s, x3d, y3d,
    x4s, y4s, x4d, y4d
  ) {
    var s = $L.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
    var d = $L.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
    return $L.multmm(d, $L.adj(s));
  },

  project: function(m, x, y) {
    var v = $L.multmv(m, [x, y, 1]);
    return [v[0]/v[2], v[1]/v[2]];
  },

  // use CSS to transform the image
  transform2d: function(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
    var w = elt.offsetWidth, h = elt.offsetHeight;
 
    var t = $L.general2DProjection(0,  0, x1, y1, 
                                   w,  0, x2, y2, 
                                   0,  h, x3, y3, 
                                   w,  h, x4, y4
    );
 
    for(i = 0; i != 9; ++i) t[i] = t[i]/t[8];
    t = [t[0], t[3], 0, t[6],
         t[1], t[4], 0, t[7],
         0   , 0   , 1, 0   ,
         t[2], t[5], 0, t[8]];
    t = "matrix3d(" + t.join(", ") + ")";
    elt.style["-webkit-transform"] = t;
    elt.style["-moz-transform"] = t;
    elt.style["-o-transform"] = t;
 
    var orix = 0, oriy = 0;
    $('#'+elt.id).css('transform-origin','0px 0px 0px') // this worked better in Firefox; little bit redundant
    elt.style["transform-origin"] = orix+"px "+oriy+"px";
    elt.style["-webkit-transform-origin"] = orix+"px "+oriy+"px";
    elt.style.transform = t;
  }
}

L.ImageMarker = L.Marker.extend({
  // icons generated from FontAwesome at: http://fa2png.io/
  icons: { grey: '../src/images/circle-o_444444_16.png',
            red: '../src/images/circle-o_cc4444_16.png',
         locked: '../src/images/close_444444_16.png'
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
    this.setIcon(new L.Icon({iconUrl:this.icons[name],iconSize:[16,16],iconAnchor:[8,8]}))
  }
  
});

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
          if (s.draggable._enabled) {
            s.bringToFront()
//this isn't called... weird.
console.log('btf')
            if (s.mode == 'rotate') s.mode = 'distort'
            else s.mode = 'rotate'
            s.changeMode.apply(s)
          }
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

  // currently not running
  onclick: function(e) {
console.log('btf')
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
    this.off('dragstart');
    this.off('drag');
    this.draggable.disable()
    $.each(this.markers,function(i,m) {
      m.setFromIcons('locked')
    })
  },

  unlock: function() {
    this.locked = false
    this.draggable.enable()
    this.mode = 'distort'
    this.changeMode() // reattaches listeners
    $.each(this.markers,function(i,m) {
      m.setFromIcons('grey')
    })
  }

});
