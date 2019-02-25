L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
		initialize: function(map, overlay, options) {
			this._overlay = overlay;
			this._map = map;

			LeafletToolbar.ToolbarAction.prototype.initialize.call(this, options);
		}
	}),

	ToggleTransparency = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-adjust"></span>',
			tooltip: 'Toggle Image Transparency',
			title: 'Toggle Image Transparency'
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleTransparency();
			this.disable();
		}
	}),

	ToggleOutline = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-square-o"></span>',
			tooltip: 'Toggle Image Outline',
			title: 'Toggle Image Outline'
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleOutline();
			this.disable();
		}
	}),

	RemoveOverlay = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-trash"></span>',
			tooltip: 'Delete image',
			title: 'Delete image'
		}},

		addHooks: function() {
			var map = this._map;

			map.removeLayer(this._overlay);
			this._overlay.fire('delete');
			this.disable();
		}
	}),

	ToggleEditable = EditOverlayAction.extend({
		options: { toolbarIcon: {
			html: '<span class="fa fa-lock"></span>',
			tooltip: 'Lock / Unlock editing',
			title: 'Lock / Unlock editing'
		}},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleLock();
			this.disable();
		}
	}),

	ToggleRotateDistort = EditOverlayAction.extend({
		initialize: function(map, overlay, options) {
			var icon = overlay.editing._mode === 'rotate' ? 'image' : 'rotate-left';

			options = options || {};
			options.toolbarIcon = {
				html: '<span class="fa fa-' + icon + '"></span>',
				tooltip: 'Rotate',
				title: 'Rotate'
			};

			EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
		},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleRotateDistort();
			this.disable();
		}
	}),


	ToggleExport = EditOverlayAction.extend({
		options: {
			toolbarIcon: {
				html: '<span class="fa fa-download"></span>',
				tooltip: 'Export Image',
				title: 'Export Image'
			}
		},

		addHooks: function ()
		{
			var editing = this._overlay.editing;

			editing._toggleExport();
			this.disable();
		}
	}),

	EnableEXIF = EditOverlayAction.extend({
		options: {
			toolbarIcon: {
				html: '<span class="fa fa-compass"></span>',
				tooltip: 'Enable EXIF',
				title: 'Geocode Image'
			}
		},

		addHooks: function ()
		{
			console.log(this._overlay._image);
			var img = this._overlay._image;

			EXIF.getData(img, function() {
      var GPS = EXIF.getAllTags(img), altitude;

      console.log(GPS);

      /* If the lat/lng is available. */
      if (typeof GPS.GPSLatitude !== 'undefined' && typeof GPS.GPSLongitude !== 'undefined'){

        // sadly, encoded in [degrees,minutes,seconds]
        // primitive value = GPS.GPSLatitude[x].numerator
        var lat = (GPS.GPSLatitude[0]) +
                  (GPS.GPSLatitude[1]/60) +
                  (GPS.GPSLatitude[2]/3600);
        var lng = (GPS.GPSLongitude[0]) +
                  (GPS.GPSLongitude[1]/60) +
                  (GPS.GPSLongitude[2]/3600);

        if (GPS.GPSLatitudeRef !== "N")  {lat = lat*-1;}
        if (GPS.GPSLongitudeRef === "W") {lng = lng*-1;}
      }

      // Attempt to use GPS compass heading; will require
      // some trig to calc corner points, which you can find below:

      var angle = 0;
      // "T" refers to "True north", so -90.
      if (GPS.GPSImgDirectionRef === "T")
      {
        angle = (Math.PI / 180) * (GPS.GPSImgDirection.numerator/GPS.GPSImgDirection.denominator - 90);
      }
      // "M" refers to "Magnetic north"
      else if (GPS.GPSImgDirectionRef === "M")
      {
        angle = (Math.PI / 180) * (GPS.GPSImgDirection.numerator/GPS.GPSImgDirection.denominator - 90);
      }
      else
      {
        console.log("No compass data found");
      }

      console.log("Orientation:",GPS.Orientation);

      /* If there is orientation data -- i.e. landscape/portrait etc */
      if (GPS.Orientation === 6) { //CCW
        angle += (Math.PI / 180) * -90;
      } else if (GPS.Orientation === 8) { //CW
        angle += (Math.PI / 180) * 90;
      } else if (GPS.Orientation === 3) { //180
        angle += (Math.PI / 180) * 180;
      }

      /* If there is altitude data */
      if (typeof GPS.GPSAltitude !== 'undefined' && typeof GPS.GPSAltitudeRef  !== 'undefined'){
        // Attempt to use GPS altitude:
        // (may eventually need to find EXIF field of view for correction)
        if (typeof GPS.GPSAltitude !== 'undefined' &&
            typeof GPS.GPSAltitudeRef !== 'undefined') {
          altitude = (GPS.GPSAltitude.numerator /GPS.GPSAltitude.denominator + GPS.GPSAltitudeRef);
        } else {
          altitude = 0; // none
        }
      }

      /* only execute callback if lat (and by
       * implication lng) exists */
      // if (lat) fn(lat,lng,id,angle,altitude);
      // console.log(lat,lng,angle,altitude);
    });
		}
	});

L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
	options: {
		actions: [
			ToggleTransparency,
			RemoveOverlay,
			ToggleOutline,
			ToggleEditable,
			ToggleRotateDistort,
			ToggleExport,
			EnableEXIF
		]
	}
});
