$L = {
  debug: false,
  images: [],
  pointer: {x:0,y:0},
  shifted: false,
  initialize: function(options) {

    this.options = options || {}
    this.options.hotkeys = this.options.hotkeys || true

    // disable some default Leaflet interactions
    // not really sure why this is necessary
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();

    if (this.options.hotkeys) {
      $(document).on('keyup keydown', function(e){$L.shifted = e.shiftKey} );
 
      $(document).keydown(function(e){
        if ($L.selected) {
          switch (e.which) {
            case 73: // i
              $L.selected.toggleIsolate()
              break;
            case 72: // h
              $L.selected.toggleVisibility()
              break;
            case 68: // d
              $L.selected.toggleMode.apply($L.selected)
              break;
            case 82: // r
              $L.selected.toggleMode.apply($L.selected)
              break;
            case 84: // t
              $L.selected.toggleTransparency()
              break;
            case 79: // o
              $L.selected.toggleOutline()
              break;
            case 76: // l
              if ($L.selected.locked) $L.selected.unlock()
              else $L.selected.lock()
              break;
          }
        }
      })
    }

    // this runs *as well as* image.click events, 
    // when you click an image
    map.on('click', function(e) {
      $.each($L.images,function(i,d) {
        d.deselect.apply(d)
      })
      $L.impose_order()
    })

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

  // impose the ordering of $L.images on the z-indices
  impose_order: function() {
    $.each($L.images,function(i,img) {
      img.bringToFront()
    })
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
