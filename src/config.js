/* jshint ignore:start */
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

  pdbg: function(m, v) {
    var r = $L.multmv(m, v);
    return r + " (" + r[0]/r[2] + ", " + r[1]/r[2] + ")";
  }
}
/* jshint ignore:end */
