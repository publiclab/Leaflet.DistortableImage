L.DomUtil = L.extend(L.DomUtil, {
	getMatrixString: function(m) {
		var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,

			/* 
		     * Since matrix3d takes a 4*4 matrix, we add in an empty row and column, which act as the identity on the z-axis.
		     * See:
		     *     http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
		     *     https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#M.C3.B6bius'_homogeneous_coordinates_in_projective_geometry
		     */
			matrix = [
				m[0], m[3], 0, m[6],
				m[1], m[4], 0, m[7],
				   0,    0, 1,    0,
				m[2], m[5], 0, m[8]
			],

			str = is3d ? 'matrix3d(' + matrix.join(',') + ')' : '';

		if (!is3d) {
			console.log('Your browser must support 3D CSS transforms in order to use DistortableImageOverlay.');
		}

		return str;
	},

	getRotateString: function(angle, units) {
		var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,
			open = 'rotate' + (is3d ? '3d' : '') + '(',
			rotateString = (is3d ? '0, 0, 1, ' : '') + angle + units;
			
		return open + rotateString + ')';
	},

	toggleClass: function(el, className) {
		var c = className;
		return this.hasClass(el, c) ? this.removeClass(el, c) : this.addClass(el, c);
	},

	confirmDelete: function () {
		return window.confirm("Are you sure? This image will be permanently deleted from the map.");
	},

	confirmDeletes: function (n) {
		var humanized = n === 1 ? "image" : "images";

		return window.confirm("Are you sure? " + n + " " + humanized + " will be permanently deleted from the map.");
	},



});

L.ImageUtil = {

  getCmPerPixel: function(overlay) {
    var map = overlay._map;

    var dist = map
      .latLngToLayerPoint(overlay.getCorner(0))
      .distanceTo(map.latLngToLayerPoint(overlay.getCorner(1)));

    return (dist * 100) / overlay.getElement().width;
  }
};

L.Map.include({
	_newLayerPointToLatLng: function(point, newZoom, newCenter) {
		var topLeft = L.Map.prototype._getNewTopLeftPoint.call(this, newCenter, newZoom)
				.add(L.Map.prototype._getMapPanePos.call(this));
		return this.unproject(point.add(topLeft), newZoom);
	}
});
L.MatrixUtil = {

	// Compute the adjugate of m
	adj: function(m) { 
		return [
			m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
			m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
			m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
		];
	},

	// multiply two 3*3 matrices
	multmm: function(a, b) { 
		var c = [],
			i;

		for (i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				var cij = 0;
				for (var k = 0; k < 3; k++) {
					cij += a[3*i + k]*b[3*k + j];
				}
				c[3*i + j] = cij;
			}
		}
		return c;
	},

	// multiply a 3*3 matrix and a 3-vector
	multmv: function(m, v) { 
		return [
			m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
			m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
			m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
		];
	},

	// multiply a scalar and a 3*3 matrix
	multsm: function(s, m) {
		var matrix = [];

		for (var i = 0, l = m.length; i < l; i++) {
			matrix.push(s*m[i]);
		}

		return matrix;
	},

	basisToPoints: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		var m = [
				x1, x2, x3,
				y1, y2, y3,
				1,  1,  1
			],
			v = L.MatrixUtil.multmv(L.MatrixUtil.adj(m), [x4, y4, 1]);

		return L.MatrixUtil.multmm(m, [
			v[0], 0, 0,
			0, v[1], 0,
			0, 0, v[2]
		]);
	},


	project: function(m, x, y) {
		var v = L.MatrixUtil.multmv(m, [x, y, 1]);
		return [v[0]/v[2], v[1]/v[2]];
	},

	general2DProjection: function(
	x1s, y1s, x1d, y1d,
	x2s, y2s, x2d, y2d,
	x3s, y3s, x3d, y3d,
	x4s, y4s, x4d, y4d
	) {
		var s = L.MatrixUtil.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s),
			d = L.MatrixUtil.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d),
			m = L.MatrixUtil.multmm(d, L.MatrixUtil.adj(s));

		/* 
		 *	Normalize to the unique matrix with m[8] == 1. 
		 * 	See: http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
		 */
		return L.MatrixUtil.multsm(1/m[8], m);
	}
};
L.TrigUtil = {

  calcAngleDegrees: function(x, y) {
    var pointAngle = Math.atan2(y, x);
    return this.radiansToDegrees(pointAngle);
  },

  radiansToDegrees: function(angle) {
    return angle * 180 / Math.PI;
  },

  degreesToRadians: function(angle) {
    return angle * Math.PI / 180;
  }

};
L.DistortableImageOverlay = L.ImageOverlay.extend({

  options: {
    alt: "",
    height: 200,
		crossOrigin: true,
		// todo: find ideal number to prevent distortions during RotateScale, and make it dynamic (remove hardcoding)
    edgeMinWidth: 520
  },

  initialize: function(url, options) {
    // this._toolArray = L.DistortableImage.EditToolbarDefaults;
    this.edgeMinWidth = this.options.edgeMinWidth;
    this._url = url;
    this.rotation = 0;
    // window.rotation = this.rotation;
    L.DistortableImage._options = options;

    L.setOptions(this, options);
  },

  onAdd: function(map) {
    /* Copied from L.ImageOverlay */
    this._map = map;

    if (!this._image) { this._initImage(); }
    if (!this._events) { this._initEvents(); }

    map._panes.overlayPane.appendChild(this._image);

    map.on("viewreset", this._reset, this);
    /* End copied from L.ImageOverlay */

    /* Use provided corners if available */
    if (this.options.corners) {
      this._corners = this.options.corners;
      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on("zoomanim", this._animateZoom, this);
      }

      /* This reset happens before image load; it allows
       * us to place the image on the map earlier with
       * "guessed" dimensions. */
      this._reset();
    }

    /* Have to wait for the image to load because
     * we need to access its width and height. */
    L.DomEvent.on(this._image, "load", function() {
      this._initImageDimensions();
      this._reset();
      /* Initialize default corners if not already set */
      if (!this._corners) {
        if (map.options.zoomAnimation && L.Browser.any3d) {
          map.on("zoomanim", this._animateZoom, this);
        }
      }
    }, this);

    this.fire("add");
  },

  onRemove: function(map) {
    this.fire("remove");

    L.ImageOverlay.prototype.onRemove.call(this, map);
  },

  _initImage: function() {
    L.ImageOverlay.prototype._initImage.call(this);

    L.extend(this._image, {
      alt: this.options.alt
    });
  },

  /** this is never used but leaving here for now */

  // _addTool: function(tool) {
  //   this._toolArray.push(tool);
  //   L.DistortableImage.EditToolbar = LeafletToolbar.Popup.extend({
  //     options: {
  //       actions: this._toolArray
  //     }
  //   });
  // },

  _initImageDimensions: function() {
    var map = this._map,
      originalImageWidth = L.DomUtil.getStyle(this._image, "width"),
      originalImageHeight = L.DomUtil.getStyle(this._image, "height"),
      aspectRatio =
        parseInt(originalImageWidth) / parseInt(originalImageHeight),
      imageHeight = this.options.height,
      imageWidth = parseInt(aspectRatio * imageHeight),
      center = map.latLngToContainerPoint(map.getCenter()),
      offset = L.point(imageWidth, imageHeight).divideBy(2);

    if (this.options.corners) {
      this._corners = this.options.corners;
    } else {
      this._corners = [
        map.containerPointToLatLng(center.subtract(offset)),
        map.containerPointToLatLng(
          center.add(L.point(offset.x, -offset.y))
        ),
        map.containerPointToLatLng(
          center.add(L.point(-offset.x, offset.y))
        ),
        map.containerPointToLatLng(center.add(offset))
      ];
    }
    this._initialDimensions = { 'height': imageHeight, 'width': imageWidth, 'offset': offset };
  },

  _initEvents: function() {
    this._events = ["click"];

    for (var i = 0, l = this._events.length; i < l; i++) {
      L.DomEvent.on(this._image, this._events[i], this._fireMouseEvent, this);
    }
  },

  /* See src/layer/vector/Path.SVG.js in the Leaflet source. */
  _fireMouseEvent: function(event) {
    if (!this.hasEventListeners(event.type)) { return; }

    var map = this._map,
      containerPoint = map.mouseEventToContainerPoint(event),
      layerPoint = map.containerPointToLayerPoint(containerPoint),
      latlng = map.layerPointToLatLng(layerPoint);

    this.fire(event.type, {
      latlng: latlng,
      layerPoint: layerPoint,
      containerPoint: containerPoint,
      originalEvent: event
    });
  },

  setCorner: function(corner, latlng) {
    this._corners[corner] = latlng;
    this._reset();
  },

  // fires a reset after all corner positions are updated instead of after each one (above). Use for translating
  setCorners: function(latlngObj) {
    var i = 0;
    for (var k in latlngObj) {
      this._corners[i] = latlngObj[k];
      i += 1;
    }

    this._reset();
  },

  _setCornersFromPoints: function(pointsObj) {
    var map = this._map;
    var i = 0;
    for (var k in pointsObj) {
      this._corners[i] = map.layerPointToLatLng(pointsObj[k]);
      i += 1;
    }

    this._reset();
  },

  /* Copied from Leaflet v0.7 https://github.com/Leaflet/Leaflet/blob/66282f14bcb180ec87d9818d9f3c9f75afd01b30/src/dom/DomUtil.js#L189-L199 */
  /* since L.DomUtil.getTranslateString() is deprecated in Leaflet v1.0 */
  _getTranslateString: function(point) {
    // on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
    // makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
    // (same speed either way), Opera 12 doesn't support translate3d

    var is3d = L.Browser.webkit3d,
      open = "translate" + (is3d ? "3d" : "") + "(",
      close = (is3d ? ",0" : "") + ")";

    return open + point.x + "px," + point.y + "px" + close;
  },

  _reset: function() {
    var map = this._map,
      image = this._image,
      latLngToLayerPoint = L.bind(map.latLngToLayerPoint, map),
      transformMatrix = this._calculateProjectiveTransform(latLngToLayerPoint),
      topLeft = latLngToLayerPoint(this._corners[0]),
      warp = L.DomUtil.getMatrixString(transformMatrix),
      translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(" ");

    /* Set origin to the upper-left corner rather than the center of the image, which is the default. */
    image.style[L.DomUtil.TRANSFORM + "-origin"] = "0 0 0";
  },

  /*
   * Calculates the transform string that will be correct *at the end* of zooming.
   * Leaflet then generates a CSS3 animation between the current transform and
   *		 future transform which makes the transition appear smooth.
   */
  _animateZoom: function(event) {
    var map = this._map,
      image = this._image,
      latLngToNewLayerPoint = function(latlng) {
        return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
      },
      transformMatrix = this._calculateProjectiveTransform(
        latLngToNewLayerPoint
      ),
      topLeft = latLngToNewLayerPoint(this.getCorner(0)),
      warp = L.DomUtil.getMatrixString(transformMatrix),
      translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    if (!L.Browser.gecko) {
      image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(" ");
    }
  },

  getCorners: function() {
    return this._corners;
  },

  getCorner: function(i) {
    return this._corners[i];
  },

  /*
   * Calculates the centroid of the image.
   *		 See http://stackoverflow.com/questions/6149175/logical-question-given-corners-find-center-of-quadrilateral
   */
  getCenter: function(ll2c, c2ll) {
    var map = this._map,
      latLngToCartesian = ll2c ? ll2c : map.latLngToLayerPoint,
      cartesianToLatLng = c2ll ? c2ll : map.layerPointToLatLng,
      nw = latLngToCartesian.call(map, this.getCorner(0)),
      ne = latLngToCartesian.call(map, this.getCorner(1)),
      se = latLngToCartesian.call(map, this.getCorner(2)),
      sw = latLngToCartesian.call(map, this.getCorner(3)),
      nmid = nw.add(ne.subtract(nw).divideBy(2)),
      smid = sw.add(se.subtract(sw).divideBy(2));

    return cartesianToLatLng.call(
      map,
      nmid.add(smid.subtract(nmid).divideBy(2))
    );
  },

  // Use for translation calculations - for translation the delta for 1 corner applies to all 4
  _calcCornerPointDelta: function() {
    return this._dragStartPoints[0].subtract(this._dragPoints[0]);
  },

  _calcCenterTwoCornerPoints: function(topLeft, topRight) {
    var toolPoint = { x: "", y: "" };

    toolPoint.x = topRight.x + (topLeft.x - topRight.x) / 2;
    toolPoint.y = topRight.y + (topLeft.y - topRight.y) / 2;

    return toolPoint;
  },

  _calculateProjectiveTransform: function(latLngToCartesian) {
    /* Setting reasonable but made-up image defaults
     * allow us to place images on the map before
     * they've finished downloading. */
    var offset = latLngToCartesian(this._corners[0]),
      w = this._image.offsetWidth || 500,
      h = this._image.offsetHeight || 375,
      c = [],
      j;
    /* Convert corners to container points (i.e. cartesian coordinates). */
    for (j = 0; j < this._corners.length; j++) {
      c.push(latLngToCartesian(this._corners[j])._subtract(offset));
    }

    /*
     * This matrix describes the action of the CSS transform on each corner of the image.
     * It maps from the coordinate system centered at the upper left corner of the image
     *		 to the region bounded by the latlngs in this._corners.
     * For example:
     *		 0, 0, c[0].x, c[0].y
     *		 says that the upper-left corner of the image maps to the first latlng in this._corners.
     */
    return L.MatrixUtil.general2DProjection(
      0, 0, c[0].x, c[0].y,
      w, 0, c[1].x, c[1].y,
      0, h, c[2].x, c[2].y,
      w, h, c[3].x, c[3].y
    );
  }

});

L.distortableImageOverlay = function(id, options) {
	return new L.DistortableImageOverlay(id, options);
};




L.DistortableCollection = L.FeatureGroup.extend({

  initialize: function(options) {
    L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, options);
  },

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    this.on("layeradd", this._turnOnEditing, this);
    this.on("layerremove", this._turnOffEditing, this);

    L.DomEvent.on(document, "keydown", this._onKeyDown, this);

    L.DomEvent.on(map, { 
      click: this._deselectAll, 
      boxzoomend: this._addSelections 
    }, this);

    this._lastInitialSelected();
  },

  onRemove: function() {
    var map = this._map;

    this.off("layeradd", this._turnOnEditing, this);
    this.off("layerremove", this._turnOffEditing, this);

    L.DomEvent.off(document, "keydown", this._onKeyDown, this);

    L.DomEvent.off(map, {
      click: this._deselectAll,
      boxzoomend: this._addSelections
    }, this);
  },

  _turnOnEditing: function(e) {
    var layer = e.layer; 
    
    layer.editing.enable();
    L.DomEvent.on(layer._image, "mousedown", this._deselectOthers, this);
    L.DomEvent.on(layer, {
      dragstart: this._dragStartMultiple, 
      drag: this._dragMultiple
    }, this);
 
  },

  _turnOffEditing: function(e) {
    var layer = e.layer; 

    layer.editing.disable();
    L.DomEvent.off(layer._image, "mousedown", this._deselectOthers, this);
    L.DomEvent.off(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple
    }, this);
  },

  _addToolbar: function() {
    try {
      if (!this.toolbar) {
        this.toolbar = L.distortableImage.controlBar({
          actions: this.editActions,
          position: "topleft"
        }).addTo(this._map, this);
        this.fire("toolbar:created");
      }
    } catch (e) { }
  },

  _removeToolbar: function() {
    var map = this._map;

    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    } else {
      return false;
    }
  },

  hasTool: function(value) {
    return this.editActions.some(function(action) {
      return action === value;
    });
  },

  addTool: function(value) {
    if (value.baseClass === "leaflet-toolbar-icon" && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
    } else {
      return false; 
    }
  },

  removeTool: function(value) {
    this.editActions.some(function (item, idx) {
      if (this.editActions[idx] === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    }, this);
  },

  _lastInitialSelected: function() {
    var layerArr = this.getLayers();

    var initialSelected = layerArr.filter(function(layer) {
      return layer.options.selected;
    });
    
    if (initialSelected.length !== 0) {
      this.eachLayer(function(layer) {
        if (!initialSelected[-1]) {
          layer._deselect();
        }
      });
    }
  },

  isSelected: function (overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), "selected");
  },

  anySelected: function() {
    var layerArr = this.getLayers();

    return layerArr.some(this.isSelected.bind(this));
  },

  _toggleMultiSelect: function(event, edit) {
    if (edit._mode === "lock") { return; }

    if (event.metaKey || event.ctrlKey) {
      L.DomUtil.toggleClass(event.target, "selected");
    }

    if (this.anySelected()) {
      edit._deselect();
    } else {
      this._removeToolbar();
    }
  },

  _deselectOthers: function(event) {
    this.eachLayer(function(layer) {

      var edit = layer.editing;
      if (layer.getElement() !== event.target) {
        edit._deselect();
      } else {
        this._toggleMultiSelect(event, edit);
      }
    }, this);

    L.DomEvent.stopPropagation(event);
  },

  _addSelections: function(e) {
    var box = e.boxZoomBounds,
      i = 0;

    this.eachLayer(function(layer) {
      var edit = layer.editing;

      for (i = 0; i < 4; i++) {
        if (box.contains(layer.getCorner(i)) && edit._mode !== "lock") {
          edit._deselect();
          L.DomUtil.addClass(layer.getElement(), "selected");
          if (!this.toolbar) { this._addToolbar(); }
          break;
        }
      }
    }, this);
  },

  _onKeyDown: function(e) {
    if (e.key === "Escape") {
      this._deselectAll(e);
    }
    if (e.key === "Backspace") {
      this._removeFromGroup(e);
    }
  },

  _dragStartMultiple: function(event) {
    var overlay = event.target,
      i;

    if (!this.isSelected(overlay)) { return; }

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      edit._deselect();

      for (i = 0; i < 4; i++) {
        layer._dragStartPoints[i] = layer._map.latLngToLayerPoint(
          layer.getCorner(i)
        );
      }
    });
  },

  _dragMultiple: function(event) {
    var overlay = event.target,
      map = this._map,
      i;

    if (!this.isSelected(overlay)) { return; }

    overlay._dragPoints = {};

    for (i = 0; i < 4; i++) {
      overlay._dragPoints[i] = map.latLngToLayerPoint(overlay.getCorner(i));
    }

    var cpd = overlay._calcCornerPointDelta();

    this._updateCollectionFromPoints(cpd, overlay);
  },

  _deselectAll: function(event) {
    this.eachLayer(function(layer) {
      var edit = layer.editing;
      L.DomUtil.removeClass(layer.getElement(), "selected");
      edit._deselect();
    });

    this._removeToolbar();

    L.DomEvent.stopPropagation(event);
  },

  _removeFromGroup: function(event) {
    var layersToRemove = this._toRemove(),
      n = layersToRemove.length;

    if (n === 0) { return; }
    var choice = L.DomUtil.confirmDeletes(n);

    if (choice) {
      layersToRemove.forEach(function(layer) {
        this.removeLayer(layer);
      }, this);

      this._removeToolbar();
    }

    if (event) { L.DomEvent.stopPropagation(event); }
  },

  _toRemove: function() {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var edit = layer.editing;
      return (this.isSelected(layer) && edit._mode !== "lock");
    }, this);
  },

  _calcCollectionFromPoints: function(cpd, overlay) {
    var layersToMove = [],
      p = new L.Transformation(1, -cpd.x, 1, -cpd.y);

    this.eachLayer(function(layer) {
      if (
        layer !== overlay &&
        layer.editing._mode !== "lock" &&
        this.isSelected(layer)
      ) {
        layer._cpd = {};

        layer._cpd.val0 = p.transform(layer._dragStartPoints[0]);
        layer._cpd.val1 = p.transform(layer._dragStartPoints[1]);
        layer._cpd.val2 = p.transform(layer._dragStartPoints[2]);
        layer._cpd.val3 = p.transform(layer._dragStartPoints[3]);

        layersToMove.push(layer);
      }
    }, this);

    return layersToMove;
  },

  /**
   * cpd === cornerPointDelta
   */
  _updateCollectionFromPoints: function(cpd, overlay) {
    var layersToMove = this._calcCollectionFromPoints(cpd, overlay);

    layersToMove.forEach(function(layer) {
      layer._setCornersFromPoints(layer._cpd);
      layer.fire("update");
    }, this);
  },

  _getAvgCmPerPixel: function(imgs) {
    var reduce = imgs.reduce(function(sum, img) {
      return sum + img.cm_per_pixel;
    }, 0);
    return reduce / imgs.length;
  },

  generateExportJson: function() {
    var json = {};
    json.images = [];

    this.eachLayer(function(layer) {
      if (this.isSelected(layer)) {
        var sections = layer._image.src.split('/');
        var filename = sections[sections.length-1];
        json.images.push({
          id: this.getLayerId(layer),
          src: layer._image.src,
          width: layer._image.width,
          height: layer._image.height,
          image_file_name: filename,
          nodes: layer.getCorners(),
          cm_per_pixel: L.ImageUtil.getCmPerPixel(layer)
        });
      }
    }, this);

    json.avg_cm_per_pixel = this._getAvgCmPerPixel(json.images);

    return json;
  },

  startExport: function(opts) {
    opts = opts || {};
    opts.collection = opts.collection || this.generateExportJson();
    opts.frequency = opts.frequency || 3000;
    opts.scale = opts.scale || 100; // switch it to _getAvgCmPerPixel !
    var statusUrl, updateInterval;

    // this may be overridden to update the UI to show export progress or completion
    function _defaultUpdater(data) {
      // optimization: fetch status directly from google storage:
      if (data.hasOwnProperty('status_url') && statusUrl !== data.status_url && data.status_url.match('.json')) statusUrl = data.status_url;
      if (data.status === "complete") {
        clearInterval(updateInterval);
        alert("Export complete. " + data.jpg);
      }
      // TODO: update to clearInterval when status == "failed" if we update that in this file:
      // https://github.com/publiclab/mapknitter-exporter/blob/main/lib/mapknitterExporter.rb
      console.log(data);
    }

    // receives the URL of status.json, and starts running the updater to repeatedly fetch from status.json; 
    // this may be overridden to integrate with any UI
    function _defaultHandleStatusUrl(data) {
      console.log(data);
      statusUrl = "//export.mapknitter.org" + data;
      opts.updater = opts.updater || _defaultUpdater;

      // repeatedly fetch the status.json
      updateInterval = setInterval(function intervalUpdater() {
        $.ajax(statusUrl, {
          type: "GET",
          crossDomain: true
        }).done(function(data) {
            opts.updater(data);
        });
      }, opts.frequency);
    }

    function _fetchStatusUrl(collection, scale) {
      opts.handleStatusUrl = opts.handleStatusUrl || _defaultHandleStatusUrl;

      $.ajax({
        url: "//export.mapknitter.org/export",
        crossDomain: true,
        type: "POST",
        data: {
          collection: JSON.stringify(collection.images),
          scale: scale
        },
        success: opts.handleStatusUrl // this handles the initial response
      });
    }

    _fetchStatusUrl(opts.collection, opts.scale);

  }
});

L.distortableCollection = function(id, options) {
  return new L.DistortableCollection(id, options);
};

L.EXIF = function getEXIFdata(img) {
  if (Object.keys(EXIF.getAllTags(img)).length !== 0) {
    console.log(EXIF.getAllTags(img));
    var GPS = EXIF.getAllTags(img),
      altitude;

    /* If the lat/lng is available. */
    if (
      typeof GPS.GPSLatitude !== "undefined" &&
      typeof GPS.GPSLongitude !== "undefined"
    ) {
      // sadly, encoded in [degrees,minutes,seconds]
      // primitive value = GPS.GPSLatitude[x].numerator
      var lat =
        GPS.GPSLatitude[0] +
        GPS.GPSLatitude[1] / 60 +
        GPS.GPSLatitude[2] / 3600;
      var lng =
        GPS.GPSLongitude[0] +
        GPS.GPSLongitude[1] / 60 +
        GPS.GPSLongitude[2] / 3600;

      if (GPS.GPSLatitudeRef !== "N") {
        lat = lat * -1;
      }
      if (GPS.GPSLongitudeRef === "W") {
        lng = lng * -1;
      }
    }

    // Attempt to use GPS compass heading; will require
    // some trig to calc corner points, which you can find below:

    var angle = 0;
    // "T" refers to "True north", so -90.
    if (GPS.GPSImgDirectionRef === "T") {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    }
    // "M" refers to "Magnetic north"
    else if (GPS.GPSImgDirectionRef === "M") {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    } else {
      console.log("No compass data found");
    }

    console.log("Orientation:", GPS.Orientation);

    /* If there is orientation data -- i.e. landscape/portrait etc */
    if (GPS.Orientation === 6) {
      //CCW
      angle += (Math.PI / 180) * -90;
    } else if (GPS.Orientation === 8) {
      //CW
      angle += (Math.PI / 180) * 90;
    } else if (GPS.Orientation === 3) {
      //180
      angle += (Math.PI / 180) * 180;
    }

    /* If there is altitude data */
    if (
      typeof GPS.GPSAltitude !== "undefined" &&
      typeof GPS.GPSAltitudeRef !== "undefined"
    ) {
      // Attempt to use GPS altitude:
      // (may eventually need to find EXIF field of view for correction)
      if (
        typeof GPS.GPSAltitude !== "undefined" &&
        typeof GPS.GPSAltitudeRef !== "undefined"
      ) {
        altitude =
          GPS.GPSAltitude.numerator / GPS.GPSAltitude.denominator +
          GPS.GPSAltitudeRef;
      } else {
        altitude = 0; // none
      }
    }
  } else {
    alert("EXIF initialized. Press again to view data in console.");
  }
};

L.EditHandle = L.Marker.extend({
  initialize: function(overlay, corner, options) {
    var markerOptions,
      latlng = overlay.getCorner(corner);

    L.setOptions(this, options);

    this._handled = overlay;
    this._corner = corner;

    markerOptions = {
      draggable: true,
      zIndexOffset: 10
    };

    if (options && options.hasOwnProperty("draggable")) {
      markerOptions.draggable = options.draggable;
    }

    L.Marker.prototype.initialize.call(this, latlng, markerOptions);
  },

  onAdd: function(map) {
    L.Marker.prototype.onAdd.call(this, map);
    this._bindListeners();

    this.updateHandle();
  },

  onRemove: function(map) {
    this._unbindListeners();
    L.Marker.prototype.onRemove.call(this, map);
	},
	
  _onHandleDragStart: function() {
		this._handled.fire("editstart");
  },

  _onHandleDragEnd: function() {
    this._fireEdit();
	},

  _fireEdit: function() {
    this._handled.edited = true;
    this._handled.fire("edit");
  },

  _bindListeners: function() {
    this.on(
      {
        dragstart: this._onHandleDragStart,
        drag: this._onHandleDrag,
        dragend: this._onHandleDragEnd
      },
      this
    );

    this._handled._map.on("zoomend", this.updateHandle, this);

    this._handled.on("update", this.updateHandle, this);
  },

  _unbindListeners: function() {
    this.off(
      {
        dragstart: this._onHandleDragStart,
        drag: this._onHandleDrag,
        dragend: this._onHandleDragEnd
      },
      this
    );

    this._handled._map.off("zoomend", this.updateHandle, this);
    this._handled.off("update", this.updateHandle, this);
  },

 /* Takes two latlngs and calculates the scaling difference. */
  _calculateScalingFactor: function(latlngA, latlngB) {
     var overlay = this._handled,
       map = overlay._map,

       centerPoint = map.latLngToLayerPoint(overlay.getCenter()),
       formerPoint = map.latLngToLayerPoint(latlngA),
       newPoint = map.latLngToLayerPoint(latlngB),
       formerRadiusSquared = this._d2(centerPoint, formerPoint),
       newRadiusSquared = this._d2(centerPoint, newPoint);

    return Math.sqrt(newRadiusSquared / formerRadiusSquared);
  },

 /* Distance between two points in cartesian space, squared (distance formula). */
  _d2: function(a, b) {
      var dx = a.x - b.x,
          dy = a.y - b.y;

      return Math.pow(dx, 2) + Math.pow(dy, 2);
  },

 /* Takes two latlngs and calculates the angle between them. */
	calculateAngleDelta: function(latlngA, latlngB) {
    var overlay = this._handled,
      map = overlay._map,

			centerPoint = map.latLngToLayerPoint(overlay.getCenter()),
			formerPoint = map.latLngToLayerPoint(latlngA),
			newPoint = map.latLngToLayerPoint(latlngB),

			initialAngle = Math.atan2(centerPoint.y - formerPoint.y, centerPoint.x - formerPoint.x),
			newAngle = Math.atan2(centerPoint.y - newPoint.y, centerPoint.x - newPoint.x);

		return newAngle - initialAngle;
	}
});

L.LockHandle = L.EditHandle.extend({
	options: {
		TYPE: 'lock',
		icon: L.icon({ 
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAD8SURBVO3BPU7CYAAA0AdfjIcQlRCQBG7C3gk2uIPG2RC3Dk16Gz0FTO1WZs/gwGCMP/2+xsSl7+n1er1Iz9LtRQjaPeMeO+TinLDCJV78YqjdA04YodKuxhUaPGoRxMmxwRQZSt87Yo4KExGCeAUyLLFB4bMacxywEClIU2KDKXbInTUYo8JCgoFuGoxQO5uiwY1EA91VmDqrcKeDoX8WdNNgjApvmGGLXKIgXY0xGkxQYItrrFFIEKQ5Yo4KEx9yrDFDhlKkIF6NOQ5Y+KpAhiXWKEQI4pxwiwoLPyuxwQw75FoE7fZYocFEuwI7jHCBV39gL92TXq/Xi/AOcmczZmaIMScAAAAASUVORK5CYII=',
			iconSize: [32, 32],
			iconAnchor: [16, 16]
		})
	},

	/* cannot be dragged */
	_onHandleDrag: function() {
	},

	updateHandle: function() {
		this.setLatLng(this._handled.getCorner(this._corner));
		L.DomUtil.removeClass(this._handled.getElement(), 'selected');
	}

});

L.DistortHandle = L.EditHandle.extend({
  options: {
    TYPE: "distort",
    icon: L.icon({
      iconUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  },

  _onHandleDrag: function() {
    var overlay = this._handled;

    overlay.setCorner(this._corner, this.getLatLng());

    overlay.fire("update");
    overlay.editing._updateToolbarPos();
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
	},

});

L.RotateScaleHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotateScale',
		icon: L.icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
			iconSize: [32, 32],
			iconAnchor: [16, 16]
		})
	},

	_onHandleDrag: function() {
		var overlay = this._handled,
			edit = overlay.editing,
			formerLatLng = overlay.getCorner(this._corner),
			newLatLng = this.getLatLng(),

			angle = this.calculateAngleDelta(formerLatLng, newLatLng),
			scale = this._calculateScalingFactor(formerLatLng, newLatLng);
		
		if (angle !== 0) { edit._rotateBy(angle); }

		/* 
		  checks whether the "edgeMinWidth" property is set and tracks the minimum edge length;
		  this enables preventing scaling to zero, but we might also add an overall scale limit
		*/		
		if (overlay.hasOwnProperty('edgeMinWidth')){
			var edgeMinWidth = overlay.edgeMinWidth,
			    w = L.latLng(overlay.getCorner(0)).distanceTo(overlay.getCorner(1)),
					h = L.latLng(overlay.getCorner(1)).distanceTo(overlay.getCorner(2));
			if ((w > edgeMinWidth && h > edgeMinWidth) || scale > 1) {
				edit._scaleBy(scale);
			}
		} 

		overlay.fire('update');
		edit._updateToolbarPos();
	},

	updateHandle: function() {
		this.setLatLng(this._handled.getCorner(this._corner));
	},
});

L.RotateHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotate',
		icon: L.icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
			iconSize: [32, 32],
			iconAnchor: [16, 16]
		})
	},
	
	_onHandleDrag: function() {
		var overlay = this._handled,
			formerLatLng = overlay.getCorner(this._corner),
			newLatLng = this.getLatLng(),
			angle = this.calculateAngleDelta(formerLatLng, newLatLng);

	 	if (angle !== 0) { overlay.editing._rotateBy(angle); }

		overlay.fire('update');
		overlay.editing._updateToolbarPos();
	},

	updateHandle: function() {
		this.setLatLng(this._handled.getCorner(this._corner));
	}
	
});

L.ScaleHandle = L.EditHandle.extend({
	options: {
		TYPE: 'rotate',
		icon: L.icon({
			iconUrl:'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0NTkiIGhlaWdodD0iNDY0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iIj48cmVjdCBpZD0iYmFja2dyb3VuZHJlY3QiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHg9IjAiIHk9IjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgY2xhc3M9IiIgc3R5bGU9IiIvPjxnIGNsYXNzPSJjdXJyZW50TGF5ZXIiIHN0eWxlPSIiPjx0aXRsZT5MYXllciAxPC90aXRsZT48cGF0aCBkPSJNNDU5LjA0OTE1OTUzMDQ3MTM0LDg2LjkyNjIzNDUxMjU1MDAyIFYwIGgtODUuNzE0NTczMzU2MzEyMDkgdjI3LjA0MzcxNzQwMzkwNDQ1MiBIODUuNzE0NTczMzU2MzEyMDMgVjAgSDAgdjg2LjkyNjIzNDUxMjU1MDAyIGgyNS43MTQzNzIwMDY4OTM2MjYgdjI4OS43NTQxMTUwNDE4MzM0IEgwIHY4Ni45MjYyMzQ1MTI1NTAwMiBoODUuNzE0NTczMzU2MzEyMDkgdi0yNy4wNDM3MTc0MDM5MDQ0NTIgaDI4NS43MTUyNDQ1MjEwNDAzIHYyNy4wNDM3MTc0MDM5MDQ0NTIgaDg1LjcxNDU3MzM1NjMxMjA5IHYtODYuOTI2MjM0NTEyNTUwMDIgaC0yMy44MDk2MDM3MTAwODY2OSBWODYuOTI2MjM0NTEyNTUwMDIgSDQ1OS4wNDkxNTk1MzA0NzEzNCB6TTM4NC43NjMxOTU5NTUwMDA5LDEyLjU1NjAxMTY1MTgxMjc4MSBoNjEuOTA0OTY5NjQ2MjI1Mzk2IHY2Mi43ODAwNTgyNTkwNjM5MSBoLTYxLjkwNDk2OTY0NjIyNTM5NiBWMTIuNTU2MDExNjUxODEyNzgxIHpNMTIuMzgwOTkzOTI5MjQ1MDUsMTIuNTU2MDExNjUxODEyNzgxIGg2MS45MDQ5Njk2NDYyMjUzOTYgdjYyLjc4MDA1ODI1OTA2MzkxIEgxMi4zODA5OTM5MjkyNDUwNSBWMTIuNTU2MDExNjUxODEyNzgxIHpNNzQuMjg1OTYzNTc1NDcwNTMsNDUxLjA1MDU3MjQxNTEyMDY2IEgxMi4zODA5OTM5MjkyNDUwNSB2LTYyLjc4MDA1ODI1OTA2MzkxIGg2MS45MDQ5Njk2NDYyMjUzOTYgVjQ1MS4wNTA1NzI0MTUxMjA2NiB6TTQ0NS43MTU3ODE0NTI4MjI3NCw0NTEuMDUwNTcyNDE1MTIwNjYgaC02Mi44NTczNTM3OTQ2Mjg4NjQgdi02Mi43ODAwNTgyNTkwNjM5MSBoNjIuODU3MzUzNzk0NjI4ODY0IFY0NTEuMDUwNTcyNDE1MTIwNjYgek00MDcuNjIwNDE1NTE2Njg0MjYsMzc2LjY4MDM0OTU1NDM4MzQ0IGgtMzYuMTkwNTk3NjM5MzMxNzcgdjMyLjgzODc5OTcwNDc0MTEyIEg4NS43MTQ1NzMzNTYzMTIwMyB2LTMyLjgzODc5OTcwNDc0MTEyIEg0OS41MjM5NzU3MTY5ODAzMiBWODYuOTI2MjM0NTEyNTUwMDIgaDM2LjE5MDU5NzYzOTMzMTc3IFY1MC4yMjQwNDY2MDcyNTExMjUgaDI4Ny42MjAwMTI4MTc4NDcyIHYzNi43MDIxODc5MDUyOTg5IGgzNC4yODU4MjkzNDI1MjQ4MzUgVjM3Ni42ODAzNDk1NTQzODM0NCB6IiBpZD0ic3ZnXzIiIGNsYXNzPSIiIGZpbGw9IiMxYTFhZWIiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L3N2Zz4=',
			iconSize: [32, 32],
			iconAnchor: [16, 16]
		})
	},

	_onHandleDrag: function() {
		var overlay = this._handled,
			formerLatLng = overlay.getCorner(this._corner),
			newLatLng = this.getLatLng(),

			scale = this._calculateScalingFactor(formerLatLng, newLatLng);

		overlay.editing._scaleBy(scale);

		overlay.fire('update');
		overlay.editing._updateToolbarPos();
	},

	updateHandle: function() {
		this.setLatLng(this._handled.getCorner(this._corner));
	},
});

L.EditAction = L.Toolbar2.Action.extend({
  initialize: function (map, overlay, options) {
    this._overlay = overlay;
    this._map = map;

    L.Toolbar2.Action.prototype.initialize.call(this, options);
  }
});

L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

var ToggleTransparency = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip;
    
    if (edit._transparent) {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#opacity"></use>';
      tooltip = 'Make Image Opaque';
    } else {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#opacity-empty"></use>';
      tooltip = 'Make Image Transparent';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleTransparency();
  }
});

var ToggleOutline = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip;
    
    if (edit._outlined) {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#border_clear"></use>';
      tooltip = 'Remove Border';
    } else {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#border_outer"></use>';
      tooltip = 'Add Border';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleOutline();
  }
});

var Delete = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#delete_forever"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Delete Image'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._removeOverlay();
  }
});

var ToggleLock = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip;

    if (edit._mode === 'lock') {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#unlock"></use>';
      tooltip = 'Unlock';
    } else {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#lock"></use>';
      tooltip = 'Lock';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleLock();
  }
});

var ToggleRotateScale = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip;

    if (edit._mode === 'rotateScale') {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#transform"></use>';
      tooltip = 'Distort';
    } else {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#crop_rotate"></use>';
      tooltip = 'Rotate+Scale';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleRotateScale();
  }
});

var Export = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var  href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#get_app"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Export Image'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._getExport();
  }
});

var ToggleOrder = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing,
      href,
      tooltip;

    if (edit._toggledImage) {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#flip_to_front"></use>';
      tooltip = 'Stack to Front';
    } else {
      href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#flip_to_back"></use>';
      tooltip = 'Stack to Back';
    }

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: tooltip
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._toggleOrder();
  }
});

var EnableEXIF = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#explore"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Geolocate Image'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var image = this._overlay.getElement();

    EXIF.getData(image, L.EXIF(image));
  }
});

var Restore = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#restore"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Restore'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._restore();
  }
});

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
    actions: [
      ToggleTransparency,
      ToggleOutline,
      ToggleLock,
      ToggleRotateScale,
      ToggleOrder,
      EnableEXIF,
      Restore,
      Export,
      Delete
    ]
  },

  // todo: move to some sort of util class, these methods could be useful in future
  _rotateToolbarAngleDeg: function(angle) {
    var div = this._container,
      divStyle = div.style;

    var oldTransform = divStyle.transform;

    divStyle.transform = oldTransform + "rotate(" + angle + "deg)";
    divStyle.transformOrigin = "1080% 650%";

    this._rotateToolbarIcons(angle);
  },

  _rotateToolbarIcons: function(angle) {
    var icons = document.querySelectorAll(".fa");

    for (var i = 0; i < icons.length; i++) {
      icons.item(i).style.transform = "rotate(" + -angle + "deg)";
    }
  }
});

L.distortableImage.popupBar = function (latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function () {
  this.ACTIONS = [
    ToggleTransparency, 
    ToggleOutline, 
    ToggleLock, 
    ToggleRotateScale, 
    ToggleOrder,
    EnableEXIF,
    Restore,
    Export,
    Delete
  ];

  if (this.options.actions) {
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }

  this.editing = new L.DistortableImage.Edit(this, { actions: this.editActions });

  if (this.options.editable) {
    L.DomEvent.on(this._image, "load", this.editing.enable, this.editing);
  }

  this.on('remove', function () {
    if (this.editing) { this.editing.disable(); }
  });
});

L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

  var Exports = L.EditAction.extend({
    initialize: function (map, group, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#get_app"></use>';
  
      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Export Images'
      };

      L.EditAction.prototype.initialize.call(this, map, group, options);
    },

    addHooks: function () {
      var group = this._overlay;

      group.startExport();
    }
  });

  var Deletes = L.EditAction.extend({
    initialize: function(map, overlay, options) {
      var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#delete_forever"></use>';

      options = options || {};
      options.toolbarIcon = {
        html: '<svg>' + href + '</svg>',
        tooltip: 'Delete Images'
      };

      L.EditAction.prototype.initialize.call(this, map, overlay, options);
    },

    addHooks: function() {
      var group = this._overlay;

      group._removeFromGroup();
    }
  });

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({
  options: {
    actions: [
      Exports,
      Deletes
    ]
  },
});

L.distortableImage.controlBar = function (options) {
  return new L.DistortableImage.ControlBar(options);
};

L.DistortableCollection.addInitHook(function () {
  this.ACTIONS = [Exports, Deletes];

  if (this.options.actions) {
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }
});

L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
  options: {
    opacity: 0.7,
    outline: "1px solid red",
    keymap: {
     'Backspace': '_removeOverlay', // backspace windows / delete mac
     'CapsLock': '_toggleRotate',
     'Escape': '_deselect',
     'd': '_toggleRotateScale',
     'r': '_toggleRotateScale',
     'j': '_toggleOrder',
     'k': '_toggleOrder',
     'l': '_toggleLock',
     'o': '_toggleOutline',
     's': '_toggleScale',
		 't': '_toggleTransparency',
    }
  },

  initialize: function(overlay, options) {
    this._overlay = overlay;
    this._toggledImage = false;
    /* Interaction modes. TODO - create API for limiting modes similar to toolbar actions API */
    var modes = ["distort", "lock", "rotate", "scale", "rotateScale"];
    this._mode = modes[modes.indexOf(overlay.options.mode)] || "distort";
    
    this._selected = this._overlay.options.selected || false;
    this._transparent = false;
    this._outlined = false;

    /* generate instance counts. TODO - add the keymapper to collection instead of individ. imgs perhaps? */
    this.instance_count = L.DistortableImage.Edit.prototype.instances =
      L.DistortableImage.Edit.prototype.instances ? L.DistortableImage.Edit.prototype.instances + 1 : 1;

    L.setOptions(this, options); 
  },

  /* Run on image selection. */
  addHooks: function() {
    var overlay = this._overlay,
      map = overlay._map,
      keymapper_position;

    /* instantiate and render keymapper for one instance only */
    if (this.instance_count === 1 && overlay.options.keymapper !== false) {
      keymapper_position = overlay.options.keymapper_position || 'topright';
      map.addControl(new L.DistortableImage.Keymapper({ position: keymapper_position }));
    }

    /* bring the selected image into view */
    overlay.bringToFront();

    this._initHandles();

    this._appendHandlesandDragable(this._mode);

    this.editActions = this.options.actions;

    if (this._selected && !overlay.options.suppressToolbar) { this._addToolbar(); }

    this._overlay._dragStartPoints = {
      0: L.point(0, 0),
      1: L.point(0, 0),
      2: L.point(0, 0),
      3: L.point(0, 0)
    };

    L.DomEvent.on(map, "click", this._deselect, this);
    L.DomEvent.on(overlay._image, "click", this._select, this);

    /* Enable hotkeys. */
    L.DomEvent.on(window, "keydown", this._onKeyDown, this);
  },

  /* Run on image deselection. */
  removeHooks: function() {
    var overlay = this._overlay,
      map = overlay._map;

    L.DomEvent.off(map, "click", this._deselect, this);
    L.DomEvent.off(overlay._image, "click", this._select, this);

    // First, check if dragging exists - it may be off due to locking
    if (this.dragging) { this.dragging.disable(); }
    delete this.dragging;

    if (this.toolbar) { this._removeToolbar(); }
    if (this.editing) { this.editing.disable(); }

    map.removeLayer(this._handles[this._mode]);

    /* Disable hotkeys. */
    L.DomEvent.off(window, "keydown", this._onKeyDown, this);
  },

  _initHandles: function() {
    var overlay = this._overlay,
    i;

    this._lockHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._lockHandles.addLayer(
        new L.LockHandle(overlay, i, { draggable: false })
      );
    }

    this._distortHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._distortHandles.addLayer(new L.DistortHandle(overlay, i));
    }

    this._rotateHandles = L.layerGroup(); // individual rotate
    for (i = 0; i < 4; i++) {
      this._rotateHandles.addLayer(new L.RotateHandle(overlay, i));
    }

    this._scaleHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._scaleHandles.addLayer(new L.ScaleHandle(overlay, i));
    }

    this._rotateScaleHandles = L.layerGroup(); // handle includes rotate AND scale
    for (i = 0; i < 4; i++) {
      this._rotateScaleHandles.addLayer(new L.RotateScaleHandle(overlay, i));
    }

    this._handles = {
      lock: this._lockHandles,
      distort: this._distortHandles,
      rotateScale: this._rotateScaleHandles,
      scale: this._scaleHandles,
      rotate: this._rotateHandles
    };
  },

  _appendHandlesandDragable: function (mode) {
    var overlay = this._overlay,
      map = overlay._map;

    map.addLayer(this._handles[mode]);

    if (mode !== 'lock') {
      if (!this._selected) {
        this._handles[mode].eachLayer(function (layer) {
          layer.setOpacity(0);
          layer.dragging.disable();
          layer.options.draggable = false;
        });
      }

      this._enableDragging();
    }
  },

  addTool: function (value) {
    if (value.baseClass === "leaflet-toolbar-icon" && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
    } else {
      return false;
    }
  },

  hasTool: function (value) {
    return this.editActions.some(function (action) {
      return action === value;
    });
  },

  removeTool: function (value) {
    this.editActions.some(function (item, idx) {
      if (this.editActions[idx] === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    }, this);
  },

  _rotateBy: function(angle) {
    var overlay = this._overlay,
      map = overlay._map,
      center = map.latLngToLayerPoint(overlay.getCenter()),
      i,
      p,
      q;

    for (i = 0; i < 4; i++) {
      p = map.latLngToLayerPoint(overlay.getCorner(i)).subtract(center);
      q = L.point(
        Math.cos(angle) * p.x - Math.sin(angle) * p.y,
        Math.sin(angle) * p.x + Math.cos(angle) * p.y
      );
      overlay.setCorner(i, map.layerPointToLatLng(q.add(center)));
    }

    // window.angle = L.TrigUtil.radiansToDegrees(angle);

    this._overlay.rotation -= L.TrigUtil.radiansToDegrees(angle);

    overlay._reset();
  },

  _restore: function() {
    var overlay = this._overlay;
    var angle = overlay.rotation;
    var map = overlay._map;
    var center = map.latLngToLayerPoint(overlay.getCenter());
    var offset = overlay._initialDimensions.offset;

    var corners = { 
      0: map.layerPointToLatLng(center.subtract(offset)),
      1: map.layerPointToLatLng(center.add(L.point(offset.x, -offset.y))),
      2: map.layerPointToLatLng(center.add(L.point(-offset.x, offset.y))),
      3: map.layerPointToLatLng(center.add(offset))
    };

    map.removeLayer(this._handles[this._mode]);

    overlay.setCorners(corners);

    if (angle !== 0) { this._rotateBy(L.TrigUtil.degreesToRadians(360 - angle)); }

    map.addLayer(this._handles[this._mode]);

    this._updateToolbarPos();

    this._overlay.rotation = angle;
  },

  _scaleBy: function(scale) {
    var overlay = this._overlay,
      map = overlay._map,
      center = map.latLngToLayerPoint(overlay.getCenter()),
      i,
      p;

    for (i = 0; i < 4; i++) {
      p = map
        .latLngToLayerPoint(overlay.getCorner(i))
        .subtract(center)
        .multiplyBy(scale)
        .add(center);
      overlay.setCorner(i, map.layerPointToLatLng(p));
    }

    overlay._reset();
  },

  _enableDragging: function() {
    var overlay = this._overlay,
      map = overlay._map;

    this.dragging = new L.Draggable(overlay.getElement());
    this.dragging.enable();

    /* Hide toolbars and markers while dragging; click will re-show it */
    this.dragging.on("dragstart", function() {
      overlay.fire("dragstart");
      this._removeToolbar();
    },this);

    /*
     * Adjust default behavior of L.Draggable.
     * By default, L.Draggable overwrites the CSS3 distort transform
     * that we want when it calls L.DomUtil.setPosition.
     */
    this.dragging._updatePosition = function() {
      var delta = this._newPos.subtract(
          map.latLngToLayerPoint(overlay._corners[0])
        ),
        currentPoint,
        i;

      this.fire("predrag");

      for (i = 0; i < 4; i++) {
        currentPoint = map.latLngToLayerPoint(overlay._corners[i]);
        overlay._corners[i] = map.layerPointToLatLng(currentPoint.add(delta));
			}

      overlay._reset();
      overlay.fire("update");
      overlay.fire("drag");

      this.fire("drag");
    };
  },

  _onKeyDown: function(event) {
    var keymap = this.options.keymap,
      handlerName = keymap[event.key],
      eventParents = this._overlay._eventParents;

    if (eventParents) {
      var eP = eventParents[Object.keys(eventParents)[0]];
      if (eP.anySelected()) {
        return;
      }
    }

    if (this[handlerName] !== undefined && !this._overlay.options.suppressToolbar) {
      if (this._selected) {
        this[handlerName].call(this);
      }
    }
  }, 

  _toggleRotateScale: function() {
    var map = this._overlay._map;

    if (this._mode === "lock") { return; }

    map.removeLayer(this._handles[this._mode]);

    /* Switch mode. */
    if (this._mode === "rotateScale") { this._mode = "distort"; } 
    else { this._mode = "rotateScale"; }

    map.addLayer(this._handles[this._mode]);

    this._showToolbar();
  },

  _toggleScale: function() {
		var map = this._overlay._map;

    if (this._mode === "lock") { return; }

    map.removeLayer(this._handles[this._mode]);

		if (this._mode === "scale") { this._mode = "distort"; }
		else { this._mode = "scale"; }

    map.addLayer(this._handles[this._mode]);

  },

  _toggleRotate: function() {
		var map = this._overlay._map;

		if (this._mode === "lock") { return; }

    map.removeLayer(this._handles[this._mode]);
    if (this._mode === "rotate") { this._mode = "distort"; } 
		else { this._mode = "rotate"; }
		
    map.addLayer(this._handles[this._mode]);
  },

  _toggleTransparency: function() {
    var image = this._overlay._image,
      opacity;

    this._transparent = !this._transparent;
    opacity = this._transparent ? this.options.opacity : 1;

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute("opacity", opacity);

    this._showToolbar();
  },

  _toggleOutline: function() {
    var image = this._overlay.getElement(),
      opacity,
      outline;

    this._outlined = !this._outlined;
    outline = this._outlined ? this.options.outline : "none";

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute("opacity", opacity);

    image.style.outline = outline;

    this._showToolbar();
  },

  _sendUp: function() {
    this._overlay.bringToFront();
  },

  _sendDown: function() {
    this._overlay.bringToBack();
  },

  _toggleLock: function() {
    var map = this._overlay._map;

    map.removeLayer(this._handles[this._mode]);
    /* Switch mode. */
    if (this._mode === "lock") {
      this._mode = "distort";
      this._enableDragging();
    } else {
      this._mode = "lock";
      if (this.dragging) { this.dragging.disable(); }
      delete this.dragging;
    }

    map.addLayer(this._handles[this._mode]);

    this._showToolbar();
  },

  _select: function(event) {
    this._selected = true;
    this._showToolbar();
    this._showMarkers();

    if (event) { L.DomEvent.stopPropagation(event); }
  },

  _deselect: function() {
    this._selected = false;
    this._removeToolbar();
    if (this._mode !== "lock") { 
      this._hideMarkers(); 
    }
  },

  _removeToolbar: function() {
    var overlay = this._overlay,
      map = overlay._map;

    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    }
  },

  _showMarkers: function() {
    if (this._mode === "lock") { return; }

    if (this.toolbar && this.toolbar instanceof L.DistortableImage.PopupBar) {
      var currentHandle = this._handles[this._mode];

      currentHandle.eachLayer(function (layer) {
        var drag = layer.dragging,
          opts = layer.options;

        layer.setOpacity(1);
        if (drag) { drag.enable(); }
        if (opts.draggable) { opts.draggable = true; }
      });
    }
  },

  _hideMarkers: function() {
    if (!this._handles) { this._initHandles(); }  // workaround for race condition w/ feature group

    var mode = this._mode,
      currentHandle = this._handles[mode];
    
		currentHandle.eachLayer(function (layer) {
      var drag = layer.dragging,
				opts = layer.options;

      if (mode !== 'lock') {
        layer.setOpacity(0);
      }
			if (drag) { drag.disable(); }
			if (opts.draggable) { opts.draggable = false; }
		});
  },

  _addToolbar: function() {
    var overlay = this._overlay,
      map = overlay._map,
      //Find the topmost point on the image.
      corners = overlay.getCorners(),
      maxLat = -Infinity;

    for (var i = 0; i < corners.length; i++) {
      if (corners[i].lat > maxLat) {
        maxLat = corners[i].lat;
      }
    }

    //Longitude is based on the centroid of the image.
    var raised_point = overlay.getCenter();
    raised_point.lat = maxLat;

    try {
      this.toolbar = L.distortableImage.popupBar(raised_point, {
        actions: this.editActions
      }).addTo(map, overlay);
      overlay.fire('toolbar:created');
    }
    catch (e) { }

  },

  // TODO: toolbar for multiple image selection
  _showToolbar: function() {
    var overlay = this._overlay,
      eventParents = overlay._eventParents;

    if (overlay.options.suppressToolbar) { return; }

    if (eventParents) {
      var eP = eventParents[Object.keys(eventParents)[0]];
      if (eP.anySelected()) {
        eP._addToolbar();
        return;
      }
    } 

    this._addToolbar();
  },
  
  _updateToolbarPos: function() {
    var overlay = this._overlay,
      //Find the topmost point on the image.
      corners = overlay.getCorners(),
      toolbar = this.toolbar,
      maxLat = -Infinity;

    if (toolbar && toolbar instanceof L.DistortableImage.PopupBar) { 
      for (var i = 0; i < corners.length; i++) {
        if (corners[i].lat > maxLat) {
          maxLat = corners[i].lat;
        }
      }

      //Longitude is based on the centroid of the image.
      var raised_point = overlay.getCenter();
      raised_point.lat = maxLat;

      if (overlay.options.suppressToolbar !== true) {
        this.toolbar.setLatLng(raised_point);
      }
    }
  },

  _removeOverlay: function () {
    var overlay = this._overlay,
      eventParents = overlay._eventParents;

    if (this._mode === "lock") { return; }

    var choice = L.DomUtil.confirmDelete();
    if (!choice) { return; }

    this._removeToolbar();

    if (eventParents) {
      var eP = eventParents[Object.keys(eventParents)[0]];
      eP.removeLayer(overlay);
    } else {
      overlay._map.removeLayer(overlay);
    }
	},

	// compare this to using overlay zIndex
	_toggleOrder: function () {
    if (this._toggledImage) {
      this._toggledImage = false;
      this._overlay.bringToFront();
    } else {
      this._toggledImage = true;
      this._overlay.bringToBack();
    }

    this._showToolbar();
  },

  // Based on https://github.com/publiclab/mapknitter/blob/8d94132c81b3040ae0d0b4627e685ff75275b416/app/assets/javascripts/mapknitter/Map.js#L47-L82
  _getExport: function() {
    var map = this._overlay._map;
    var overlay = this._overlay;

    // make a new image
    var downloadable = new Image();

    downloadable.id = downloadable.id || "tempId12345";
    $("body").append(downloadable);

    downloadable.onload = function onLoadDownloadableImage() {
      var height = downloadable.height,
        width = downloadable.width,
        nw = map.latLngToLayerPoint(overlay.getCorner(0)),
        ne = map.latLngToLayerPoint(overlay.getCorner(1)),
        sw = map.latLngToLayerPoint(overlay.getCorner(2)),
        se = map.latLngToLayerPoint(overlay.getCorner(3));

      // I think this is to move the image to the upper left corner,
      // jywarren: i think we may need these or the image goes off the edge of the canvas
      // jywarren: but these seem to break the distortion math...

      // jywarren: i think it should be rejiggered so it
      // finds the most negative values of x and y and then
      // adds those to all coordinates

      //nw.x -= nw.x;
      //ne.x -= nw.x;
      //se.x -= nw.x;
      //sw.x -= nw.x;

      //nw.y -= nw.y;
      //ne.y -= nw.y;
      //se.y -= nw.y;
      //sw.y -= nw.y;

      // run once warping is complete
      downloadable.onload = function() {
        $(downloadable).remove();
      };

      if (window && window.hasOwnProperty("warpWebGl")) {
        warpWebGl(
          downloadable.id,
          [0, 0, width, 0, width, height, 0, height],
          [nw.x, nw.y, ne.x, ne.y, se.x, se.y, sw.x, sw.y],
          true // trigger download
        );
      }
    };

    downloadable.src = overlay.options.fullResolutionSrc || overlay._image.src;
  },

  toggleIsolate: function() {
    // this.isolated = !this.isolated;
    // if (this.isolated) {
    // 	$.each($L.images,function(i,img) {
    // 		img.hidden = false;
    // 		img.setOpacity(1);
    // 	});
    // } else {
    // 	$.each($L.images,function(i,img) {
    // 		img.hidden = true;
    // 		img.setOpacity(0);
    // 	});
    // }
    // this.hidden = false;
    // this.setOpacity(1);
  }
});

L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Keymapper = L.Control.extend({
    initialize: function(options) {
        L.Control.prototype.initialize.call(this, options);
    },
    
    onAdd: function() {
        var el_wrapper = L.DomUtil.create("div", "l-container");
        el_wrapper.innerHTML =
          "<table><tbody>" +
            "<tr><th>Keymappings</th></tr>" +
            "<tr><td><kbd>t</kbd>: <span>Transparency</span></td></tr>" +
            "<tr><td><kbd>o</kbd>: <span>Outline</span></td></tr>" +
            "<tr><td><kbd>l</kbd>: <span>Lock</span></td></tr>" +
            "<tr><td><kbd>caps</kbd>: <span>Rotate</span></td></tr>" +
            "<tr><td><kbd>s</kbd>: <span>Scale</span></td></tr>" +
            "<tr><td><kbd>d</kbd>: <span>Distort</span> </td></tr>" +
            "<tr><td><kbd>r</kbd>: <span>Rotate+Scale</span> </td></tr>" +
            "<tr><td><kbd>j</kbd>, <kbd>k</kbd>: <span>Stack up / down</span></td></tr>" +
            "<tr><td><kbd>esc</kbd>: <span>Deselect All</span></td></tr>" +
            "<tr><td><kbd>delete</kbd> , <kbd>backspace</kbd>: <span>Delete</span></td></tr>" +
          "</tbody></table>";
        return el_wrapper;
    }
});
L.Map.mergeOptions({ boxSelector: true, boxZoom: false });

/** 
 * pretty much all Leaflet 1.5.1 source code. Overriden so that its a selection box with our `L.DistortableCollection` class 
 * instead of a zoom box. 
 * */

L.Map.BoxSelector = L.Map.BoxZoom.extend({

  initialize: function (map) {
    this._map = map;
    this._container = map._container;
    this._pane = map._panes.overlayPane;
    this._resetStateTimeout = 0;
    map.on('unload', this._destroy, this);
  },

  addHooks: function () {
    L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
  },

  removeHooks: function () {
    L.DomEvent.off(this._container, 'mousedown', this._onMouseDown, this);
  },

  moved: function () {
    return this._moved;
  },

  _destroy: function () {
    L.DomUtil.remove(this._pane);
    delete this._pane;
  },

  _resetState: function () {
    this._resetStateTimeout = 0;
    this._moved = false;
  },

  _clearDeferredResetState: function () {
    if (this._resetStateTimeout !== 0) {
      clearTimeout(this._resetStateTimeout);
      this._resetStateTimeout = 0;
    }
  },

  _onMouseDown: function (e) {
    if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

    // Clear the deferred resetState if it hasn't executed yet, otherwise it
    // will interrupt the interaction and orphan a box element in the container.
    this._clearDeferredResetState();
    this._resetState();

    L.DomUtil.disableTextSelection();
    L.DomUtil.disableImageDrag();

    this._startPoint = this._map.mouseEventToContainerPoint(e);

    L.DomEvent.on(document, {
      contextmenu: L.DomEvent.stop,
      mousemove: this._onMouseMove,
      mouseup: this._onMouseUp,
      keydown: this._onKeyDown
    }, this);
  },

  _onMouseMove: function (e) {
    if (!this._moved) {
      this._moved = true;

      this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._container);
      L.DomUtil.addClass(this._container, 'leaflet-crosshair');

      this._map.fire('boxzoomstart');
    }

    this._point = this._map.mouseEventToContainerPoint(e);

    var bounds = L.bounds(this._point, this._startPoint),
      size = bounds.getSize();

    L.DomUtil.setPosition(this._box, bounds.min);

    this._box.style.width = size.x + 'px';
    this._box.style.height = size.y + 'px';
  },

  _finish: function () {
    if (this._moved) {
      L.DomUtil.remove(this._box);
      L.DomUtil.removeClass(this._container, 'leaflet-crosshair');
    }

    L.DomUtil.enableTextSelection();
    L.DomUtil.enableImageDrag();

    L.DomEvent.off(document, {
      contextmenu: L.DomEvent.stop,
      mousemove: this._onMouseMove,
      mouseup: this._onMouseUp,
      keydown: this._onKeyDown
    }, this);
  },

  _onMouseUp: function (e) {
    if ((e.which !== 1) && (e.button !== 1)) { return; }

    this._finish();

    if (!this._moved) { return; }
    // Postpone to next JS tick so internal click event handling
    // still see it as "moved".
    this._clearDeferredResetState();
    this._resetStateTimeout = setTimeout(L.Util.bind(this._resetState, this), 0);

    var bounds = new L.latLngBounds(
      this._map.containerPointToLatLng(this._startPoint),
      this._map.containerPointToLatLng(this._point));

    this._map
      .fire('boxzoomend', { boxZoomBounds: bounds });
  },

  _onKeyDown: function (e) {
    if (e.keyCode === 27) {
      this._finish();
    }
  }
});

L.Map.addInitHook('addHandler', 'boxSelector', L.Map.BoxSelector);