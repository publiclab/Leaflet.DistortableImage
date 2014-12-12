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

L.ImageMarker = L.Marker.extend({
  // icons generated from FontAwesome at: http://fa2png.io/
  icons: { grey: 'circle-o_444444_16.png',
            red: 'circle-o_cc4444_16.png',
         locked: 'close_444444_16.png'
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
    this.setIcon(new L.Icon({iconUrl:$L.options.img_dir+this.icons[name],iconSize:[16,16],iconAnchor:[8,8]}))
  }
  
});

L.DistortableImageOverlay = L.ImageOverlay.extend({
  options: {
    height: 200
  },

	initialize: function(url, options) {
		this._url = url;

		L.setOptions(this, options);
	},

	_initImage: function () {
		L.ImageOverlay.prototype._initImage.call(this);

		// TODO: Get rid of jquery.
		this._id = 'image-distort-'+$('.image-distort').length;

		L.extend(this._image, {
			alt: this.options.alt,
			id: this._id
		});

		L.DomEvent.on(this._image, 'load', this._onLoad, this);
 	},

	_onLoad: function() {
    if (this.options.corners) {
      this._corners = this.options.corners;
    }
	},

  onAdd: function(map) {
    var aspectRatio = this._image.width / this._image.height,

        mapHeight = L.DomUtil.getStyle(map._container, 'height'),
        mapWidth = L.Domutil.getStyle(map._container, 'width'),

        imageHeight = this.options.height,
        imageWidth = aspectRatio*height,

        center = map.latLngToContainerPoint(map.getCenter()),
        offset = new L.Point(mapWidth - width, mapHeight - height).divideBy(2);

    if (this.options.corners) { this._corners = this.options.corners }
    else {
      this._corners = [
        map.containerPointToLatLng(center.subtract(offset)),
        map.containerPointToLatLng(center.add(new L.Point(offset.x, - offset.y))),
        map.containerPointToLatLng(center.add(offset)),
        map.containerPointToLatLng(center.add(new L.Point(- offset.x, offset.y)))
      ];
    }

    this._map = map;

  },

	// recalc corners (x,y) from markers (lat,lng)
	_updateCorner: function(index, newCorner) {
		this._corners[index] = newCorner;
		this.distort();
	},

	// use CSS to transform the image
	distort: function() {
		var map = this._map,
			image = this._image,
			w = image.offsetWidth, 
			h = image.offsetHeight,
			c = [],
			transformString,
			t, i, j, l;

		/* Convert corners to container points (i.e. cartesian coordinates). */
		for (j = 0; j < this._corners.length; j++) {
			c.push(map.latLngToContainerPoint(this._corners[j]));
		}

		t = L.Util.Matrix.general2DProjection(
			0, 0, c[0].x, c[0].y,
			w, 0, c[1].x, c[1].y,
			0, h, c[2].x, c[2].y,
			w, h, c[3].x, c[3].y
		);

		/* Normalize the matrix. */
		for(i = 0, l = t.length; t < l; i++) { 
			t[i] = t[i]/t[8];
		}

		t = [
				t[0], t[3], 0, t[6],
				t[1], t[4], 0, t[7],
				   0,    0, 1,    0,
				t[2], t[5], 0, t[8]
			];

		transformString = "matrix3d(" + t.join(", ") + ")";

		image.style["-webkit-transform"] = transformString;
		image.style["-moz-transform"] = transformString;
		image.style["-o-transform"] = transformString;
		image.style.transform = transformString;

		image.style['transform-origin'] = "0 0 0";
		image.style["-webkit-transform-origin"] = "0 0 0";
	},

  toggleOutline: function() {
    this.outlined = !this.outlined;
    if (this.outlined) {
      $('#'+this._image.id).css('border','1px solid red');
    } else {
      $('#'+this._image.id).css('border', 'none');
    }
  },

	// cheaply get center by averaging the corners
	// TODO: Replace by simple centroid calculation.
	//     * See http://stackoverflow.com/questions/6149175/logical-question-given-corners-find-center-of-quadrilateral
	// getCenter: function() {
	// 	var x = 0, y = 0,
	// 		i, l;

	// 	for (i = 0; l = this._corners.length; i < l; i++) {
	// 		var pos = map.latLngToLayerPoint(this._corners[i]);
	// 		x += pos.x;
	// 		y += pos.y;
	// 	}
	// 	x /= 4;
	// 	y /= 4;
	// 	return [x,y];
	// },
});
