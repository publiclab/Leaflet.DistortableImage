/*

*/

$L = {
  debug: true,
  images: [],
  initialize: function() {
    // disable default Leaflet click interactions
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    this.initialPos = map.getCenter()

    // upload button
    L.easyButton('fa-file-image-o', 
      function (){
        $("#inputimage").click();
      },
      'Upload image'
    );

    // file observer
    $(":file").change(function () {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = $L.imageIsLoaded;
        reader.readAsDataURL(this.files[0]);
      }
    });
    
  },

  // set up basic behaviors once the image is loaded
  imageIsLoaded: function(e) {
    // default corners
    corners = [300, 200, 500, 200, 300, 400, 500, 400];
 
    img = new L.DistortableImage(e.target.result, corners);
    img.bringToFront().addTo(map);
      
  }
}

// Compute the adjugate of m
function adj(m) { 
  return [
    m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
  ];
}

// multiply two matrices
function multmm(a, b) { 
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
}

// multiply matrix and vector
function multmv(m, v) { 
  return [
    m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
    m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
    m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
  ];
}

function pdbg(m, v) {
  var r = multmv(m, v);
  return r + " (" + r[0]/r[2] + ", " + r[1]/r[2] + ")";
}

function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
  var m = [
    x1, x2, x3,
    y1, y2, y3,
    1,  1,  1
  ];
  var v = multmv(adj(m), [x4, y4, 1]);
  return multmm(m, [
    v[0], 0, 0,
    0, v[1], 0,
    0, 0, v[2]
  ]);
}

function general2DProjection(
  x1s, y1s, x1d, y1d,
  x2s, y2s, x2d, y2d,
  x3s, y3s, x3d, y3d,
  x4s, y4s, x4d, y4d
) {
  var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
  var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
  return multmm(d, adj(s));
}

function project(m, x, y) {
  var v = multmv(m, [x, y, 1]);
  return [v[0]/v[2], v[1]/v[2]];
}

// use CSS to transform the image
function transform2d(elt, x1, y1, x2, y2, x3, y3, x4, y4) {
  var w = elt.offsetWidth, h = elt.offsetHeight;

  var t = general2DProjection(0,  0, x1, y1, 
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
  elt.style["-webkit-transform-origin"] = orix+"px "+oriy+"px";
  elt.style["transform-origin"] = orix+"px "+oriy+"px";
  elt.style.transform = t;
}

L.DistortableImage = L.ImageOverlay.extend({
  _initImage: function () {
    this.img = this._image = L.DomUtil.create('img',
    'leaflet-image-layer ' +  'leaflet-zoom-animated');
    this.img.onclick = this.onclick;
    this.img.onselectstart = L.Util.falseFn;
    this.img.onmousemove = L.Util.falseFn;
    this.img.onload = L.bind(this.fire, this, 'load');
    this.img.src = this._url;
    this.img.alt = this.options.alt;
    this.img.id = this.id;

    // enable dragging -- need to debug drag listener
    draggable = new L.Draggable(this._image);
    draggable.enable();

    // need to update points after drag
    // perhaps define points relative to image location, or measure relative offset of drag, and apply to points    

    // not triggering
    this.on('drag', function() {console.log('drag',this);this.drag()});

  },

  initialize: function (url, corners, options) { 
    // but the element hasn't yet been made
    this.id = 'image-distort-'+$('.image-distort').length

    var bounds = [];
    this.markers  = []
    // go through four corners
    for(var i = 0; i < 8; i = i+2) {
      // convert to lat/lng
      var a = map.layerPointToLatLng([corners[i],corners[i+1]]);
      var marker = new L.ImageMarker([a.lat, a.lng]).addTo(map);
      marker.parentImage = this
      marker.orderId = i 
      this.markers.push(marker);
      bounds.push([a.lat,a.lng]);
      var addidclass = marker._icon;
      addidclass.id= "marker"+i+$('.image-distort').length;
      addidclass.className = addidclass.className + " corner";
    }

    // we should switch this to accept lat/lngs
    this.corners = corners;
    this.defaultZoom = map._zoom; // the zoom level at the time the image was created
    this.opaque = false;
    this.outlined = false;
    this._url = url;
    this._bounds = L.latLngBounds(bounds);// (LatLngBounds, Object)
    this.initialPos = map.latLngToContainerPoint(this._bounds._northEast)

    // weird, but this lets instances of DistorableImage 
    // retain the updateTransform() and other methods:
    this.updateTransform = this.updateTransform 
    this.updateCorners = this.updateCorners

    for (i in this.markers) {
      this.markers[i].on('drag',this.distort,this);
      //this.markers[i].on('dragstart',this.resetInitialPos,this);
    }

    // resize handler isn't passing scope "this"
    //$(window).resize(this.resetInitialPos,this);
    map.on('zoomend',this.resetInitialPos,this)
    // maintain initialPos when map is panned
    //map.on('drag',this.resetInitialPos,this)
  
    map.on('drag',function() {
      this.updateCorners()
//this.resetInitialPos()
    },this)

    L.setOptions(this, options);
  },

  // updates this.initialPos
  resetInitialPos: function() {
    this.initialPos = map.latLngToContainerPoint(this._bounds._northEast)
    this.debug()
  },

  // update the css transform of the image
  // this is all screwed up; it's not even called 
  drag: function() {
console.log('drag begin')
    // update all four when dragging whole image
    // then update
    this.updateCorners()
    this.updateTransform()
console.log('drag')
  },

  // remember 'this' gets context of marker, not image
  distort: function() {
    this.updateCorners()
    this.updateTransform()
  },

  // recalc corners (x,y) from markers (lat,lng)
  updateCorners: function() {
    // diff in element position vs. when first initialized;
    // this fixes the transform if you've panned the map
// THIS ISNT RIGHT - IT BREAKS THINGS if you zoom after panning
// but ODDLY it is essential for keeping the distortion in the same place relative to map panning -- even when its broken, the offset is constant.
    var dx = this.initialPos.x-map.latLngToContainerPoint(this._bounds._northEast).x
    var dy = this.initialPos.y-map.latLngToContainerPoint(this._bounds._northEast).y

    // OK - when removing the transform, the image itself has panned. we have to correct for that. 

    // this section makes it work for zooming after distorting, but if you zoom after panning, distortion no longer works. Go figure. : 
//    dx += map.latLngToContainerPoint(map.getCenter()).x - map.latLngToContainerPoint($L.initialPos).x
//    dy += map.latLngToContainerPoint(map.getCenter()).y - map.latLngToContainerPoint($L.initialPos).y

    // make zoom-invariant
//    dx /= Math.pow(2,this.defaultZoom-map._zoom)
//    dy /= Math.pow(2,this.defaultZoom-map._zoom)

    this.corners = []
    for(i=0;i<this.markers.length;i++) {
      var pt = map.latLngToContainerPoint(this.markers[i]._latlng)
      this.corners.push(pt.x+dx,pt.y+dy)
    }
    this.debug()
  },

  updateTransform: function() {
    transform2d(this.img, 
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
      $('#debug-green').css('left',map.latLngToContainerPoint(map.getCenter()).x)
      $('#debug-green').css('width',map.latLngToContainerPoint(map.getCenter()).x-map.latLngToContainerPoint($L.initialPos).x)
      $('#debug-green').css('top',map.latLngToContainerPoint(map.getCenter()).y)
      $('#debug-green').css('height',map.latLngToContainerPoint(map.getCenter()).y-map.latLngToContainerPoint($L.initialPos).y)
console.log()

      $('#debug-green').css('right',map.latLngToContainerPoint(this._bounds._southWest).y)
      $('#debugb').css('left',map.latLngToContainerPoint(this._bounds._southWest).x)
      $('#debugb').css('top',map.latLngToContainerPoint(this._bounds._northEast).y)
      $('#debugb').css('width',map.latLngToContainerPoint(this._bounds._northEast).x-map.latLngToContainerPoint(this._bounds._southWest).x)
      $('#debugb').css('height',map.latLngToContainerPoint(this._bounds._southWest).y-map.latLngToContainerPoint(this._bounds._northEast).y)
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
      this.img.setOpacity(0.2);
      this.img.css('border','2px solid black');
    } else {
      this.img.setOpacity(1);
      this.img.css('border', '');
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
    this.transparencyBtn.id = 'image-distort-outline';
    this.transparencyBtn.setAttribute('parentImgId',this.id)
    
    this.outlineBtn = L.easyButton('fa-square-o', 
      function () {
        outline();
      },
      'Outline'
    ).getContainer().children[0]
    this.outlineBtn.id = 'image-distort-outline';
    this.outlineBtn.setAttribute('parentImgId',this.id)
          
    this.deleteBtn = L.easyButton('fa-bitbucket', 
      function () {
        map.removeLayer($(this.parentImgId));
        for(var i=0; i<4; i++)
        map.removeLayer(this.markers[i]);
      },
     'Delete Image'
    ).getContainer().children[0]
    this.deleteBtn.id = 'image-distort-delete';
    this.deleteBtn.setAttribute('parentImgId',this.id)
  }

})

L.ImageMarker = L.Marker.extend({
  options: {
    pane: 'markerPane',
    icon: new L.Icon({iconUrl:'imagedistort/images/imarker.png'}),
    // title: '',
    // alt: '',
    clickable: true,
    draggable: true, // this causes an error. Why?
    keyboard: true,
    zIndexOffset: 0,
    opacity: 1,
    riseOnHover: true,
    riseOffset: 250
  }
});

