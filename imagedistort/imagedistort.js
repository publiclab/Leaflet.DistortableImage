/*

Needs methods and variables ported into the $L namespace

*/

var imageBounds=[];
var markers=[];
var draggable={};
var newimg;

$L = {

  initialize: function() {
    // disable default Leaflet click interactions
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();

    // upload button
    L.easyButton('fa-file-image-o', 
      function (){
        $("#inputimage").click();
      },
      'Upload image'
    );
      
    // transparency button
    L.easyButton('fa-adjust', 
       function (){
         changeopacity();
       },
      'Toggle Image Transparency'
    );
    
    // outline button
    L.easyButton('fa-square-o', 
      function (){
        outline();
      },
      'Outline'
    );
          
    // delete button
    L.easyButton('fa-bitbucket', 
      function (){
        map.removeLayer(newimg);
        for(var i=0; i<4; i++)
        map.removeLayer(markers[i]);
      },
     'Delete Image'
    );

    // file observer
    $(":file").change(function () {
      if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = imageIsLoaded;
        reader.readAsDataURL(this.files[0]);
      }
    });
    
    // set up basic behaviors once the image is loaded
    function imageIsLoaded(e) {
      $('#myImg').attr('src', e.target.result);
      corners = [300, 200, 500, 200, 300, 400, 500, 400];
      for(var i = 0; i < 8; i = i+2) {
        var a = map.layerPointToLatLng([corners[i],corners[i+1]]);
        var marker = new L.ImageMarker([a.lat, a.lng]).addTo(map);
        markers.push(marker);
        imageBounds.push([a.lat,a.lng]);
        var addidclass = marker._icon;
        addidclass.id= "marker"+i;
        addidclass.className = addidclass.className + " corner";
      }
      
      newimg= new L.DistortableImage(e.target.result, imageBounds);
      newimg.bringToFront().addTo(map);

      // enable dragging
      draggable = new L.Draggable(newimg._image);
      draggable.enable();
      // need to update points after drag
      // perhaps define points relative to image location, or measure relative offset of drag, and apply to points    
 
      for (i in markers) {
        markers[i].on('drag', $L.update);
      }
        
    }
  },

  // update the css transform of the image
  update: function() {
    var box = document.getElementById("imgdistort");
    
    for (var i=0;i<4;i=i+1) {
      var conv = map.latLngToContainerPoint(markers[i]._latlng);
      corners[i*2] = conv.x;
      corners[i*2+1] = conv.y;
    }
 
    transform2d(box, corners[0], corners[1], corners[2], corners[3], corners[4], corners[5], corners[6], corners[7]);
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
        
  var t = general2DProjection(0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
  for(i = 0; i != 9; ++i) t[i] = t[i]/t[8];
  t = [t[0], t[3], 0, t[6],
       t[1], t[4], 0, t[7],
       0   , 0   , 1, 0   ,
       t[2], t[5], 0, t[8]];
  t = "matrix3d(" + t.join(", ") + ")";
  elt.style["-webkit-transform"] = t;
  elt.style["-moz-transform"] = t;
  elt.style["-o-transform"] = t;
  elt.style.transform = t;
}

var outlined = false;
function outline(){
  outlined = !outlined;
  if (outlined) {
    newimg.setOpacity(0.2);
    $('#imgdistort').css('border','2px solid black');
  } else {
    newimg.setOpacity(1);;
    $('#imgdistort').css('border', '');
  }
};

var opaque = false;
function changeopacity(){
  opaque = !opaque;
  if (opaque) {
    newimg.setOpacity(0.7);
  } else {
    newimg.setOpacity(1);
  }
};

// add corner control points
// needs refactoring for multiple images
function xyz(){       
  $( "#imgdistort" ).after( "<div id='marker0' class='corner'>TL</div>");
  $( "#marker0" ).after('<div id="marker2" class="corner">TR</div>');
  $( "#marker2" ).after('<div id="marker4" class="corner">BL</div>');
  $( "#marker4" ).after('<div id="marker6" class="corner">BR</div>');
  $('#imgdistort').wrapAll('<div id="box">');
  $('#box, .corner').wrapAll('<div id="imgcontainer">');
};

L.DistortableImage= L.ImageOverlay.extend({
  _initImage: function () {
    var imageid = "imgdistort";
    var img = this._image = L.DomUtil.create('img',
    'leaflet-image-layer ' +  'leaflet-zoom-animated');
    img.onselectstart = L.Util.falseFn;
    img.onmousemove = L.Util.falseFn;
    img.onload = L.bind(this.fire, this, 'load');
    img.src = this._url;
    img.alt = this.options.alt;
    img.id = "imgdistort";
  },
})

L.ImageMarker = L.Marker.extend({
  options: {
    pane: 'markerPane',
    icon: new L.Icon({iconUrl:'imagedistort/images/imarker.png'}),
    // title: '',
    // alt: '',
    clickable: true,
    draggable: true,
    keyboard: true,
    zIndexOffset: 0,
    opacity: 1,
    riseOnHover: true,
    riseOffset: 250
  }
});

