L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
		initialize: function(map, overlay, options) {
			this._overlay = overlay;
			this._map = map;

			LeafletToolbar.ToolbarAction.prototype.initialize.call(this, options);
		}
	}),
// make one for matcher too
// enabled only when matcher enabled
	Stitcher = EditOverlayAction.extend({
		options: {
			toolbarIcon: {
				html: '<span class="fa fa-puzzle-piece"><span>',
				tooltip: 'Enable stitcher'
			}
		},

		addHooks: function() {
			var map = this._map;
			var overlay = this._overlay;
			var center, corners;
			var sectors = {s00: [], s01: [], s10: [], s11: []};
			try {
				// var d01 = [image.getCorner(0).lat, center.y];
				// var d12 = [center.x, image.getCorner(1).lng];
				// var d23 = [image.getCorner(2).lat, center.y];
				// var d30 = [center.x, image.getCorner(3).lng];
				for(var i in processedPoints.points) {
					sectors.s00[i]=[];
					sectors.s01[i]=[];
					sectors.s10[i]=[];
					sectors.s11[i]=[];
					center = processedPoints.images[i].getCenter();
					corners = processedPoints.images[i].getCorners();
					for(var j in processedPoints.points[i]) {
						if(processedPoints.points[i][j].lng > corners[1].lng && processedPoints.points[i][j].lng < center.lng) {
							if(processedPoints.points[i][j].lat > corners[3].lat && processedPoints.points[i][j].lat < center.lat) {
								sectors.s10[i].push(processedPoints.points[i][j]);
							} else {
								sectors.s00[i].push(processedPoints.points[i][j]);								
							}
						} else {
							if(processedPoints.points[i][j].lat > corners[2].lat && processedPoints.points[i][j].lat < center.lat) {
								sectors.s11[i].push(processedPoints.points[i][j]);								
							} else {
								sectors.s01[i].push(processedPoints.points[i][j]);								
							}
						}
					}
				}
				console.log(sectors);
				// getCorners - no need to find ind. sector points
				// compare - find sectors (xxxx) in both with max density
				// translate and join if adj
			} catch(err) {
				console.error('err: matcher error! \n', err);
			}
			for(var k in corners) {
				map.project(corners[k]);
			}
			map.setView(overlay.getCorner(0), 12);
			this.disable();
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
			var editing = this._overlay.editing;
	
			editing._removeOverlay();
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

	ToggleRotateScale = EditOverlayAction.extend({
		initialize: function(map, overlay, options) {
			var icon = overlay.editing._mode === 'rotateScale' ? 'image' : 'rotate-left';

			options = options || {};
			options.toolbarIcon = {
				html: '<span class="fa fa-' + icon + '"></span>',
				tooltip: 'RotateScale',
				title: 'RotateScale'
			};

			EditOverlayAction.prototype.initialize.call(this, map, overlay, options);
		},

		addHooks: function() {
			var editing = this._overlay.editing;

			editing._toggleRotateScale();
			editing._showToolbar();
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

	ToggleOrder = EditOverlayAction.extend({
		options: {
			toolbarIcon: {
				html: '<span class="fa fa-sort"></span>',
				tooltip: 'Change order',
				title: 'Toggle order'
			}
		},

		addHooks: function ()
		{
			var editing = this._overlay.editing;

			editing._toggleOrder();
			this.disable();
		}
	}),

  EnableEXIF = EditOverlayAction.extend({
  options: {
    toolbarIcon: {
      html: '<span class="fa fa-compass"></span>',
      tooltip: "Enable EXIF",
      title: "Geocode Image"
    }
  },

  addHooks: function() {
    var image = this._overlay._image;
    EXIF.getData(image, L.EXIF(image));
  }
  });

L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
	options: {
		actions: [
			ToggleTransparency,
			RemoveOverlay,
			ToggleOutline,
			ToggleEditable,
			ToggleRotateScale,
			ToggleExport,
			EnableEXIF,
			ToggleOrder,
			Stitcher
		]
	},

	// todo: move to some sort of util class, these methods could be useful in future
	_rotateToolbarAngleDeg: function (angle) {
		var div = this._container,
			divStyle = div.style;

		var oldTransform = divStyle.transform;

		divStyle.transform = oldTransform + "rotate(" + angle + "deg)";
		divStyle.transformOrigin = "1080% 650%";

		this._rotateToolbarIcons(angle);
	},

	_rotateToolbarIcons: function (angle) {
		var icons = document.querySelectorAll(".fa");

		for (var i = 0; i < icons.length; i++) {
			icons.item(i).style.transform = "rotate(" + -angle + "deg)";
		}
	},

});
