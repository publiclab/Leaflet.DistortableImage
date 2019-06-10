L.DistortableImage = L.DistortableImage || {};

var EditOverlayAction = LeafletToolbar.ToolbarAction.extend({
		initialize: function(map, overlay, options) {
			this._overlay = overlay;
			this._map = map;

			LeafletToolbar.ToolbarAction.prototype.initialize.call(this, options);
		}
	}),
// make one for matcher too
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
			var sectors = {s00: [], s01: [], s10: [], s11: [], population: []};
			try {
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
				for(i in processedPoints.points) {
					sectors.population[i] = [];
					sectors.population[i].push([
						sectors.s00[i].length,
						sectors.s01[i].length,
						sectors.s10[i].length,
						sectors.s11[i].length
					]);
				}
				var max = 0, min = 10, max_ = 0, max_idx;
				for(i in sectors.population[0][0]) {
					if(sectors.population[0][0][i]>max) {max=sectors.population[0][0][i]; max_idx=i;}
					if(sectors.population[0][0][i]<min) {min=sectors.population[0][0][i];}
				}
				if(max !== min) {
					var coordinates = sectors[Object.keys(sectors)[max_idx]][0];
					for(var u in processedPoints.points[0]) {
						for(var v in coordinates) {
							if(processedPoints.points[0][u] === coordinates[v]) {
								if(processedPoints.confidences[0][u]>max_) {
									max_ = processedPoints.confidences[0][u];
								}
							}
						}
					}
					var best_point = processedPoints.points[0][processedPoints.confidences[0].indexOf(max_)];	//	alternate overlay
					var corresponding_best_point = processedPoints.points[1][processedPoints.confidences[0].indexOf(max_)];
			    document.querySelector("#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-marker-pane").innerHTML = "";
					var lat_offset = - best_point.lat + corresponding_best_point.lat;
					var lng_offset = - best_point.lng + corresponding_best_point.lng;
					overlay._corners[0] = [processedPoints.images[1].getCorner(0).lat - lat_offset, processedPoints.images[1].getCorner(0).lng - lng_offset];
					overlay._corners[1] = [processedPoints.images[1].getCorner(1).lat - lat_offset, processedPoints.images[1].getCorner(1).lng - lng_offset];
					overlay._corners[2] = [processedPoints.images[1].getCorner(2).lat - lat_offset, processedPoints.images[1].getCorner(2).lng - lng_offset];
					overlay._corners[3] = [processedPoints.images[1].getCorner(3).lat - lat_offset, processedPoints.images[1].getCorner(3).lng - lng_offset];
					
				}
			} catch(err) {
				console.error('err: check if matcher is initialized properly and correct parameters are supplied \n', err);
			}
			for(var k in corners) {
				map.project(corners[k]);
			}
			map.setView(overlay.getCorner(2), 13);
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
