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
    var topLeft = L.Map.prototype._getTopLeftPoint
      .call(this, newCenter, newZoom)
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
    edgeMinWidth: 50
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

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(" ");
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

    L.DomEvent.on(layer, {
      dragstart: this._dragStartMultiple, 
      drag: this._dragMultiple
    }, this);

    L.DomEvent.on(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect  /* Enable longpress for multi select for touch devices. */
    }, this);
  },

  _turnOffEditing: function(e) {
    var layer = e.layer; 

    layer.editing.disable();

    L.DomEvent.off(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple
    }, this);

    L.DomEvent.off(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect
    }, this);
  },

  _addToolbar: function() {
    try {
      if (!this.toolbar) {
        this.toolbar = L.distortableImage.controlBar({
          actions: this.editActions,
          position: 'topleft'
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
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
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

  _longPressMultiSelect: function(e) {
    var image = e.target;

     e.preventDefault();
     L.DomUtil.toggleClass(image, 'selected');
     this._addToolbar();
  },

  isSelected: function (overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), 'selected');
  },

  anySelected: function() {
    var layerArr = this.getLayers();

    return layerArr.some(this.isSelected.bind(this));
  },

  _toggleMultiSelect: function(event, edit) {
    if (event.metaKey || event.ctrlKey) {
      L.DomUtil.toggleClass(event.target, 'selected');
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
    var box = e.boxZoomBounds;

    this.eachLayer(function(layer) {
      var imgBounds = new L.latLngBounds(layer.getCorner(2), layer.getCorner(1));
      imgBounds = this._map._latLngBoundsToNewLayerBounds(imgBounds, this._map.getZoom(), this._map.getCenter());
      if (box.intersects(imgBounds)) {
        if (!this.toolbar) { this._addToolbar(); }
        L.DomUtil.addClass(layer.getElement(), 'selected');
      }
    }, this);
  },

  _onKeyDown: function(e) {
    if (e.key === 'Escape') {
      this._deselectAll(e);
    }
    if (e.key === 'Backspace') {
      this._removeGroup(e);
    }
    if (e.key === 'l') {
      this._lockGroup(e);
    }
    if (e.key === 'u') {
      this._unlockGroup(e);
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
    var oe = event.originalEvent;
    /* prevents image deselection following the 'boxzoomend' event - note 'shift' must not be released until dragging is complete */
    if (oe && oe.shiftKey) { return; }

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      L.DomUtil.removeClass(layer.getElement(), 'selected');
      edit._deselect();
    });

    this._removeToolbar();

    L.DomEvent.stopPropagation(event);
  },

  _unlockGroup: function() {
    var map = this._map;

    this.eachLayer(function (layer) {
      if (this.isSelected(layer)) {
        var edit = layer.editing;
        if (edit._mode === 'lock') { 
          map.removeLayer(edit._handles[edit._mode]); 
          edit._unlock();
          edit._refreshPopupIcons();
        }
      }
    }, this);
  },

  _lockGroup: function() {
    var map = this._map;

    this.eachLayer(function (layer) {
      if (this.isSelected(layer) ) {
        var edit = layer.editing;
        if (edit._mode !== 'lock') {
          edit._lock();
          map.addLayer(edit._handles[edit._mode]);
          edit._refreshPopupIcons();
          // map.addLayer also deselects the image, so we reselect here
          L.DomUtil.addClass(layer.getElement(), 'selected');
        }
      }
    }, this);
  },

  _removeGroup: function(event) {
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
      return (this.isSelected(layer) && edit._mode !== 'lock');
    }, this);
  },

  _calcCollectionFromPoints: function(cpd, overlay) {
    var layersToMove = [],
      p = new L.Transformation(1, -cpd.x, 1, -cpd.y);

    this.eachLayer(function(layer) {
      if (
        layer !== overlay &&
        layer.editing._mode !== 'lock' &&
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
      layer.fire('update');
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
        var zc = layer.getCorners();
        var corners = [
          { lat: zc[0].lat, lon: zc[0].lng },
          { lat: zc[1].lat, lon: zc[1].lng },
          { lat: zc[3].lat, lon: zc[3].lng },
          { lat: zc[2].lat, lon: zc[2].lng }
        ];
        json.images.push({
          id: this.getLayerId(layer),
          src: layer._image.src,
          width: layer._image.width,
          height: layer._image.height,
          image_file_name: filename,
          nodes: corners,
          cm_per_pixel: L.ImageUtil.getCmPerPixel(layer)
        });
      }
    }, this);

    json.images = json.images.reverse();
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
      data = JSON.parse(data);
      // optimization: fetch status directly from google storage:
      if (statusUrl !== data.status_url && data.status_url.match('.json')) { statusUrl = data.status_url; }
      if (data.status === "complete") {
        clearInterval(updateInterval);
      }
      if (data.status === 'complete' && data.jpg !== null) {
        alert("Export succeeded. http://export.mapknitter.org/" + data.jpg);
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
        $.ajax(statusUrl + "?" + Date.now(), { // bust cache with timestamp
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
        dragend: this._onHandleDragEnd,
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
        dragend: this._onHandleDragEnd,
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
			iconUrl: 'data:image/png;base64,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',
			iconSize: [32, 32],
			iconAnchor: [16, 16]
		})
	},

	/* cannot be dragged */
	_onHandleDrag: function() {
	},

  _bindListeners: function() {
    this.on(
      {
        dragstart: this._onHandleDragStart,
        drag: this._onHandleDrag,
        dragend: this._onHandleDragEnd,
        mouseover: this._setTooltip
      },
      this
    );

    this._handled._map.on("zoomend", this.updateHandle, this);

    this._handled.on("update", this.updateHandle, this);
  },

  _setTooltip: function () {
    
	  var Icon = L.Icon.extend({
      options: {
        iconSize: [ 50, 50 ],
        iconAnchor: [ 25, 50 ]
      }
    });
   
	  var question = new Icon({
      iconUrl: '../assets/icons/markers/question-mark.png'
    });
	  
	  this._questionMark = new L.marker(this._handled.getCorner(this._corner), { icon: question })
		  .bindTooltip("Locked!")
		  .addTo(this._handled._map)
		  .openTooltip();
	  
	  setTimeout(function () {
		  var el = [];
		  var marks = Array.from(document.querySelectorAll(".leaflet-interactive"));
		  for (var i = 0; i < marks.length; i++) { 
			  if (/question/.test(marks[ i ].currentSrc)) { 
				  el.push(marks[ i ]);
			  }
		  }
		  var tt = document.querySelector(".leaflet-tooltip");
		  if (tt) { 
		  tt.parentNode.removeChild(tt);
		  }
		  for (var j = 0; j < el.length; j++) { 
		  	el[j].parentNode.removeChild(el[j]);
		  }

	  }, 2000);
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
			var edgeMinWidth = overlay.edgeMinWidth;
                        var corner1 = overlay._map.latLngToContainerPoint(overlay.getCorner(0)),
                            corner2 = overlay._map.latLngToContainerPoint(overlay.getCorner(1));
                        var w = Math.abs(corner1.x - corner2.x);
                        var h = Math.abs(corner1.y - corner2.y);
                        var distance = Math.sqrt(w * w + h * h);
			if ((distance > edgeMinWidth) || scale > 1) {
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

var Revert = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#restore"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Restore Original Image Dimensions'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var editing = this._overlay.editing;

    editing._revert();
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
      Revert,
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
    Revert,
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

      group._removeGroup();
    }
  });

var Locks = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#lock"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Lock Images'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var group = this._overlay;

    group._lockGroup();
  }
});

var Unlocks = L.EditAction.extend({
  initialize: function (map, overlay, options) {
    var href = '<use xlink:href="../assets/icons/symbol/sprite.symbol.svg#unlock"></use>';

    options = options || {};
    options.toolbarIcon = {
      html: '<svg>' + href + '</svg>',
      tooltip: 'Unlock Images'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function () {
    var group = this._overlay;

    group._unlockGroup();
  }
});

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({
  options: {
    actions: [
      Exports,
      Deletes,
      Locks,
      Unlocks
    ]
  },
});

L.distortableImage.controlBar = function (options) {
  return new L.DistortableImage.ControlBar(options);
};

L.DistortableCollection.addInitHook(function () {
  this.ACTIONS = [Exports, Deletes, Locks, Unlocks];

  if (this.options.actions) {
    this.editActions = this.options.actions;
  } else {
    this.editActions = this.ACTIONS;
  }
});

L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
  options: {
    outline: '1px solid red',
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
    var modes = ['distort', 'lock', 'rotate', 'scale', 'rotateScale'];
    this._mode = modes[modes.indexOf(overlay.options.mode)] || 'distort';
    
    this._selected = this._overlay.options.selected || false;
    this._outlined = false;
    this._opacity = 1;

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
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
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

  _revert: function() {
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

    if (this._mode === 'lock') { return; }

    map.removeLayer(this._handles[this._mode]);

    /* Switch mode. */
    if (this._mode === 'rotateScale') { this._mode = 'distort'; } 
    else { this._mode = 'rotateScale'; }

    map.addLayer(this._handles[this._mode]);

    this._showToolbar();
  },

  _toggleScale: function() {
		var map = this._overlay._map;

    if (this._mode === 'lock') { return; }

    map.removeLayer(this._handles[this._mode]);

		if (this._mode === 'scale') { this._mode = 'distort'; }
		else { this._mode = 'scale'; }

    map.addLayer(this._handles[this._mode]);

  },

  _toggleRotate: function() {
		var map = this._overlay._map;

		if (this._mode === 'lock') { return; }

    map.removeLayer(this._handles[this._mode]);
    if (this._mode === 'rotate') { this._mode = 'distort'; } 
		else { this._mode = 'rotate'; }
		
    map.addLayer(this._handles[this._mode]);
  },

  _toggleTransparency: function() {
    var image = this._overlay._image;

    this._opacity = Math.round(this._opacity*10) === 1 ? 1 : this._opacity - 0.3;

    L.DomUtil.setOpacity(image, this._opacity);
    image.setAttribute('opacity', this._opacity);

    this._showToolbar();
  },

  _toggleOutline: function() {
    var image = this._overlay.getElement(),
      opacity,
      outline;

    this._outlined = !this._outlined;
    outline = this._outlined ? this.options.outline : 'none';

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute('opacity', opacity);

    image.style.outline = outline;

    this._showToolbar();
  },

  _sendUp: function() {
    this._overlay.bringToFront();
  },

  _sendDown: function() {
    this._overlay.bringToBack();
  },

  _unlock: function() {
    this._mode = 'distort';
    this._enableDragging();
  },

  _lock: function() {
    this._mode = 'lock';
    if (this.dragging) { this.dragging.disable(); }
    delete this.dragging;
  },

  _toggleLock: function() {
    var map = this._overlay._map;

    map.removeLayer(this._handles[this._mode]);
    /* Switch mode. */
    if (this._mode === 'lock') {
      this._unlock();
    } else {
      this._lock();
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
    if (this._mode !== 'lock') { 
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
    if (this._mode === 'lock') { return; }

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

  _refreshPopupIcons: function() {
    this._addToolbar();
    this._removeToolbar();
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

    if (this._mode === 'lock') { return; }

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

    downloadable.id = downloadable.id || 'tempId12345';
    $('body').append(downloadable);

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

      if (window && window.hasOwnProperty('warpWebGl')) {
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
 * primarily Leaflet 1.5.1 source code. Overriden so that its a selection box with our `L.DistortableCollection` class 
 * instead of a zoom box. 
 * */

L.Map.BoxSelector = L.Map.BoxZoom.extend({
  initialize: function(map) {
    this._map = map;
    this._container = map._container;
    this._pane = map._panes.overlayPane;
    this._resetStateTimeout = 0;
    map.on('unload', this._destroy, this);
  },

  addHooks: function() {
    L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
  },

  removeHooks: function() {
    L.DomEvent.off(this._container, 'mousedown', this._onMouseDown, this);
  },

  moved: function() {
    return this._moved;
  },

  _destroy: function() {
    L.DomUtil.remove(this._pane);
    delete this._pane;
  },

  _resetState: function() {
    this._resetStateTimeout = 0;
    this._moved = false;
  },

  _clearDeferredResetState: function() {
    if (this._resetStateTimeout !== 0) {
      clearTimeout(this._resetStateTimeout);
      this._resetStateTimeout = 0;
    }
  },

  _onMouseDown: function(e) {
    if (!e.shiftKey || (e.which !== 1 && e.button !== 1)) { return false; }

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
    }, this);
  },

  _onMouseMove: function(e) {
    if (!this._moved) {
      this._moved = true;

      this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._container);
      L.DomUtil.addClass(this._container, 'leaflet-crosshair');

      this._map.fire('boxzoomstart');
    }

    this._point = this._map.mouseEventToContainerPoint(e);

    this._bounds = L.bounds(this._startPoint, this._point);
    var size = this._bounds.getSize();

    L.DomUtil.setPosition(this._box, this._bounds.min);

    this._box.style.width = size.x + 'px';
    this._box.style.height = size.y + 'px';
  },

  _finish: function() {
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
    }, this);
  },

  _onMouseUp: function(e) {
    if (e.which !== 1 && e.button !== 1) { return; }

    this._finish();

    if (!this._moved) { return; }
    // Postpone to next JS tick so internal click event handling
    // still see it as "moved".
    this._clearDeferredResetState();
    this._resetStateTimeout = setTimeout(L.Util.bind(this._resetState, this), 0);

    var bounds = new L.latLngBounds(
      this._map.containerPointToLatLng(this._bounds.getBottomLeft()),
      this._map.containerPointToLatLng(this._bounds.getTopRight())
    );

    // calls the `project` method but 1st updates the pixel origin - see https://github.com/publiclab/Leaflet.DistortableImage/pull/344
    bounds = this._map._latLngBoundsToNewLayerBounds(bounds, this._map.getZoom(), this._map.getCenter());

    this._map.fire('boxzoomend', { boxZoomBounds: bounds });
  }
});

L.Map.addInitHook('addHandler', 'boxSelector', L.Map.BoxSelector);
