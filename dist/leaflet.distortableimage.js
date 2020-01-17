L.DomUtil = L.extend(L.DomUtil, {
  initTranslation: function(obj) {
    this.translation = obj;
  },

  getMatrixString: function(m) {
    var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d;

    /*
     * Since matrix3d takes a 4*4 matrix, we add in an empty row and column,
     * which act as the identity on the z-axis.
     * See:
     *     http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
     *     https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#M.C3.B6bius'_homogeneous_coordinates_in_projective_geometry
     */
    var matrix = [
      m[0], m[3], 0, m[6],
      m[1], m[4], 0, m[7],
      0, 0, 1, 0,
      m[2], m[5], 0, m[8],
    ];

    var str = is3d ? 'matrix3d(' + matrix.join(',') + ')' : '';

    if (!is3d) {
      console
          .log('Your browser must support 3D CSS transforms' +
          'in order to use DistortableImageOverlay.');
    }

    return str;
  },

  getRotateString: function(angle, units) {
    var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d;
    var open = 'rotate' + (is3d ? '3d' : '') + '(';
    var rotateString = (is3d ? '0, 0, 1, ' : '') + angle + units;

    return open + rotateString + ')';
  },

  toggleClass: function(el, className) {
    var c = className;
    return this.hasClass(el, c) ?
      this.removeClass(el, c) : this.addClass(el, c);
  },

  confirmDelete: function() {
    return window.confirm(this.translation.confirmImageDelete);
  },

  confirmDeletes: function(n) {
    if (n === 1) {
      this.confirmDelete();
      return;
    }

    var warningMsg = n + ' ' + this.translation.confirmImagesDeletes;

    return window.confirm(warningMsg);
  },
});

L.IconUtil = {
  /* creates an svg elemenet with built in accessibility properties
   * and standardized classes for styling, takes in the fragment
   * identifier (id) of the symbol to reference. note for symplicity
   * we allow providing the icon target with or without the '#' prefix
   */
  create: function(ref) {
    if (/^#/.test(ref)) {
      ref = ref.replace(/^#/, '');
    }

    return (
      '<svg class="ldi-icon ldi-' + ref + '"role="img" focusable="false">' +
      '<use xlink:href="#' + ref + '"></use>' +
      '</svg>'
    );
  },

  addClassToSvg: function(container, loader) {
    var svg = container.querySelector('svg');

    if (svg) {
      L.DomUtil.addClass(svg, loader);
    }
  },

  // finds the use element and toggles its icon reference
  toggleXlink: function(container, ref1, ref2) {
    if (!/^#/.test(ref1)) {
      ref1 = '#' + ref1;
    }
    if (!/^#/.test(ref2)) {
      ref2 = '#' + ref2;
    }

    var use = container.querySelector('use');
    if (use) {
      var toggled = use.getAttribute('xlink:href') === ref1 ? ref2 : ref1;
      use.setAttribute('xlink:href', toggled);
      return toggled;
    }
    return false;
  },

  toggleTitle: function(container, title1, title2) {
    var toggled = container.getAttribute('title') === title1 ? title2 : title1;

    container.setAttribute('title', toggled);
    if (container.hasAttribute('aria-label')) {
      container.setAttribute('aria-label', toggled);
    }
    return toggled;
  },
};

L.ImageUtil = {

  getCmPerPixel: function(overlay) {
    var map = overlay._map;

    var dist = map
        .latLngToLayerPoint(overlay.getCorner(0))
        .distanceTo(map.latLngToLayerPoint(overlay.getCorner(1)));

    return (dist * 100) / overlay.getElement().width;
  },
};

L.MatrixUtil = {

  // Compute the adjugate of m
  adj: function(m) {
    return [
      m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
      m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
      m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3],
    ];
  },

  // multiply two 3*3 matrices
  multmm: function(a, b) {
    var c = [];
    var i;

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
      m[6]*v[0] + m[7]*v[1] + m[8]*v[2],
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
      1, 1, 1,
    ];
    var v = L.MatrixUtil.multmv(L.MatrixUtil.adj(m), [x4, y4, 1]);

    return L.MatrixUtil.multmm(m, [
      v[0], 0, 0,
      0, v[1], 0,
      0, 0, v[2],
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
    var s = L.MatrixUtil
        .basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
    var d = L.MatrixUtil
        .basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
    var m = L.MatrixUtil.multmm(d, L.MatrixUtil.adj(s));

    // Normalize to the unique matrix with m[8] == 1.
    // See: http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/

    return L.MatrixUtil.multsm(1/m[8], m);
  },
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
  },

};

L.Utils = {
  initTranslation: function() {
    var translation = {
      deleteImage: 'Delete Image',
      deleteImages: 'Delete Images',
      distortImage: 'Distort Image',
      dragImage: 'Drag Image',
      exportImage: 'Export Image',
      exportImages: 'Export Images',
      removeBorder: 'Remove Border',
      addBorder: 'Add Border',
      freeRotateImage: 'Free rotate Image',
      geolocateImage: 'Geolocate Image',
      lockMode: 'Lock Mode',
      lockImages: 'Lock Images',
      makeImageOpaque: 'Make Image Opaque',
      makeImageTransparent: 'Make Image Transparent',
      restoreOriginalImageDimensions: 'Restore Original Image Dimensions',
      rotateImage: 'Rotate Image',
      scaleImage: 'Scale Image',
      stackToFront: 'Stack to Front',
      stackToBack: 'Stack to Back',
      unlockImages: 'Unlock Images',
      confirmImageDelete:
        'Are you sure? This image will be permanently deleted from the map.',
      confirmImagesDeletes:
        'images will be permanently deleted from the map. Do you really want to do this?',
    };

    if (!this.options.translation) {
      this.options.translation = translation;
    } else {
      // If the translation for a word is not specified, fallback to English.
      for (var key in translation) {
        if (!this.options.translation.hasOwnProperty(key)) {
          this.options.translation[key] = translation[key];
        }
      }
    }

    L.DomUtil.initTranslation(this.options.translation);
  },

  getNestedVal: function(obj, key, nestedKey) {
    var dig = [key, nestedKey];
    return dig.reduce(function(obj, k) {
      return obj && obj[k];
    }, obj);
  },
};

L.DistortableImageOverlay = L.ImageOverlay.extend({

  options: {
    height: 200,
    crossOrigin: true,
    // todo: find ideal number to prevent distortions during RotateScale, and make it dynamic (remove hardcoding)
    edgeMinWidth: 50,
    editable: true,
    mode: 'distort',
    selected: false,
  },

  initialize: function(url, options) {
    L.setOptions(this, options);
    L.Utils.initTranslation.call(this);

    this.edgeMinWidth = this.options.edgeMinWidth;
    this.editable = this.options.editable;
    this._selected = this.options.selected;
    this._url = url;
    this.rotation = 0;
    // window.rotation = this.rotation;
  },

  onAdd: function(map) {
    this._map = map;
    if (!this._image) { this._initImage(); }

    map.on('viewreset', this._reset, this);

    if (this.options.corners) {
      this._corners = this.options.corners;
      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
      }
    }

    // Have to wait for the image to load because need to access its w/h
    L.DomEvent.on(this._image, 'load', function() {
      this.getPane().appendChild(this._image);
      this._initImageDimensions();
      this._reset();
      /* Initialize default corners if not already set */
      if (!this._corners) {
        if (map.options.zoomAnimation && L.Browser.any3d) {
          map.on('zoomanim', this._animateZoom, this);
        }
      }
      /** if there is a featureGroup, only its editable option matters */
      var eventParents = this._eventParents;
      if (eventParents) {
        this.eP = eventParents[Object.keys(eventParents)[0]];
        if (this.eP.editable) { this.editing.enable(); }
      } else {
        if (this.editable) { this.editing.enable(); }
        this.eP = false;
      }
    }, this);

    L.DomEvent.on(this._image, 'click', this.select, this);
    L.DomEvent.on(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
    }, this);

    /**
     * custom events fired from DoubleClickLabels.js. Used to differentiate
     * single / dblclick to not deselect images on map dblclick.
     */
    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.on(map, 'click', this.deselect, this);
    }

    this.fire('add');
  },

  onRemove: function(map) {
    L.DomEvent.off(this._image, 'click', this.select, this);
    L.DomEvent.off(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
    }, this);
    L.DomEvent.off(map, 'click', this.deselect, this);

    if (this.editing) { this.editing.disable(); }
    this.fire('remove');

    L.ImageOverlay.prototype.onRemove.call(this, map);
  },

  _initImageDimensions: function() {
    var map = this._map;
    var originalImageWidth = L.DomUtil.getStyle(this._image, 'width');
    var originalImageHeight = L.DomUtil.getStyle(this._image, 'height');
    var aspectRatio =
        parseInt(originalImageWidth) / parseInt(originalImageHeight);
    var imageHeight = this.options.height;
    var imageWidth = parseInt(aspectRatio * imageHeight);
    var center = map.latLngToContainerPoint(map.getCenter());
    var offset = L.point(imageWidth, imageHeight).divideBy(2);

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
        map.containerPointToLatLng(center.add(offset)),
      ];
    }

    this.setBounds(L.latLngBounds(this._corners));

    this._initialDimensions = {
      'height': imageHeight,
      'width': imageWidth,
      'offset': offset,
    };
  },

  _singleClick: function(e) {
    if (e.type === 'singleclick') { this.deselect(); }
    else { return; }
  },

  _singleClickListeners: function() {
    var map = this._map;
    L.DomEvent.off(map, 'click', this.deselect, this);
    L.DomEvent.on(map, 'singleclick', this.deselect, this);
  },

  _resetClickListeners: function() {
    var map = this._map;
    L.DomEvent.on(map, 'click', this.deselect, this);
    L.DomEvent.off(map, 'singleclick', this.deselect, this);
  },

  isSelected: function() {
    return this._selected;
  },

  deselect: function() {
    var edit = this.editing;
    if (!edit.enabled() || !this.isSelected()) { return false; }

    edit._removeToolbar();
    if (edit._mode !== 'lock') {
      edit._hideMarkers();
    }

    this._selected = false;
    return this;
  },

  select: function(e) {
    var edit = this.editing;

    if (e) { L.DomEvent.stopPropagation(e); }
    if (!edit.enabled()) { return false; }

    // this ensures deselection of all other images, allowing us to keep collection group optional
    this._programmaticGrouping();

    this._selected = true;
    edit._addToolbar();
    edit._showMarkers();

    // we run the selection logic 1st anyway because the collection group's _addToolbar method depends on it
    if (L.DomUtil.hasClass(this._image, 'collected')) {
      this.deselect();
      return false;
    }

    return this;
  },

  _programmaticGrouping: function() {
    this._map.eachLayer(function(layer) {
      if (layer instanceof L.DistortableImageOverlay) {
        layer.deselect();
      }
    });
  },

  setCorner: function(corner, latlng) {
    var edit = this.editing;

    this._corners[corner] = latlng;

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    return this;
  },

  _cornerExceedsMapLats: function(zoom, corner, map) {
    var exceedsTop;
    var exceedsBottom;
    if (zoom === 0) {
      exceedsTop = map.project(corner).y < 2;
      exceedsBottom = map.project(corner).y >= 255;
    } else {
      exceedsTop = map.project(corner).y / zoom < 2;
      exceedsBottom = map.project(corner).y / Math.pow(2, zoom) >= 255;
    }
    return (exceedsTop || exceedsBottom);
  },

  setCorners: function(latlngObj) {
    var map = this._map;
    var zoom = map.getZoom();
    var edit = this.editing;
    var i = 0;

    // this is to fix https://github.com/publiclab/Leaflet.DistortableImage/issues/402
    for (var k in latlngObj) {
      if (this._cornerExceedsMapLats(zoom, latlngObj[k], map)) {
        // calling reset / update w/ the same corners bc it prevents a marker flicker for rotate
        this.setBounds(L.latLngBounds(this.getCorners()));
        this.fire('update');
        return;
      }
    }

    for (k in latlngObj) {
      this._corners[i] = latlngObj[k];
      i += 1;
    }

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    return this;
  },

  setCornersFromPoints: function(pointsObj) {
    var map = this._map;
    var zoom = map.getZoom();
    var edit = this.editing;
    var i = 0;

    for (var k in pointsObj) {
      var corner = map.layerPointToLatLng(pointsObj[k]);

      if (this._cornerExceedsMapLats(zoom, corner, map)) {
        // calling reset / update w/ the same corners bc it prevents a marker flicker for rotate
        this.setBounds(L.latLngBounds(this.getCorners()));
        this.fire('update');
        return;
      }
    }

    for (k in pointsObj) {
      this._corners[i] = map.layerPointToLatLng(pointsObj[k]);
      i += 1;
    }

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    return this;
  },

  getAngle: function() {
    var matrix = L.DomUtil.getStyle(this._image, 'transform')
        .split('matrix3d')[1]
        .slice(1, -1)
        .split(',');

    var row0x = matrix[0];
    var row0y = matrix[1];
    var row1x = matrix[4];
    var row1y = matrix[5];

    var determinant = row0x * row1y - row0y * row1x;

    var angle = Math.atan2(row0y, row0x) * (180 / Math.PI);

    if (determinant < 0) {
      angle += angle < 0 ? 180 : -180;
    }

    if (angle < 0) {
      angle = 360 + angle;
    }

    return angle;
  },

  scaleBy: function(scale) {
    var map = this._map;
    var center = map.project(this.getCenter());
    var i;
    var p;
    var scaledCorners = {};

    if (scale === 0) { return; }

    for (i = 0; i < 4; i++) {
      p = map
          .project(this.getCorner(i))
          .subtract(center)
          .multiplyBy(scale)
          .add(center);
      scaledCorners[i] = map.unproject(p);
    }

    this.setCorners(scaledCorners);

    return this;
  },

  setAngle: function(angleInDeg) {
    var currentAngleInDeg = this.getAngle();
    var angleToRotateByInDeg = angleInDeg - currentAngleInDeg;

    var angleInRad = L.TrigUtil.degreesToRadians(angleToRotateByInDeg);
    this.rotateBy(angleInRad);

    return this;
  },

  rotateBy: function(angle) {
    var map = this._map;
    var center = map.project(this.getCenter());
    var corners = {};
    var i;
    var p;
    var q;

    for (i = 0; i < 4; i++) {
      p = map.project(this.getCorner(i)).subtract(center);
      q = L.point(
          Math.cos(angle) * p.x - Math.sin(angle) * p.y,
          Math.sin(angle) * p.x + Math.cos(angle) * p.y
      );
      corners[i] = map.unproject(q.add(center));
    }

    this.setCorners(corners);

    // window.angle = L.TrigUtil.radiansToDegrees(angle);

    this.rotation -= L.TrigUtil.radiansToDegrees(angle);

    return this;
  },

  dragBy: function(formerPoint, newPoint) {
    var map = this._map;
    var i;
    var p;
    var transCorners = {};
    var delta = map.project(formerPoint).subtract(map.project(newPoint));

    for (i = 0; i < 4; i++) {
      p = map.project(this.getCorner(i)).subtract(delta);
      transCorners[i] = map.unproject(p);
    }

    this.setCorners(transCorners);
  },

  _revert: function() {
    var a = this.rotation;
    var map = this._map;
    var edit = this.editing;
    var center = map.project(this.getCenter());
    var offset = this._initialDimensions.offset;
    var corners = {
      0: map.unproject(center.subtract(offset)),
      1: map.unproject(center.add(L.point(offset.x, -offset.y))),
      2: map.unproject(center.add(L.point(-offset.x, offset.y))),
      3: map.unproject(center.add(offset)),
    };

    map.removeLayer(edit._handles[edit._mode]);

    this.setCorners(corners);

    if (a !== 0) { this.rotateBy(L.TrigUtil.degreesToRadians(360 - a)); }

    map.addLayer(edit._handles[edit._mode]);

    this.rotation = a;
  },

  /* Copied from Leaflet v0.7 https://github.com/Leaflet/Leaflet/blob/66282f14bcb180ec87d9818d9f3c9f75afd01b30/src/dom/DomUtil.js#L189-L199 */
  /* since L.DomUtil.getTranslateString() is deprecated in Leaflet v1.0 */
  _getTranslateString: function(point) {
    // on WebKit browsers (Chrome/Safari/iOS Safari/Android)
    // using translate3d instead of translate
    // makes animation smoother as it ensures HW accel is used.
    // Firefox 13 doesn't care
    // (same speed either way), Opera 12 doesn't support translate3d

    var is3d = L.Browser.webkit3d;
    var open = 'translate' + (is3d ? '3d' : '') + '(';
    var close = (is3d ? ',0' : '') + ')';

    return open + point.x + 'px,' + point.y + 'px' + close;
  },

  _reset: function() {
    var map = this._map;
    var image = this._image;
    var latLngToLayerPoint = L.bind(map.latLngToLayerPoint, map);
    var transformMatrix = this
        ._calculateProjectiveTransform(latLngToLayerPoint);
    var topLeft = latLngToLayerPoint(this.getCorner(0));
    var warp = L.DomUtil.getMatrixString(transformMatrix);
    var translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');

    /* Set origin to the upper-left corner rather than
     * the center of the image, which is the default.
     */
    image.style[L.DomUtil.TRANSFORM + '-origin'] = '0 0 0';
  },

  /*
   * Calculates the transform string that will be
   * correct *at the end* of zooming.
   * Leaflet then generates a CSS3 animation between the current transform and
   * future transform which makes the transition appear smooth.
   */
  _animateZoom: function(event) {
    var map = this._map;
    var image = this._image;
    var latLngToNewLayerPoint = function(latlng) {
      return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
    };
    var transformMatrix = this._calculateProjectiveTransform(
        latLngToNewLayerPoint
    );
    var topLeft = latLngToNewLayerPoint(this.getCorner(0));
    var warp = L.DomUtil.getMatrixString(transformMatrix);
    var translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
  },

  getCorners: function() {
    return this._corners;
  },

  getCorner: function(i) {
    return this._corners[i];
  },

  // image (vertex) centroid calculation
  getCenter: function() {
    var map = this._map;
    var reduce = this.getCorners().reduce(function(agg, corner) {
      return agg.add(map.project(corner));
    }, L.point(0, 0));
    return map.unproject(reduce.divideBy(4));
  },

  _calcCenterTwoCornerPoints: function(topLeft, topRight) {
    var toolPoint = {x: '', y: ''};

    toolPoint.x = topRight.x + (topLeft.x - topRight.x) / 2;
    toolPoint.y = topRight.y + (topLeft.y - topRight.y) / 2;

    return toolPoint;
  },

  _calculateProjectiveTransform: function(latLngToCartesian) {
    /* Setting reasonable but made-up image defaults
     * allow us to place images on the map before
     * they've finished downloading. */
    var offset = latLngToCartesian(this._corners[0]);
    var w = this._image.offsetWidth || 500;
    var h = this._image.offsetHeight || 375;
    var c = [];
    var j;
    /* Convert corners to container points (i.e. cartesian coordinates). */
    for (j = 0; j < this._corners.length; j++) {
      c.push(latLngToCartesian(this._corners[j])._subtract(offset));
    }

    /*
     * This matrix describes the action of
     * the CSS transform on each corner of the image.
     * It maps from the coordinate system centered
     * at the upper left corner of the image
     * to the region bounded by the latlngs in this._corners.
     * For example:
     * 0, 0, c[0].x, c[0].y
     * says that the upper-left corner of the image
     * maps to the first latlng in this._corners.
     */
    return L.MatrixUtil.general2DProjection(
        0, 0, c[0].x, c[0].y,
        w, 0, c[1].x, c[1].y,
        0, h, c[2].x, c[2].y,
        w, h, c[3].x, c[3].y
    );
  },
});

L.distortableImageOverlay = function(id, options) {
  return new L.DistortableImageOverlay(id, options);
};

L.Map.addInitHook(function() {
  if (!L.DomUtil.hasClass(this.getContainer(), 'ldi')) {
    L.DomUtil.addClass(this.getContainer(), 'ldi');
  }
});

L.DistortableCollection = L.FeatureGroup.extend({
  options: {
    editable: true,
    exportOpts: {
      exportStartUrl: '//export.mapknitter.org/export',
      statusUrl: '//export.mapknitter.org',
      exportUrl: 'http://export.mapknitter.org/',
    },
  },

  initialize: function(options) {
    L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, options);
    L.Utils.initTranslation.call(this);

    this.editable = this.options.editable;
  },

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    if (this.editable) { this.editing.enable(); }

    /**
     * although we have a DistortableCollection.Edit class that handles collection events to keep our code managable,
     * events that need to be added on individual images are kept here to do so through `layeradd`.
     */
    this.on('layeradd', this._addEvents, this);
    this.on('layerremove', this._removeEvents, this);
  },

  onRemove: function() {
    if (this.editing) { this.editing.disable(); }

    this.off('layeradd', this._addEvents, this);
    this.off('layerremove', this._removeEvents, this);
  },

  _addEvents: function(e) {
    var layer = e.layer;

    L.DomEvent.on(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.on(layer._image, {
      mousedown: this._deselectOthers,
      /* Enable longpress for multi select for touch devices. */
      contextmenu: this._longPressMultiSelect,
    }, this);
  },

  _removeEvents: function(e) {
    var layer = e.layer;

    L.DomEvent.off(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.off(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect,
    }, this);
  },

  _longPressMultiSelect: function(e) {
    if (!this.editable) { return; }

    e.preventDefault();

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (layer.getElement() === e.target && edit.enabled()) {
        L.DomUtil.toggleClass(layer.getElement(), 'collected');
        if (this.anyCollected()) {
          layer.deselect();
          this.editing._addToolbar();
        } else {
          this.editing._removeToolbar();
        }
      }
    }, this);
  },

  isCollected: function(overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), 'collected');
  },

  anyCollected: function() {
    var layerArr = this.getLayers();
    return layerArr.some(this.isCollected.bind(this));
  },

  _toggleCollected: function(e, layer) {
    if (e.shiftKey) {
      /* conditional prevents disabled images from flickering multi-select mode */
      if (layer.editing.enabled()) {
        L.DomUtil.toggleClass(e.target, 'collected');
      }
    }

    if (this.anyCollected()) { layer.deselect(); }
    else { this.editing._removeToolbar(); }
  },

  _deselectOthers: function(e) {
    if (!this.editable) { return; }

    this.eachLayer(function(layer) {
      if (layer.getElement() !== e.target) {
        layer.deselect();
      } else {
        this._toggleCollected(e, layer);
      }
    }, this);

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  _dragStartMultiple: function(e) {
    var overlay = e.target;
    var map = this._map;
    var i;

    if (!this.isCollected(overlay)) { return; }

    this.eachLayer(function(layer) {
      layer._dragStartPoints = {};
      layer.deselect();
      for (i = 0; i < 4; i++) {
        var c = layer.getCorner(i);
        layer._dragStartPoints[i] = map.latLngToLayerPoint(c);
      }
    });
  },

  _dragMultiple: function(e) {
    var overlay = e.target;
    var map = this._map;

    if (!this.isCollected(overlay)) { return; }

    var topLeft = map.latLngToLayerPoint(overlay.getCorner(0));
    var delta = overlay._dragStartPoints[0].subtract(topLeft);

    this._updateCollectionFromPoints(delta, overlay);
  },

  _toRemove: function() {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var mode = layer.editing._mode;
      return (this.isCollected(layer) && mode !== 'lock');
    }, this);
  },

  _toMove: function(overlay) {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var mode = layer.editing._mode;
      return layer !== overlay && this.isCollected(layer) && mode !== 'lock';
    }, this);
  },

  _updateCollectionFromPoints: function(delta, overlay) {
    var layersToMove = this._toMove(overlay);
    var p = new L.Transformation(1, -delta.x, 1, -delta.y);
    var i;

    layersToMove.forEach(function(layer) {
      var movedPoints = {};
      for (i = 0; i < 4; i++) {
        movedPoints[i] = p.transform(layer._dragStartPoints[i]);
      }
      layer.setCornersFromPoints(movedPoints);
    });
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
      if (this.isCollected(layer)) {
        var sections = layer._image.src.split('/');
        var filename = sections[sections.length-1];
        var zc = layer.getCorners();
        var corners = [
          {lat: zc[0].lat, lon: zc[0].lng},
          {lat: zc[1].lat, lon: zc[1].lng},
          {lat: zc[3].lat, lon: zc[3].lng},
          {lat: zc[2].lat, lon: zc[2].lng},
        ];
        json.images.push({
          id: this.getLayerId(layer),
          src: layer._image.src,
          width: layer._image.width,
          height: layer._image.height,
          image_file_name: filename,
          nodes: corners,
          cm_per_pixel: L.ImageUtil.getCmPerPixel(layer),
        });
      }
    }, this);

    json.images = json.images.reverse();
    json.avg_cm_per_pixel = this._getAvgCmPerPixel(json.images);

    return json;
  },
});

L.distortableCollection = function(id, options) {
  return new L.DistortableCollection(id, options);
};

/* eslint-disable no-unused-vars */
L.EXIF = function getEXIFdata(img) {
  if (Object.keys(EXIF.getAllTags(img)).length !== 0) {
    console.log(EXIF.getAllTags(img));
    var GPS = EXIF.getAllTags(img);
    var altitude;

    /* If the lat/lng is available. */
    if (
      typeof GPS.GPSLatitude !== 'undefined' &&
      typeof GPS.GPSLongitude !== 'undefined'
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

      if (GPS.GPSLatitudeRef !== 'N') {
        lat = lat * -1;
      }
      if (GPS.GPSLongitudeRef === 'W') {
        lng = lng * -1;
      }
    }

    // Attempt to use GPS compass heading; will require
    // some trig to calc corner points, which you can find below:

    var angle = 0;
    // "T" refers to "True north", so -90.
    if (GPS.GPSImgDirectionRef === 'T') {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
      // "M" refers to "Magnetic north"
    } else if (GPS.GPSImgDirectionRef === 'M') {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    } else {
      console.log('No compass data found');
    }

    console.log('Orientation:', GPS.Orientation);

    /* If there is orientation data -- i.e. landscape/portrait etc */
    if (GPS.Orientation === 6) {
      // CCW
      angle += (Math.PI / 180) * -90;
    } else if (GPS.Orientation === 8) {
      // CW
      angle += (Math.PI / 180) * 90;
    } else if (GPS.Orientation === 3) {
      // 180
      angle += (Math.PI / 180) * 180;
    }

    /* If there is altitude data */
    if (
      typeof GPS.GPSAltitude !== 'undefined' &&
      typeof GPS.GPSAltitudeRef !== 'undefined'
    ) {
      // Attempt to use GPS altitude:
      // (may eventually need to find EXIF field of view for correction)
      if (
        typeof GPS.GPSAltitude !== 'undefined' &&
        typeof GPS.GPSAltitudeRef !== 'undefined'
      ) {
        altitude =
          GPS.GPSAltitude.numerator / GPS.GPSAltitude.denominator +
          GPS.GPSAltitudeRef;
      } else {
        altitude = 0; // none
      }
    }
  } else {
    alert('EXIF initialized. Press again to view data in console.');
  }
};

L.EditHandle = L.Marker.extend({
  initialize: function(overlay, corner, options) {
    var latlng = overlay.getCorner(corner);

    L.setOptions(this, options);

    this._handled = overlay;
    this._corner = corner;

    var markerOptions = {
      draggable: true,
      zIndexOffset: 10,
    };

    if (options && options.hasOwnProperty('draggable')) {
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
    this._handled.fire('editstart');
  },

  _onHandleDragEnd: function() {
    this._fireEdit();
  },

  _fireEdit: function() {
    this._handled.edited = true;
    this._handled.fire('edit');
  },

  _bindListeners: function() {
    this.on({
      contextmenu: L.DomEvent.stop,
      dragstart: this._onHandleDragStart,
      drag: this._onHandleDrag,
      dragend: this._onHandleDragEnd,
    }, this);

    this._handled._map.on('zoomend', this.updateHandle, this);
    this._handled.on('update', this.updateHandle, this);
  },

  _unbindListeners: function() {
    this.off({
      contextmenu: L.DomEvent.stop,
      dragstart: this._onHandleDragStart,
      drag: this._onHandleDrag,
      dragend: this._onHandleDragEnd,
    }, this);

    this._handled._map.off('zoomend', this.updateHandle, this);
    this._handled.off('update', this.updateHandle, this);
  },

  /* Takes two latlngs and calculates the scaling difference. */
  _calculateScalingFactor: function(latlngA, latlngB) {
    var overlay = this._handled;
    var map = overlay._map;

    var centerPoint = map.latLngToLayerPoint(overlay.getCenter());
    var formerPoint = map.latLngToLayerPoint(latlngA);
    var newPoint = map.latLngToLayerPoint(latlngB);
    var formerRadiusSquared = this._d2(centerPoint, formerPoint);
    var newRadiusSquared = this._d2(centerPoint, newPoint);

    return Math.sqrt(newRadiusSquared / formerRadiusSquared);
  },

  /* Distance between two points in cartesian space, squared (distance formula). */
  _d2: function(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;

    return Math.pow(dx, 2) + Math.pow(dy, 2);
  },

  /* Takes two latlngs and calculates the angle between them. */
  calculateAngleDelta: function(latlngA, latlngB) {
    var overlay = this._handled;
    var map = overlay._map;

    var centerPoint = map.latLngToLayerPoint(overlay.getCenter());
    var formerPoint = map.latLngToLayerPoint(latlngA);
    var newPoint = map.latLngToLayerPoint(latlngB);

    var initialAngle = (
      Math.atan2(centerPoint.y - formerPoint.y, centerPoint.x - formerPoint.x)
    );
    var newAngle = (
      Math.atan2(centerPoint.y - newPoint.y, centerPoint.x - newPoint.x)
    );

    return newAngle - initialAngle;
  },
});

L.DistortHandle = L.EditHandle.extend({
  options: {
    TYPE: 'distort',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;

    overlay.setCorner(this._corner, this.getLatLng());
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.distortHandle = function(overlay, idx, options) {
  return new L.DistortHandle(overlay, idx, options);
};

L.DragHandle = L.EditHandle.extend({
  options: {
    TYPE: 'drag',
    icon: L.icon({
      // eslint-disable-next-line max-len
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAsVJREFUeNrMVztLXEEUvnNVFAVBAhY2aRKbTZEHJNpYabuNjSgYg/GxdsmPSJkUAa/ZdVEX8mgWYVutbHxAHkVskjQBuUUgBISVhCQk3wnfwMlk1rusN1wHPubOzJlzvjlz5sxc01Ma/hUEwQnwDIjqc7uvgv9YYO86qgIwCXQbdNTlQ8kcCBHgBch8TcloF6oJGr6phk6EQAkfdz3zvgDr9Mr7Fg1fptEZoM8jsmrokpfsiIFO4IIjuE2v1EDmR4LRdlR5Gh51hj8D34ABtm8YTtqna0TgklIw5CgQguKxIojEjmFROg/MKQO27NkFAB+4wAPouGUJiIvWKHwbAxX2XyWRKWkqhT+pbJntJZJuUzISW0+5hW+obxrVBsfvoH/dqCCJuU97GBh2VteLSiYvArmErT8EVoAK9Bw7enbpVYmvAQlyowYforrH5jXL2rPHI/TKONDB7u9AlavdaTBPvPmazUeQuy8f7UomUgTEwIJPEQ3sQGE/6ll2l9H/KcEzBcfWn2IclluM3DpddJxSHujlFkscbUPvmB0LHVnLrId7nlaZVkEc6QGXQI1MAwZcWmVRHeNaQwJMMiU2cwy4s7p/RJ2ckpvIQs+cIs+5GzitloLKHUV3MPREuXbTOKO91dX387gGTONxIgEWm+E61FFrpcyqXLHsEwiDjEsjAksqw5XPoL9MHVrn6QR4q+XZrDaR4RoWzq2ymafuRA/Mq1stSsHLVkcbdf9VjOcx8ZH3+SFWcCWlVPyWuUBOwUWdC1wP5NVjYiXFWLO69PZ6CRTUY6KSIoEKdf6T3IzzgHxnsyHctNBEkmn6Oob8ExUDg/ahGybd177cDjzH5xHwgDiSvoS7I/LZyvxJZj0wod7tkX5G0XVC7rEyLhfLJjBGbKoLLEfZWObyKeZ6oY82g+yf5Zn/mJyHX7PMf04z/T3/LcAAu4E6iiyJqf0AAAAASUVORK5CYII=',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();

    overlay.dragBy(formerLatLng, newLatLng);
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.FreeRotateHandle = L.EditHandle.extend({
  options: {
    TYPE: 'freeRotate',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var map = overlay._map;
    var edgeMinWidth = overlay.edgeMinWidth;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();
    var angle = this.calculateAngleDelta(formerLatLng, newLatLng);
    var scale = this._calculateScalingFactor(formerLatLng, newLatLng);

    if (angle !== 0) { overlay.rotateBy(angle); }

    if (!edgeMinWidth) { edgeMinWidth = 50; } /* just in case */
    var corner1 = map.latLngToContainerPoint(overlay.getCorner(0));
    var corner2 = map.latLngToContainerPoint(overlay.getCorner(1));
    var w = Math.abs(corner1.x - corner2.x);
    var h = Math.abs(corner1.y - corner2.y);
    var distance = Math.sqrt(w * w + h * h);
    if (distance > edgeMinWidth || scale > 1) {
      overlay.scaleBy(scale);
    } else {
      overlay.scaleBy(1);
    }
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.LockHandle = L.EditHandle.extend({
  options: {
    TYPE: 'lock',
    icon: L.icon({
      // eslint-disable-next-line max-len
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAD8SURBVO3BPU7CYAAA0AdfjIcQlRCQBG7C3gk2uIPG2RC3Dk16Gz0FTO1WZs/gwGCMP/2+xsSl7+n1er1Iz9LtRQjaPeMeO+TinLDCJV78YqjdA04YodKuxhUaPGoRxMmxwRQZSt87Yo4KExGCeAUyLLFB4bMacxywEClIU2KDKXbInTUYo8JCgoFuGoxQO5uiwY1EA91VmDqrcKeDoX8WdNNgjApvmGGLXKIgXY0xGkxQYItrrFFIEKQ5Yo4KEx9yrDFDhlKkIF6NOQ5Y+KpAhiXWKEQI4pxwiwoLPyuxwQw75FoE7fZYocFEuwI7jHCBV39gL92TXq/Xi/AOcmczZmaIMScAAAAASUVORK5CYII=',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  onRemove: function(map) {
    this.unbindTooltip();
    L.EditHandle.prototype.onRemove.call(this, map);
  },

  _bindListeners: function() {
    var icon = this.getElement();

    L.EditHandle.prototype._bindListeners.call(this);

    L.DomEvent.on(icon, {
      mousedown: this._tooltipOn,
      mouseup: this._tooltipOff,
    }, this);

    L.DomEvent.on(document, 'pointerleave', this._tooltipOff, this);
  },

  _unbindListeners: function() {
    var icon = this.getElement();

    L.EditHandle.prototype._bindListeners.call(this);

    L.DomEvent.off(icon, {
      mousedown: this._tooltipOn,
      mouseup: this._tooltipOff,
    }, this);

    L.DomEvent.off(document, 'pointerleave', this._tooltipOff, this);
  },

  /* cannot be dragged */
  _onHandleDrag: function() {
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },

  _tooltipOn: function(e) {
    if (e.shiftKey) { return; }

    var handlesArr = this._handled.editing._lockHandles;

    this._timer = setTimeout(L.bind(function() {
      if (this._timeout) { clearTimeout(this._timeout); }

      if (!this.getTooltip()) {
        this.bindTooltip('Locked!', {permanent: true});
      } else {
        handlesArr.eachLayer(function(handle) {
          if (this !== handle) { handle.closeTooltip(); }
        });
      }

      this.openTooltip();
    }, this), 500);
  },

  _tooltipOff: function(e) {
    if (e.shiftKey) { return; }

    var handlesArr = this._handled.editing._lockHandles;

    if (e.currentTarget === document) {
      handlesArr.eachLayer(function(handle) {
        handle.closeTooltip();
      });
    }

    if (this._timer) { clearTimeout(this._timer); }

    this._timeout = setTimeout(L.bind(function() {
      this.closeTooltip();
    }, this), 400);
  },
});

L.lockHandle = function(overlay, idx, options) {
  return new L.LockHandle(overlay, idx, options);
};

L.RotateHandle = L.EditHandle.extend({
  options: {
    TYPE: 'rotate',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAHiSURBVMXBa3HbShgA0PMp/1sCCo8oCEpgTaCXgIXAJiDzyCJoAUTm4UVQAns1Y8+snWnTvJyeE16hkjDgDrfoNTMKcpC9UPiLSo8JyetkjEHxjPCMyoS199kFoz8Iv1HpMaN3qWDCHoegOKkkRwnJpRmroHgiPFEZ8IBekzEGxQtUEhKSS/fB7Ew4U+lxcGkVZG9QWWPSFAxBcdK59KApuA+yNwp2uEdx1GN25sZJZULSfAtm77SlbNjju6MvG75u+WHRWVR6rDVjMPsgwYyVZl3pLTpHkyYHOx8syMiayaJzlDTZ9YyaZNFVkiYH2ZUEBcVJJXVImuz6Js3Qofe59pq7DoOTILu+g+a288mCouk7/1iH4qTS+2QdDppbV1ZJmrnDXnPnc5UOs2Z0fUmTuyBr+krvSioJyUmQO0dZM7mepMkWnaNRkyrJB6uskTSjxY3Fll8bvmJwlDb83FJ8gMqAB80uyBY3Trb82PAfvjj6vuHnluIdKgMeNXOwctK5NKBoHitrb1RJeHRp5Ux4ojLg0aWMHGQvUOkxIWkKVsHsTPiNSo8HDC5lZIsgO6n0uMUdRvQuFQxB8UR4RmXC2vvsgtEfhL+o9JiQvE7GGBTPCK9QSUjoMWgKDthjDrIX+h/k0I7gth6N5gAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();
    var angle = this.calculateAngleDelta(formerLatLng, newLatLng);

    /*
     * running rotation logic even for an angle delta of 0
     * prevents a small, occasional marker flicker
     */
    overlay.rotateBy(angle);
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.rotateHandle = function(overlay, idx, options) {
  return new L.RotateHandle(overlay, idx, options);
};

L.ScaleHandle = L.EditHandle.extend({
  options: {
    TYPE: 'scale',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0NTkiIGhlaWdodD0iNDY0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iIj48cmVjdCBpZD0iYmFja2dyb3VuZHJlY3QiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHg9IjAiIHk9IjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgY2xhc3M9IiIgc3R5bGU9IiIvPjxnIGNsYXNzPSJjdXJyZW50TGF5ZXIiIHN0eWxlPSIiPjx0aXRsZT5MYXllciAxPC90aXRsZT48cGF0aCBkPSJNNDU5LjA0OTE1OTUzMDQ3MTM0LDg2LjkyNjIzNDUxMjU1MDAyIFYwIGgtODUuNzE0NTczMzU2MzEyMDkgdjI3LjA0MzcxNzQwMzkwNDQ1MiBIODUuNzE0NTczMzU2MzEyMDMgVjAgSDAgdjg2LjkyNjIzNDUxMjU1MDAyIGgyNS43MTQzNzIwMDY4OTM2MjYgdjI4OS43NTQxMTUwNDE4MzM0IEgwIHY4Ni45MjYyMzQ1MTI1NTAwMiBoODUuNzE0NTczMzU2MzEyMDkgdi0yNy4wNDM3MTc0MDM5MDQ0NTIgaDI4NS43MTUyNDQ1MjEwNDAzIHYyNy4wNDM3MTc0MDM5MDQ0NTIgaDg1LjcxNDU3MzM1NjMxMjA5IHYtODYuOTI2MjM0NTEyNTUwMDIgaC0yMy44MDk2MDM3MTAwODY2OSBWODYuOTI2MjM0NTEyNTUwMDIgSDQ1OS4wNDkxNTk1MzA0NzEzNCB6TTM4NC43NjMxOTU5NTUwMDA5LDEyLjU1NjAxMTY1MTgxMjc4MSBoNjEuOTA0OTY5NjQ2MjI1Mzk2IHY2Mi43ODAwNTgyNTkwNjM5MSBoLTYxLjkwNDk2OTY0NjIyNTM5NiBWMTIuNTU2MDExNjUxODEyNzgxIHpNMTIuMzgwOTkzOTI5MjQ1MDUsMTIuNTU2MDExNjUxODEyNzgxIGg2MS45MDQ5Njk2NDYyMjUzOTYgdjYyLjc4MDA1ODI1OTA2MzkxIEgxMi4zODA5OTM5MjkyNDUwNSBWMTIuNTU2MDExNjUxODEyNzgxIHpNNzQuMjg1OTYzNTc1NDcwNTMsNDUxLjA1MDU3MjQxNTEyMDY2IEgxMi4zODA5OTM5MjkyNDUwNSB2LTYyLjc4MDA1ODI1OTA2MzkxIGg2MS45MDQ5Njk2NDYyMjUzOTYgVjQ1MS4wNTA1NzI0MTUxMjA2NiB6TTQ0NS43MTU3ODE0NTI4MjI3NCw0NTEuMDUwNTcyNDE1MTIwNjYgaC02Mi44NTczNTM3OTQ2Mjg4NjQgdi02Mi43ODAwNTgyNTkwNjM5MSBoNjIuODU3MzUzNzk0NjI4ODY0IFY0NTEuMDUwNTcyNDE1MTIwNjYgek00MDcuNjIwNDE1NTE2Njg0MjYsMzc2LjY4MDM0OTU1NDM4MzQ0IGgtMzYuMTkwNTk3NjM5MzMxNzcgdjMyLjgzODc5OTcwNDc0MTEyIEg4NS43MTQ1NzMzNTYzMTIwMyB2LTMyLjgzODc5OTcwNDc0MTEyIEg0OS41MjM5NzU3MTY5ODAzMiBWODYuOTI2MjM0NTEyNTUwMDIgaDM2LjE5MDU5NzYzOTMzMTc3IFY1MC4yMjQwNDY2MDcyNTExMjUgaDI4Ny42MjAwMTI4MTc4NDcyIHYzNi43MDIxODc5MDUyOTg5IGgzNC4yODU4MjkzNDI1MjQ4MzUgVjM3Ni42ODAzNDk1NTQzODM0NCB6IiBpZD0ic3ZnXzIiIGNsYXNzPSIiIGZpbGw9IiMxYTFhZWIiIGZpbGwtb3BhY2l0eT0iMSIvPjwvZz48L3N2Zz4=',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var map = overlay._map;
    var edgeMinWidth = overlay.edgeMinWidth;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();
    var scale = this._calculateScalingFactor(formerLatLng, newLatLng);

    /*
     * checks whether the "edgeMinWidth" property is set and tracks the minimum edge length;
     * this enables preventing scaling to zero, but we might also add an overall scale limit
     */

    if (!edgeMinWidth) { edgeMinWidth = 50; } /* just in case */
    var corner1 = map.latLngToLayerPoint(overlay.getCorner(0));
    var corner2 = map.latLngToLayerPoint(overlay.getCorner(1));
    var w = Math.abs(corner1.x - corner2.x);
    var h = Math.abs(corner1.y - corner2.y);
    var distance = Math.sqrt(w * w + h * h);

    if (distance > edgeMinWidth || scale > 1) {
      overlay.scaleBy(scale);
      /*
       * running scale logic even for a scale ratio of 1
       * prevents a small, occasional marker flicker
       */
    } else {
      overlay.scaleBy(1);
    }
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.scaleHandle = function(overlay, idx, options) {
  return new L.ScaleHandle(overlay, idx, options);
};

/* this is the baseclass other IconSets inherit from,
* we don't use it directly */
L.IconSet = L.Class.extend({

  _svg: '<svg xmlns="http://www.w3.org/2000/svg">',

  _symbols: '',

  render: function() {
    this.addSymbols(this._symbols);
    return this._svg;
  },

  addSymbols: function(symbols) {
    this._svg += symbols;
  },
});

L.KeymapperIconSet = L.IconSet.extend({

  _symbols:
      // eslint-disable-next-line max-len
      '<symbol viewBox="0 0 25 25" id="keyboard_open"><path d="M12 23l4-4H8l4 4zm7-15h-2V6h2v2zm0 3h-2V9h2v2zm-3-3h-2V6h2v2zm0 3h-2V9h2v2zm0 4H8v-2h8v2zM7 8H5V6h2v2zm0 3H5V9h2v2zm1-2h2v2H8V9zm0-3h2v2H8V6zm3 3h2v2h-2V9zm0-3h2v2h-2V6zm9-3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></symbol>',

});

/* eslint-disable max-len */
L.ToolbarIconSet = L.IconSet.extend({
  _symbols:
    '<symbol viewBox="0 0 18 18" id="border_clear"><path d="M5.25 3.75h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm3-3h1.5v-1.5h-1.5v1.5zm0 3h1.5v-1.5h-1.5v1.5zm-6 0h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm6 6h1.5v-1.5h-1.5v1.5zm6 3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0 6h1.5v-1.5h-1.5v1.5zm0-9h1.5v-1.5h-1.5v1.5zm-6 0h1.5v-1.5h-1.5v1.5zm6-4.5v1.5h1.5v-1.5h-1.5zm-6 1.5h1.5v-1.5h-1.5v1.5zm3 12h1.5v-1.5h-1.5v1.5zm0-6h1.5v-1.5h-1.5v1.5zm0-6h1.5v-1.5h-1.5v1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="border_outer"><path d="M9.75 5.25h-1.5v1.5h1.5v-1.5zm0 3h-1.5v1.5h1.5v-1.5zm3 0h-1.5v1.5h1.5v-1.5zm-10.5-6v13.5h13.5V2.25H2.25zm12 12H3.75V3.75h10.5v10.5zm-4.5-3h-1.5v1.5h1.5v-1.5zm-3-3h-1.5v1.5h1.5v-1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="cancel"><path d="M13.279 5.779l-1.058-1.058L9 7.942 5.779 4.721 4.721 5.779 7.942 9l-3.221 3.221 1.058 1.058L9 10.057l3.221 3.222 1.058-1.058L10.057 9z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="crop_rotate"><path d="M5.603 16.117C3.15 14.947 1.394 12.57 1.125 9.75H0C.383 14.37 4.245 18 8.963 18c.172 0 .33-.015.495-.023L6.6 15.113l-.997 1.005zM9.037 0c-.172 0-.33.015-.495.03L11.4 2.888l.998-.998a7.876 7.876 0 0 1 4.477 6.36H18C17.617 3.63 13.755 0 9.037 0zM12 10.5h1.5V6A1.5 1.5 0 0 0 12 4.5H7.5V6H12v4.5zM6 12V3H4.5v1.5H3V6h1.5v6A1.5 1.5 0 0 0 6 13.5h6V15h1.5v-1.5H15V12H6z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="delete_forever"><path d="M4.5 14.25c0 .825.675 1.5 1.5 1.5h6c.825 0 1.5-.675 1.5-1.5v-9h-9v9zm1.845-5.34l1.058-1.058L9 9.443l1.59-1.59 1.058 1.058-1.59 1.59 1.59 1.59-1.058 1.058L9 11.558l-1.59 1.59-1.058-1.058 1.59-1.59-1.597-1.59zM11.625 3l-.75-.75h-3.75l-.75.75H3.75v1.5h10.5V3h-2.625z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="distort"><path d="M1.7 1.4H6v1.4h5.8V1.4h4.3v4.3h-1.4v5.8h1.4v4.4h-4.3v-1.5H6v1.5H1.7v-4.4h1.4V5.7H1.7V1.4zm10.1 4.3V4.3H6v1.4H4.6v5.8H6V13h5.8v-1.5h1.4V5.7h-1.4zM3.1 2.8v1.5h1.5V2.8H3.1zm10.1 0v1.5h1.5V2.8h-1.5zM3.1 13v1.4h1.5V13H3.1zm10.1 0v1.4h1.5V13h-1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="explore"><path d="M9 1.5C4.86 1.5 1.5 4.86 1.5 9c0 4.14 3.36 7.5 7.5 7.5 4.14 0 7.5-3.36 7.5-7.5 0-4.14-3.36-7.5-7.5-7.5zM9 15c-3.308 0-6-2.693-6-6 0-3.308 2.692-6 6-6 3.307 0 6 2.692 6 6 0 3.307-2.693 6-6 6zm-4.125-1.875l5.633-2.617 2.617-5.633-5.633 2.617-2.617 5.633zM9 8.175c.457 0 .825.367.825.825A.823.823 0 0 1 9 9.825.823.823 0 0 1 8.175 9c0-.457.367-.825.825-.825z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="flip_to_back"><path d="M6.75 5.25h-1.5v1.5h1.5v-1.5zm0 3h-1.5v1.5h1.5v-1.5zm0-6a1.5 1.5 0 0 0-1.5 1.5h1.5v-1.5zm3 9h-1.5v1.5h1.5v-1.5zm4.5-9v1.5h1.5c0-.825-.675-1.5-1.5-1.5zm-4.5 0h-1.5v1.5h1.5v-1.5zm-3 10.5v-1.5h-1.5a1.5 1.5 0 0 0 1.5 1.5zm7.5-3h1.5v-1.5h-1.5v1.5zm0-3h1.5v-1.5h-1.5v1.5zm0 6c.825 0 1.5-.675 1.5-1.5h-1.5v1.5zm-10.5-7.5h-1.5v9a1.5 1.5 0 0 0 1.5 1.5h9v-1.5h-9v-9zm7.5-1.5h1.5v-1.5h-1.5v1.5zm0 9h1.5v-1.5h-1.5v1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="flip_to_front"><path d="M2.25 9.75h1.5v-1.5h-1.5v1.5zm0 3h1.5v-1.5h-1.5v1.5zm1.5 3v-1.5h-1.5a1.5 1.5 0 0 0 1.5 1.5zm-1.5-9h1.5v-1.5h-1.5v1.5zm9 9h1.5v-1.5h-1.5v1.5zm3-13.5h-7.5a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h7.5c.825 0 1.5-.675 1.5-1.5v-7.5c0-.825-.675-1.5-1.5-1.5zm0 9h-7.5v-7.5h7.5v7.5zm-6 4.5h1.5v-1.5h-1.5v1.5zm-3 0h1.5v-1.5h-1.5v1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="get_app"><path d="M14.662 6.95h-3.15v-4.5H6.787v4.5h-3.15L9.15 12.2l5.512-5.25zM3.637 13.7v1.5h11.025v-1.5H3.637z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="lock"><path d="M13.5 6h-.75V4.5C12.75 2.43 11.07.75 9 .75 6.93.75 5.25 2.43 5.25 4.5V6H4.5C3.675 6 3 6.675 3 7.5V15c0 .825.675 1.5 1.5 1.5h9c.825 0 1.5-.675 1.5-1.5V7.5c0-.825-.675-1.5-1.5-1.5zM6.75 4.5A2.247 2.247 0 0 1 9 2.25a2.247 2.247 0 0 1 2.25 2.25V6h-4.5V4.5zM13.5 15h-9V7.5h9V15zM9 12.75c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="opacity"><path d="M13.245 6L9 1.763 4.755 6A6.015 6.015 0 0 0 3 10.23c0 1.5.585 3.082 1.755 4.252a5.993 5.993 0 0 0 8.49 0A6.066 6.066 0 0 0 15 10.23c0-1.5-.585-3.06-1.755-4.23zM4.5 10.5c.008-1.5.465-2.453 1.32-3.3L9 3.952l3.18 3.285c.855.84 1.313 1.763 1.32 3.263h-9z"/></symbol>' +
    '<symbol viewBox="0 0 14 18" id="opacity_empty"><path stroke="#0078A8" stroke-width="1.7" d="M10.708 6.25A5.113 5.113 0 0 1 12.2 9.846c0 1.275-.497 2.62-1.492 3.614a5.094 5.094 0 0 1-7.216 0A5.156 5.156 0 0 1 2 9.846c0-1.275.497-2.601 1.492-3.596L7.1 2.648l3.608 3.602zm0 0L7.1 2.648 3.492 6.25A5.113 5.113 0 0 0 2 9.846c0 1.275.497 2.62 1.492 3.614a5.094 5.094 0 0 0 7.216 0A5.156 5.156 0 0 0 12.2 9.846a5.113 5.113 0 0 0-1.492-3.596z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="restore"><path d="M15.67 3.839a.295.295 0 0 0-.22.103l-5.116 3.249V4.179a.342.342 0 0 0-.193-.315.29.29 0 0 0-.338.078L3.806 7.751v-4.63h-.002l.002-.022c0-.277-.204-.502-.456-.502h-.873V2.6c-.253 0-.457.225-.457.503l.002.026v10.883h.005c.021.257.217.454.452.455l.016-.002h.822c.013.001.025.004.038.004.252 0 .457-.225.457-.502a.505.505 0 0 0-.006-.068V9.318l6.001 3.811a.288.288 0 0 0 .332.074.34.34 0 0 0 .194-.306V9.878l5.12 3.252a.288.288 0 0 0 .332.073.34.34 0 0 0 .194-.306V4.18a.358.358 0 0 0-.09-.24.296.296 0 0 0-.218-.1z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="rotate"><path d="M5.505 4.808L.645 9.675l4.867 4.86 4.868-4.86-4.875-4.868zM2.768 9.675L5.513 6.93 8.25 9.675 5.505 12.42 2.768 9.675zM14.52 4.98A6.713 6.713 0 009.75 3V.57L6.57 3.75l3.18 3.18V4.5a5.23 5.23 0 013.713 1.537 5.255 5.255 0 010 7.426 5.23 5.23 0 01-5.843 1.08L6.503 15.66a6.76 6.76 0 003.247.84c1.725 0 3.457-.66 4.77-1.98a6.735 6.735 0 000-9.54z"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="scale"><path d="M8.25 9h-6a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h6a.75.75 0 00.75-.75v-6A.75.75 0 008.25 9zm-.75 6H3v-4.5h4.5V15zm8.94-13.035a.75.75 0 00-.405-.405.75.75 0 00-.285-.06h-4.5a.75.75 0 000 1.5h2.692L9.967 6.968a.75.75 0 000 1.064.75.75 0 001.065 0L15 4.057V6.75a.75.75 0 101.5 0v-4.5a.75.75 0 00-.06-.285z" /></symbol>' +
    '<symbol viewBox="0 0 18 18" id="spinner"><path d="M9 6.48c-.216 0-.36-.144-.36-.36V3.24c0-.216.144-.36.36-.36s.36.144.36.36v2.88c0 .216-.144.36-.36.36z"/><path d="M9 15.12c-.216 0-.36-.144-.36-.36v-2.88c0-.216.144-.36.36-.36s.36.144.36.36v2.88c0 .216-.144.36-.36.36zm1.44-8.28c-.072 0-.108 0-.18-.036-.144-.108-.216-.288-.108-.468l1.44-2.484c.108-.144.288-.216.468-.108.144.108.216.288.108.468l-1.44 2.484c-.072.072-.18.144-.288.144zm-4.32 7.488c-.072 0-.108 0-.18-.036-.144-.108-.216-.288-.108-.468l1.44-2.484c.108-.144.288-.216.468-.108.144.108.216.288.108.468l-1.44 2.484c-.072.072-.18.144-.288.144z" opacity=".3"/><path d="M7.56 6.84c-.108 0-.216-.072-.288-.18l-1.44-2.484c-.108-.144-.036-.36.108-.468.144-.108.36-.036.468.108L7.848 6.3c.108.144.036.36-.108.468-.072.072-.108.072-.18.072z" opacity=".93"/><path d="M11.88 14.328c-.108 0-.216-.072-.288-.18l-1.44-2.484c-.108-.144-.036-.36.108-.468.144-.108.36-.036.468.108l1.44 2.484c.108.144.036.36-.108.468-.072.036-.108.072-.18.072z" opacity=".3"/><path d="M6.12 9.36H3.24c-.216 0-.36-.144-.36-.36s.144-.36.36-.36h2.88c.216 0 .36.144.36.36s-.144.36-.36.36z" opacity=".65"/><path d="M14.76 9.36h-2.88c-.216 0-.36-.144-.36-.36s.144-.36.36-.36h2.88c.216 0 .36.144.36.36s-.144.36-.36.36z" opacity=".3"/><path d="M6.516 7.884c-.072 0-.108 0-.18-.036l-2.484-1.44c-.144-.108-.216-.288-.108-.468.108-.144.288-.216.468-.108l2.484 1.44c.144.108.216.288.108.468a.327.327 0 01-.288.144z" opacity=".86"/><path d="M14.004 12.204c-.072 0-.108 0-.18-.036l-2.484-1.44c-.144-.108-.216-.288-.108-.468.108-.144.288-.216.468-.108l2.484 1.44c.144.108.216.288.108.468a.327.327 0 01-.288.144z" opacity=".3"/><path d="M3.996 12.204c-.108 0-.216-.072-.288-.18-.108-.144-.036-.36.108-.468l2.484-1.44c.144-.108.36-.036.468.108.108.144.036.36-.108.468l-2.484 1.44c-.036.072-.108.072-.18.072z" opacity=".44"/><path d="M11.484 7.884c-.108 0-.216-.072-.288-.18-.108-.144-.036-.36.108-.468l2.484-1.44c.144-.108.36-.036.468.108.108.144.036.36-.108.468l-2.484 1.44c-.072.072-.108.072-.18.072z" opacity=".3"/></symbol>' +
    '<symbol viewBox="0 0 18 18" id="drag"><path d="M2.3 16.5c-0.2 0-0.4-0.1-0.5-0.2 -0.2-0.2-0.3-0.5-0.2-0.8l2.5-6.5 -2.5-6.5C1.5 2.3 1.5 2 1.7 1.8c0.2-0.2 0.5-0.3 0.8-0.2l6.5 2.5 6.5-2.5c0.3-0.1 0.6 0 0.8 0.2 0.2 0.2 0.3 0.5 0.2 0.8l-2.5 6.5 2.5 6.5c0.1 0.3 0 0.6-0.2 0.8 -0.2 0.2-0.5 0.3-0.8 0.2l-6.5-2.5 -6.5 2.5C2.4 16.5 2.3 16.5 2.3 16.5zM3.6 3.6l2 5.1c0.1 0.2 0.1 0.4 0 0.5l-2 5.1 5.1-2c0.2-0.1 0.4-0.1 0.5 0l5.1 2L12.4 9.3c-0.1-0.2-0.1-0.4 0-0.5l2-5.1L9.3 5.6c-0.2 0.1-0.4 0.1-0.5 0L3.6 3.6z" /></symbol>' +
    '<symbol viewBox="0 0 18 18" id="unlock"><path d="M13.5 6h-.75V4.5C12.75 2.43 11.07.75 9 .75 6.93.75 5.25 2.43 5.25 4.5h1.5A2.247 2.247 0 0 1 9 2.25a2.247 2.247 0 0 1 2.25 2.25V6H4.5C3.675 6 3 6.675 3 7.5V15c0 .825.675 1.5 1.5 1.5h9c.825 0 1.5-.675 1.5-1.5V7.5c0-.825-.675-1.5-1.5-1.5zm0 9h-9V7.5h9V15zM9 12.75c.825 0 1.5-.675 1.5-1.5s-.675-1.5-1.5-1.5-1.5.675-1.5 1.5.675 1.5 1.5 1.5z"/></symbol>',
});

L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.EditAction = L.Toolbar2.Action.extend({
  options: {
    toolbarIcon: {
      svg: false,
      html: '',
      className: '',
      tooltip: '',
    },
  },

  initialize: function(map, overlay, options) {
    this._overlay = overlay;
    this._map = map;

    L.setOptions(this, options);
    L.Toolbar2.Action.prototype.initialize.call(this, options);

    this._injectIconSet();
  },

  _createIcon: function(toolbar, container, args) {
    var iconOptions = this.options.toolbarIcon;
    var className = iconOptions.className;
    var edit = this._overlay.editing;

    this.toolbar = toolbar;
    this._icon = L.DomUtil.create('li', '', container);
    this._link = L.DomUtil.create('a', '', this._icon);

    if (iconOptions.svg) {
      this._link.innerHTML = L.IconUtil.create(iconOptions.html);
    } else {
      this._link.innerHTML = iconOptions.html;
    }

    this._link.setAttribute('href', '#');
    this._link.setAttribute('title', iconOptions.tooltip);
    this._link.setAttribute('role', 'button');

    L.DomUtil.addClass(this._link, this.constructor.baseClass);

    if (className) {
      L.DomUtil.addClass(this._link, className);
      if (className === 'disabled') {
        L.DomUtil.addClass(this._icon, className);
      }
      if (className === edit._mode) {
        L.DomUtil.addClass(this._link, 'selected-mode');
      } else {
        L.DomUtil.removeClass(this._link, 'selected-mode');
      }
    }

    L.DomEvent.on(this._link, 'click', this.enable, this);

    /* Add secondary toolbar */
    this._addSubToolbar(toolbar, this._icon, args);
  },

  _injectIconSet: function() {
    if (document.querySelector('#iconset')) {
      return;
    }

    var el = document.createElement('div');
    el.id = 'iconset';
    el.setAttribute('hidden', 'hidden');
    el.innerHTML = new L.ToolbarIconSet().render();

    document.querySelector('.leaflet-marker-pane').appendChild(el);
  },
});

L.editAction = function(map, overlay, options) {
  return new L.EditAction(map, overlay, options);
};

L.BorderAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var mode = edit._mode;
    var use;
    var tooltip;

    if (edit._outlined) {
      use = 'border_outer';
      tooltip = overlay.options.translation.removeBorder;
    } else {
      use = 'border_clear';
      tooltip = overlay.options.translation.addBorder;
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: mode === 'lock' ? 'disabled' : '',
    };

    // conditional for disabling keybindings for this action when the image is locked.
    L.DistortableImage.action_map.b = mode === 'lock' ? '' : '_toggleBorder';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'border_clear', 'border_outer');
    L.IconUtil.toggleTitle(this._link, 'Remove Border', 'Add Border');
    edit._toggleBorder();
  },
});

L.DeleteAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use = 'delete_forever';
    var tooltip;
    /**
      * we can tell whether the overlay is an instance of `L.DistortableImageOverlay` or `L.DistortableCollection` bc only
      * the former should have `parentGroup` defined on it. From there we call the apporpriate keybindings and methods.
      */
    if (edit instanceof L.DistortableImage.Edit) {
      tooltip = overlay.options.translation.deleteImage;
      // backspace windows / delete mac
      L.DistortableImage.action_map.Backspace = (
        edit._mode === 'lock' ? '' : '_removeOverlay'
      );
    } else {
      tooltip = overlay.options.translation.deleteImages;
      L.DistortableImage.group_action_map.Backspace = (
        edit._mode === 'lock' ? '' : '_removeGroup'
      );
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) { edit._removeOverlay(); }
    else { edit._removeGroup(); }
  },
});

L.DistortAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'distort',
      tooltip: overlay.options.translation.distortImage,
      className: 'distort',
    };

    L.DistortableImage.action_map.d = '_distortMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._distortMode();
  },
});

L.DragAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'drag',
      tooltip: overlay.options.translation.dragImage,
      className: 'drag',
    };

    L.DistortableImage.action_map.D = '_dragMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._dragMode();
  },
});

L.ExportAction = L.EditAction.extend({
  // This function is executed every time we select an image
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var tooltip;

    this.isExporting = false;
    this.mouseLeaveSkip = true;
    this.isHooksExecuted = false;

    if (edit instanceof L.DistortableImage.Edit) {
      L.DistortableImage.action_map.e = '_getExport';
      tooltip = overlay.options.translation.exportImage;
    } else {
      L.DistortableImage.group_action_map.e = 'runExporter';
      tooltip = overlay.options.translation.exportImages;
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'get_app',
      tooltip: tooltip,
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) {
      edit._getExport();
      return;
    }

    // Make sure that addHooks is executed only once, event listeners will handle the rest
    if (this.isHooksExecuted) {
      return;
    } else {
      this.isHooksExecuted = true;
    }

    var toolbarExportElement = this._link.parentElement;

    this.mouseEnterHandler = this.handleMouseEnter.bind(this);
    this.mouseLeaveHandler = this.handleMouseLeave.bind(this);

    L.DomEvent.on(toolbarExportElement, 'click', function() {
      if (!this.isExporting) {
        this.isExporting = true;
        this.renderExportIcon();

        setTimeout(this.attachMouseEventListeners.bind(this, toolbarExportElement), 100);
        edit.runExporter().then(
            function() {
              this.resetState();
              this.detachMouseEventListeners(toolbarExportElement);
            }.bind(this)
        );
      } else {
        // Clicking on the export icon after export has started will be ignored
        if (this.mouseLeaveSkip) {
          return;
        }

        this.resetState();
        this.detachMouseEventListeners(toolbarExportElement);
        edit.cancelExport();
      }
    }, this);
  },

  resetState: function() {
    this.renderDownloadIcon();
    this.isExporting = false;
    this.mouseLeaveSkip = true;
  },

  attachMouseEventListeners: function(element) {
    element.addEventListener('mouseenter', this.mouseEnterHandler);
    element.addEventListener('mouseleave', this.mouseLeaveHandler);
  },

  detachMouseEventListeners: function(element) {
    element.removeEventListener('mouseenter', this.mouseEnterHandler);
    element.removeEventListener('mouseleave', this.mouseLeaveHandler);
  },

  handleMouseEnter: function() {
    this.renderCancelIcon();
  },

  handleMouseLeave: function() {
    if (!this.mouseLeaveSkip) {
      this.renderExportIcon();
    } else {
      this.mouseLeaveSkip = false;
    }
  },

  renderDownloadIcon: function() {
    L.IconUtil.toggleXlink(this._link, 'get_app', 'spinner');
    L.IconUtil.toggleTitle(this._link, 'Export Images', 'Loading...');
    L.DomUtil.removeClass(this._link.firstChild, 'loader');
  },

  renderExportIcon: function() {
    L.IconUtil.toggleXlink(this._link, 'spinner');
    L.IconUtil.toggleTitle(this._link, 'Export Images', 'Loading...');
    L.IconUtil.addClassToSvg(this._link, 'loader');
  },

  renderCancelIcon: function() {
    L.IconUtil.toggleXlink(this._link, 'cancel');
    L.IconUtil.toggleTitle(this._link, 'Cancel Export', 'Loading...');
    L.DomUtil.removeClass(this._link.firstChild, 'loader');
  },
});

L.FreeRotateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'crop_rotate',
      tooltip: overlay.options.translation.freeRotateImage,
      className: 'freeRotate',
    };

    L.DistortableImage.action_map.f = '_freeRotateMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._freeRotateMode();
  },
});

L.GeolocateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'explore',
      tooltip: overlay.options.translation.geolocateImage,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var image = this._overlay.getElement();

    EXIF.getData(image, L.EXIF(image));
  },
});

L.LockAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

    if (edit instanceof L.DistortableImage.Edit) {
      L.DistortableImage.action_map.u = '_unlock';
      L.DistortableImage.action_map.l = '_lock';
      tooltip = overlay.options.translation.lockMode;

      if (edit._mode === 'lock') { use = 'lock'; }
      else { use = 'unlock'; }
    } else {
      L.DistortableImage.group_action_map.l = '_lockGroup';
      tooltip = overlay.options.translation.lockImages;
      use = 'lock';
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: 'lock',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    if (edit instanceof L.DistortableImage.Edit) { edit._toggleLockMode(); }
    else { edit._lockGroup(); }
  },
});

L.OpacityAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var mode = edit._mode;
    var use;
    var tooltip;

    if (edit._transparent) {
      use = 'opacity_empty';
      tooltip = overlay.options.translation.makeImageOpaque;
    } else {
      use = 'opacity';
      tooltip = overlay.options.translation.makeImageTransparent;
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: mode === 'lock' ? 'disabled' : '',
    };

    L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_toggleOpacity';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    var link = this._link;

    L.IconUtil.toggleXlink(link, 'opacity', 'opacity_empty');
    L.IconUtil.toggleTitle(link, 'Make Image Transparent', 'Make Image Opaque');
    edit._toggleOpacity();
  },
});

L.RevertAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'restore',
      tooltip: overlay.options.translation.restoreOriginalImageDimensions,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    this._overlay._revert();
  },
});

L.RotateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'rotate',
      tooltip: overlay.options.translation.rotateImage,
      className: 'rotate',
    };

    L.DistortableImage.action_map.r = '_rotateMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._rotateMode();
  },
});

L.ScaleAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'scale',
      tooltip: overlay.options.translation.scaleImage,
      className: 'scale',
    };

    L.DistortableImage.action_map.s = '_scaleMode';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._scaleMode();
  },
});

L.StackAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var edit = overlay.editing;
    var use;
    var tooltip;

    if (edit._toggledImage) {
      use = 'flip_to_back';
      tooltip = overlay.options.translation.stackToFront;
    } else {
      use = 'flip_to_front';
      tooltip = overlay.options.translation.stackToBack;
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: edit._mode === 'lock' ? 'disabled' : '',
    };

    L.DistortableImage.action_map.q = edit._mode === 'lock' ? '' : '_stackUp';
    L.DistortableImage.action_map.a = edit._mode === 'lock' ? '' : '_stackDown';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;

    L.IconUtil.toggleXlink(this._link, 'flip_to_front', 'flip_to_back');
    L.IconUtil.toggleTitle(this._link, 'Stack to Front', 'Stack to Back');
    edit._toggleOrder();
  },
});

L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.DistortableImage.PopupBar = L.Toolbar2.Popup.extend({
  options: {
    anchor: [0, -10],
  },

  initialize: function(latlng, options) {
    L.setOptions(this, options);
    L.Toolbar2.Popup.prototype.initialize.call(this, latlng, options);
  },

  addHooks: function(map, ov) {
    this.map = map;
    this.ov = ov;
  },

  tools: function() {
    if (this._ul) {
      return this._ul.children;
    }
  },

  clickTool: function(name) {
    var tools = this.tools();
    for (var i = 0; i < tools.length; i++) {
      var tool = tools.item(i).children[0];
      if (L.DomUtil.hasClass(tool, name)) {
        tool.click();
        return tool;
      }
    }
    return false;
  },
});

L.distortableImage.popupBar = function(latlng, options) {
  return new L.DistortableImage.PopupBar(latlng, options);
};

L.DistortableImageOverlay.addInitHook(function() {
  /** Default actions */
  this.ACTIONS = [
    L.DragAction,
    L.ScaleAction,
    L.DistortAction,
    L.RotateAction,
    L.FreeRotateAction,
    L.LockAction,
    L.OpacityAction,
    L.BorderAction,
    L.ExportAction,
    L.DeleteAction,
  ];

  var a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableImage.edit(this, {actions: a});
});


L.distortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.group_action_map = {};

L.UnlocksAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'unlock',
      tooltip: overlay.options.translation.unlockImages,
    };

    L.DistortableImage.group_action_map.u = '_unlockGroup';
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var edit = this._overlay.editing;
    edit._unlockGroup();
  },
});

L.DistortableImage.ControlBar = L.Toolbar2.Control.extend({
  options: {
  },
});

L.distortableImage.controlBar = function(options) {
  return new L.DistortableImage.ControlBar(options);
};

/** addInitHooks run before onAdd */
L.DistortableCollection.addInitHook(function() {
  this.ACTIONS = [
    L.ExportAction,
    L.DeleteAction,
    L.LockAction,
    L.UnlocksAction,
  ];

  var a = this.options.actions ? this.options.actions : this.ACTIONS;

  this.editing = L.distortableCollection.edit(this, {actions: a});
});

L.DistortableImage = L.DistortableImage || {};

// holds the keybindings & toolbar API for an individual image instance
L.DistortableImage.Edit = L.Handler.extend({
  options: {
    opacity: 0.7,
    outline: '1px solid red',
    keymap: L.distortableImage.action_map,
    modes: ['drag', 'scale', 'distort', 'rotate', 'freeRotate', 'lock'],
  },

  initialize: function(overlay, options) {
    this._overlay = overlay;
    this._toggledImage = false;
    /* Interaction modes. TODO - create API for
    * limiting modes similar to toolbar actions API */
    this._modes = this.options.modes;
    this._mode = this._modes[this._modes.indexOf(overlay.options.mode)];
    this._transparent = false;
    this._outlined = false;

    L.setOptions(this, options);

    L.distortableImage.action_map.Escape = '_deselect';
  },

  /* Run on image selection. */
  addHooks: function() {
    var overlay = this._overlay;

    /* bring the selected image into view */
    overlay.bringToFront();

    this._initHandles();

    this._appendHandlesandDragable(this._mode);

    this.editActions = this.options.actions;

    if (overlay.isSelected() && !overlay.options.suppressToolbar) {
      this._addToolbar();
    }

    this.parentGroup = overlay.eP ? overlay.eP : false;

    L.DomEvent.on(overlay._image, {
      dblclick: this.nextMode,
    }, this);

    L.DomEvent.on(window, 'keydown', this._onKeyDown, this);
  },

  /* Run on image deselection. */
  removeHooks: function() {
    var overlay = this._overlay;
    var map = overlay._map;
    var eP = this.parentGroup;

    // First, check if dragging exists - it may be off due to locking
    if (this.dragging) { this.dragging.disable(); }
    delete this.dragging;

    if (this.toolbar) { this._removeToolbar(); }

    map.removeLayer(this._handles[this._mode]);

    /**
     * ensures if you disable an image while it is multi-selected
     * additional deselection logic is run
     */
    if (L.DomUtil.hasClass(overlay.getElement(), 'collected')) {
      L.DomUtil.removeClass(overlay.getElement(), 'collected');
    }

    if (eP && (!eP.anyCollected() && eP.editing.toolbar)) {
      eP.editing._removeToolbar();
    }

    L.DomEvent.off(overlay._image, {
      dblclick: this.nextMode,
    }, this);

    L.DomEvent.off(window, 'keydown', this._onKeyDown, this);
  },

  disable: function() {
    if (!this._enabled) { return this; }

    this._overlay.deselect();
    this._enabled = false;
    this.removeHooks();
    return this;
  },

  _initHandles: function() {
    var overlay = this._overlay;
    var i;

    this._dragHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._dragHandles.addLayer(new L.DragHandle(overlay, i));
    }

    this._scaleHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._scaleHandles.addLayer(L.scaleHandle(overlay, i));
    }

    this._distortHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._distortHandles.addLayer(L.distortHandle(overlay, i));
    }

    this._rotateHandles = L.layerGroup(); // individual rotate
    for (i = 0; i < 4; i++) {
      this._rotateHandles.addLayer(L.rotateHandle(overlay, i));
    }

    // handle includes rotate AND scale
    this._freeRotateHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._freeRotateHandles.addLayer(new L.FreeRotateHandle(overlay, i));
    }

    this._lockHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._lockHandles.addLayer(L.lockHandle(overlay, i, {draggable: false}));
    }

    this._handles = {
      drag: this._dragHandles,
      scale: this._scaleHandles,
      distort: this._distortHandles,
      rotate: this._rotateHandles,
      freeRotate: this._freeRotateHandles,
      lock: this._lockHandles,
    };
  },

  _appendHandlesandDragable: function(mode) {
    var overlay = this._overlay;
    var map = overlay._map;

    map.addLayer(this._handles[mode]);

    if (mode !== 'lock') {
      if (!overlay.isSelected()) {
        this._handles[mode].eachLayer(function(layer) {
          layer.setOpacity(0);
          layer.dragging.disable();
          layer.options.draggable = false;
        });
      }

      this._enableDragging();
    }
  },

  _onKeyDown: function(e) {
    var keymap = this.options.keymap;
    var handlerName = keymap[e.key];
    var ov = this._overlay;
    var eP = this.parentGroup;

    if (eP && eP.anyCollected()) { return; }

    if (this[handlerName] !== undefined && !ov.options.suppressToolbar) {
      if (ov.isSelected() && this.toolbar) {
        this[handlerName].call(this);
      }
    }
  },

  replaceTool: function(old, next) {
    if (next.baseClass !== 'leaflet-toolbar-icon' || this.hasTool(next)) {
      return this;
    }
    this.editActions.some(function(item, idx) {
      if (this.editActions[idx] === old) {
        this._removeToolbar();
        this.editActions[idx] = next;
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    }, this);
    return this;
  },

  addTool: function(value) {
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
    }
    return this;
  },

  hasTool: function(value) {
    return this.editActions.some(function(action) {
      return action === value;
    });
  },

  removeTool: function(value) {
    this.editActions.some(function(item, idx) {
      if (this.editActions[idx] === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    }, this);
    return this;
  },

  _removeToolbar: function() {
    var overlay = this._overlay;
    var map = overlay._map;

    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    }
  },

  _enableDragging: function() {
    var overlay = this._overlay;
    var map = overlay._map;

    this.dragging = new L.Draggable(overlay.getElement());
    this.dragging.enable();

    /* Hide toolbars and markers while dragging; click will re-show it */
    this.dragging.on('dragstart', function() {
      overlay.fire('dragstart');
      this._removeToolbar();
    }, this);

    /*
     * Adjust default behavior of L.Draggable.
     * By default, L.Draggable overwrites the CSS3 distort transform
     * that we want when it calls L.DomUtil.setPosition.
     */
    this.dragging._updatePosition = function() {
      var topLeft = overlay.getCorner(0);
      var delta = this._newPos.subtract(map.latLngToLayerPoint(topLeft));
      var currentPoint;
      var corners = {};
      var i;

      this.fire('predrag');

      for (i = 0; i < 4; i++) {
        currentPoint = map.latLngToLayerPoint(overlay.getCorner(i));
        corners[i] = map.layerPointToLatLng(currentPoint.add(delta));
      }

      overlay.setCorners(corners);
      overlay.fire('drag');

      this.fire('drag');
    };
  },

  _dragMode: function() {
    if (!this.hasTool(L.DragAction)) { return; }
    this.setMode('drag');
  },

  _scaleMode: function() {
    if (!this.hasTool(L.ScaleAction)) { return; }
    this.setMode('scale');
  },

  _distortMode: function() {
    if (!this.hasTool(L.DistortAction)) { return; }
    this.setMode('distort');
  },

  _rotateMode: function() {
    if (!this.hasTool(L.RotateAction)) { return; }
    this.setMode('rotate');
  },

  _freeRotateMode: function() {
    if (!this.hasTool(L.FreeRotateAction)) { return; }
    this.setMode('freeRotate');
  },

  _toggleLockMode: function() {
    if (!this.hasTool(L.LockAction)) { return; }
    if (this._mode === 'lock') { this._unlock(); }
    else { this._lock(); }
  },

  _toggleOpacity: function() {
    var image = this._overlay.getElement();
    var opacity;

    if (!this.hasTool(L.OpacityAction)) { return; }

    this._transparent = !this._transparent;
    opacity = this._transparent ? this.options.opacity : 1;

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute('opacity', opacity);

    this._refresh();
  },

  _toggleBorder: function() {
    var image = this._overlay.getElement();
    var opacity;
    var outline;

    if (!this.hasTool(L.BorderAction)) { return; }

    this._outlined = !this._outlined;
    outline = this._outlined ? this.options.outline : 'none';

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute('opacity', opacity);

    image.style.outline = outline;

    this._refresh();
  },

  // compare this to using overlay zIndex
  _toggleOrder: function() {
    if (!this.hasTool(L.StackAction)) { return; }
    if (this._toggledImage) { this._stackUp(); }
    else { this._stackDown(); }
  },

  _removeOverlay: function() {
    var ov = this._overlay;
    var eP = this.parentGroup;
    var m = this._mode;

    if (m === 'lock' || !this.hasTool(L.DeleteAction)) { return; }

    var choice = L.DomUtil.confirmDelete();
    if (!choice) { return; }

    this._removeToolbar();

    if (eP) { eP.removeLayer(ov); }
    else { ov._map.removeLayer(ov); }
  },

  // Based on https://github.com/publiclab/mapknitter/blob/8d94132c81b3040ae0d0b4627e685ff75275b416/app/assets/javascripts/mapknitter/Map.js#L47-L82
  _getExport: function() {
    var overlay = this._overlay;
    var map = overlay._map;

    if (!this.hasTool(L.ExportAction)) { return; }

    // make a new image
    var downloadable = new Image();

    downloadable.id = downloadable.id || 'tempId12345';
    document.body.appendChild(downloadable);

    downloadable.onload = function onLoadDownloadableImage() {
      var height = downloadable.height;
      var width = downloadable.width;
      var nw = map.latLngToLayerPoint(overlay.getCorner(0));
      var ne = map.latLngToLayerPoint(overlay.getCorner(1));
      var sw = map.latLngToLayerPoint(overlay.getCorner(2));
      var se = map.latLngToLayerPoint(overlay.getCorner(3));

      // I think this is to move the image to the upper left corner,
      // eslint-disable-next-line max-len
      // jywarren: i think we may need these or the image goes off the edge of the canvas
      // jywarren: but these seem to break the distortion math...

      // jywarren: i think it should be rejiggered so it
      // finds the most negative values of x and y and then
      // adds those to all coordinates

      // nw.x -= nw.x;
      // ne.x -= nw.x;
      // se.x -= nw.x;
      // sw.x -= nw.x;

      // nw.y -= nw.y;
      // ne.y -= nw.y;
      // se.y -= nw.y;
      // sw.y -= nw.y;

      // run once warping is complete
      downloadable.onload = function() {
        L.DomUtil.remove(downloadable);
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

  _stackUp: function() {
    var t = this._toggledImage;

    if (!t || !this.hasTool(L.StackAction)) { return; }

    this._toggledImage = false;
    this._overlay.bringToFront();
    this._refresh();
  },

  _stackDown: function() {
    var t = this._toggledImage;

    if (t || !this.hasTool(L.StackAction)) { return; }
    this._toggledImage = true;
    this._overlay.bringToBack();
    this._refresh();
  },

  _unlock: function() {
    var ov = this._overlay;
    var map = ov._map;
    var m = this._mode;


    if (m !== 'lock' || !this.hasTool(L.LockAction)) { return; }

    map.removeLayer(this._handles[m]);
    if (ov.options.mode === 'lock') {
      this._mode = 'distort';
    } else {
      this._mode = ov.options.mode;
    }
    this._enableDragging();
    map.addLayer(this._handles[this._mode]);
    this._refresh();
  },

  _lock: function() {
    var map = this._overlay._map;
    var m = this._mode;

    if (m === 'lock' || !this.hasTool(L.LockAction)) { return; }

    map.removeLayer(this._handles[m]);

    this._mode = 'lock';
    if (this.dragging) {
      this.dragging.disable();
      delete this.dragging;
    }
    map.addLayer(this._handles[this._mode]);
    this._refresh();
  },

  _deselect: function() {
    this._overlay.deselect();
  },

  _showMarkers: function() {
    var eP = this.parentGroup;
    var m = this._mode;

    // mutli-image interface doesn't have markers so check if its on & return early if true
    if (this._mode === 'lock' || eP && eP.anyCollected()) { return; }

    var currentHandle = this._handles[m];

    currentHandle.eachLayer(function(layer) {
      var drag = layer.dragging;
      var opts = layer.options;

      layer.setOpacity(1);
      if (drag) { drag.enable(); }
      if (opts.draggable) { opts.draggable = true; }
    });
  },

  _hideMarkers: function() {
    // workaround for race condition w/ feature group
    if (!this._handles) { this._initHandles(); }

    var m = this._mode;
    var currentHandle = this._handles[m];

    currentHandle.eachLayer(function(layer) {
      var drag = layer.dragging;
      var opts = layer.options;

      if (m !== 'lock') { layer.setOpacity(0); }
      if (drag) { drag.disable(); }
      if (opts.draggable) { opts.draggable = false; }
    });
  },

  _addToolbar: function() {
    var ov = this._overlay;
    var eP = this.parentGroup;
    var map = ov._map;
    // Find the topmost point on the image.
    var corners = ov.getCorners();
    var maxLat = -Infinity;

    if (eP && eP.anyCollected()) {
      eP.editing._addToolbar();
      return;
    }

    if (ov.options.suppressToolbar || this.toolbar) { return; }

    for (var i = 0; i < corners.length; i++) {
      if (corners[i].lat > maxLat) {
        maxLat = corners[i].lat;
      }
    }

    // Longitude is based on the centroid of the image.
    var raisedPoint = ov.getCenter();
    raisedPoint.lat = maxLat;

    this.toolbar = L.distortableImage.popupBar(raisedPoint, {
      actions: this.editActions,
    }).addTo(map, ov);
    ov.fire('toolbar:created');
  },

  _refresh: function() {
    if (this.toolbar) { this._removeToolbar(); }
    this._addToolbar();
  },

  _updateToolbarPos: function() {
    var overlay = this._overlay;
    // Find the topmost point on the image.
    var corners = overlay.getCorners();
    var toolbar = this.toolbar;
    var maxLat = -Infinity;

    if (toolbar && toolbar instanceof L.DistortableImage.PopupBar) {
      for (var i = 0; i < corners.length; i++) {
        if (corners[i].lat > maxLat) {
          maxLat = corners[i].lat;
        }
      }

      // Longitude is based on the centroid of the image.
      var raisedPoint = overlay.getCenter();
      raisedPoint.lat = maxLat;

      if (!overlay.options.suppressToolbar) {
        this.toolbar.setLatLng(raisedPoint);
      }
    }
  },

  getMode: function() {
    if (!this._overlay.isSelected()) { return false; }
    return this._mode;
  },

  getModes: function() {
    return this._modes;
  },

  setMode: function(newMode) {
    var ov = this._overlay;
    var map = ov._map;
    var m = this._mode;

    if (newMode === m || !ov.isSelected()) { return false; }
    if (this._modes.indexOf(newMode) !== -1) {
      if (this.toolbar) { this.toolbar.clickTool(newMode); }
      if (m === 'lock' && !this.dragging) { this._enableDragging(); }
      map.removeLayer(this._handles[m]);
      this._mode = newMode;
      map.addLayer(this._handles[this._mode]);
      this._refresh();
      return this;
    }
    return false;
  },

  /**
    * need to attach a stop to img dblclick or it will propagate to
    * the map and fire the handler that shows map location labels on map dblclick.
    */
  nextMode: function(e) {
    var m = this._mode;
    var eP = this.parentGroup;
    var idx = this._modes.indexOf(m);
    var nextIdx = (idx + 1) % this._modes.length;
    var newMode = this._modes[nextIdx];

    if (e) {
      if (eP) {
        eP._deselectOthers(e);
        if (!eP.anyCollected()) {
          this._overlay.select();
        }
      }
      L.DomEvent.stop(e);
    }

    return this.setMode(newMode);
  },
});

L.distortableImage.edit = function(overlay, options) {
  return new L.DistortableImage.Edit(overlay, options);
};

L.DistortableImage = L.DistortableImage || {};

// this class holds the keybindings and toolbar API for an image collection instance
L.DistortableCollection.Edit = L.Handler.extend({
  options: {
    keymap: L.distortableImage.group_action_map,
  },

  initialize: function(group, options) {
    this._group = group;
    this._exportOpts = group.options.exportOpts;

    L.setOptions(this, options);

    L.distortableImage.group_action_map.Escape = '_decollectAll';
  },

  addHooks: function() {
    var group = this._group;
    var map = group._map;

    this.editActions = this.options.actions;
    this.runExporter =
        L.bind(L.Utils.getNestedVal(this, '_exportOpts', 'exporter') ||
        this.startExport, this);

    L.DomEvent.on(document, 'keydown', this._onKeyDown, this);

    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.on(map, 'click', this._decollectAll, this);
    }

    L.DomEvent.on(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
      boxcollectend: this._addCollections,
    }, this);

    this._group.editable = true;
    this._group.eachLayer(function(layer) {
      layer.editing.enable();
    });
  },

  removeHooks: function() {
    var group = this._group;
    var map = group._map;

    L.DomEvent.off(document, 'keydown', this._onKeyDown, this);

    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.off(map, 'click', this._decollectAll, this);
    }

    L.DomEvent.off(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
      boxcollectend: this._addCollections,
    }, this);

    this._decollectAll();
    this._group.editable = false;
    this._group.eachLayer(function(layer) {
      layer.editing.disable();
    });
  },

  enable: function() {
    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    this._enabled = false;
    this.removeHooks();

    return this;
  },

  _onKeyDown: function(e) {
    var keymap = this.options.keymap;
    var handlerName = keymap[e.key];

    if (!this[handlerName]) { return; }

    if (this._group.anyCollected()) {
      this[handlerName].call(this);
    }
  },

  _singleClick: function(e) {
    if (e.type === 'singleclick') { this._decollectAll(e); }
    else { return; }
  },

  _singleClickListeners: function() {
    var map = this._group._map;
    L.DomEvent.off(map, 'click', this._decollectAll, this);
    L.DomEvent.on(map, 'singleclick', this._decollectAll, this);
  },

  _resetClickListeners: function() {
    var map = this._group._map;
    L.DomEvent.on(map, 'click', this._decollectAll, this);
    L.DomEvent.off(map, 'singleclick', this._decollectAll, this);
  },

  _decollectAll: function(e) {
    var oe;

    if (e) { oe = e.originalEvent; }
    /**
     * prevents image deselection following the 'boxcollectend' event - note 'shift' must not be released until dragging is complete
     * also prevents deselection following a click on a disabled img by differentiating it from the map
     */
    if (oe && (oe.shiftKey || oe.target instanceof HTMLImageElement)) {
      return;
    }

    this._group.eachLayer(function(layer) {
      L.DomUtil.removeClass(layer.getElement(), 'collected');
      layer.deselect();
    });

    this._removeToolbar();

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  _unlockGroup: function() {
    this._group.eachLayer(function(layer) {
      if (this._group.isCollected(layer)) {
        var edit = layer.editing;
        if (edit._mode === 'lock') {
          edit._unlock();
          // unlock updates the layer's handles; deselect to ensure they're hidden
          layer.deselect();
        }
      }
    }, this);
  },

  _lockGroup: function() {
    this._group.eachLayer(function(layer) {
      if (this._group.isCollected(layer) ) {
        var edit = layer.editing;
        if (edit._mode !== 'lock') {
          edit._lock();
          // map.addLayer also deselects the image, so we reselect here
          L.DomUtil.addClass(layer.getElement(), 'collected');
        }
      }
    }, this);
  },

  _addCollections: function(e) {
    var box = e.boxCollectBounds;
    var map = this._group._map;

    this._group.eachLayer(function(layer) {
      var edit = layer.editing;

      if (layer.isSelected()) { layer.deselect(); }

      var imgBounds = L.latLngBounds(layer.getCorner(2), layer.getCorner(1));
      var zoom = map.getZoom();
      var center = map.getCenter();
      imgBounds = map._latLngBoundsToNewLayerBounds(imgBounds, zoom, center);
      if (box.intersects(imgBounds) && edit.enabled()) {
        if (!this.toolbar) {
          this._addToolbar();
        }
        L.DomUtil.addClass(layer.getElement(), 'collected');
      }
    }, this);
  },

  _removeGroup: function(e) {
    var layersToRemove = this._group._toRemove();
    var n = layersToRemove.length;

    if (n === 0) { return; }

    var choice = L.DomUtil.confirmDeletes(n);

    if (choice) {
      layersToRemove.forEach(function(layer) {
        this._group.removeLayer(layer);
      }, this);
      if (!this._group.anyCollected()) {
        this._removeToolbar();
      }
    }

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  cancelExport: function() {
    if (!this.customCollection) {
      this._exportOpts.collection = undefined;
    }

    clearInterval(this.updateInterval);
  },

  _addToolbar: function() {
    var group = this._group;
    var map = group._map;

    if (group.options.suppressToolbar || this.toolbar) { return; }

    this.toolbar = L.distortableImage.controlBar({
      actions: this.editActions,
      position: 'topleft',
    }).addTo(map, group);
  },

  _removeToolbar: function() {
    var map = this._group._map;
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
    }
    return this;
  },

  removeTool: function(value) {
    this.editActions.some(function(item, idx) {
      if (this.editActions[idx] === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    }, this);
    return this;
  },

  startExport: function() {
    return new Promise(function(resolve) {
      var opts = this._exportOpts;
      opts.resolve = resolve; // allow resolving promise in user-defined functions, to stop spinner on completion
      var statusUrl;
      var self = this;
      this.updateInterval = null;

      // this may be overridden to update the UI to show export progress or completion
      function _defaultUpdater(data) {
        data = JSON.parse(data);
        // optimization: fetch status directly from google storage:
        if (data.status_url) {
          if (statusUrl !== data.status_url && data.status_url.match('.json')) {
            // if (data.status_url && data.status_url.substr(0,1) === "/") {
            //   opts.statusUrl = opts.statusUrl + data.status_url;
            // } else {
            statusUrl = data.status_url;
            // }
          }

          if (data.status === 'complete') {
            clearInterval(self.updateInterval);

            if (!self.customCollection) {
              self._exportOpts.collection = undefined;
            }

            resolve();
            if (data.jpg !== null) {
              alert('Export succeeded. ' + opts.exportUrl + data.jpg);
            }
          }

          // TODO: update to clearInterval when status == "failed" if we update that in this file:
          // https://github.com/publiclab/mapknitter-exporter/blob/main/lib/mapknitterExporter.rb
          console.log(data);
        }
      }

      // receives the URL of status.json, and starts running the updater to repeatedly fetch from status.json;
      // this may be overridden to integrate with any UI
      function _defaultHandleStatusRes(data) {
        statusUrl = opts.statusUrl + data;
        // repeatedly fetch the status.json
        self.updateInterval = setInterval(function intervalUpdater() {
          $.ajax(statusUrl + '?' + Date.now(), {// bust cache with timestamp
            type: 'GET',
            crossDomain: true,
          }).done(function(data) {
            opts.updater(data);
          });
        }, opts.frequency);
      }

      // initiate the export
      function _defaultFetchStatusUrl(opts) {
        $.ajax({
          url: opts.exportStartUrl,
          crossDomain: true,
          type: 'POST',
          data: {
            collection: JSON.stringify(opts.collection),
            scale: opts.scale,
            upload: true,
          },
          success: function(data) { opts.handleStatusRes(data); }, // this handles the initial response
        });
      }

      // If the user has passed collection property
      if (opts.collection) {
        self.customCollection = true;
      } else {
        self.customCollection = false;
        opts.collection = this._group.generateExportJson().images;
      }

      opts.frequency = opts.frequency || 3000;
      opts.scale = opts.scale || 100; // switch it to _getAvgCmPerPixel !
      opts.updater = opts.updater || _defaultUpdater;
      opts.handleStatusRes = opts.handleStatusRes || _defaultHandleStatusRes;
      opts.fetchStatusUrl = opts.fetchStatusUrl || _defaultFetchStatusUrl;

      opts.fetchStatusUrl(opts);
    }.bind(this));
  },
});

L.distortableCollection.edit = function(group, options) {
  return new L.DistortableCollection.Edit(group, options);
};

L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.Keymapper = L.Handler.extend({

  options: {
    position: 'topright',
  },

  initialize: function(map, options) {
    this._map = map;
    L.setOptions(this, options);
  },

  addHooks: function() {
    if (!this._keymapper) {
      this._container = this._buildContainer();
      this._scrollWrapper = this._wrap();
      this._toggler = this._createButton();
      this._setMapper(this._container, this._scrollWrapper, this._toggler);

      L.DomEvent.on(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomEvent.disableClickPropagation(this._container);
      L.DomEvent.disableScrollPropagation(this._container);
    }
  },

  removeHooks: function() {
    if (this._keymapper) {
      L.DomEvent.off(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomUtil.remove(this._toggler);
      L.DomUtil.remove(this._scrollWrapper);
      L.DomUtil.remove(this._container);
      this._keymapper = false;
    }
  },

  _buildContainer: function() {
    var container = L.DomUtil.create('div', 'ldi-keymapper-hide');
    container.setAttribute('id', 'ldi-keymapper');

    var divider = L.DomUtil.create('br', 'divider');
    container.appendChild(divider);

    return container;
  },

  _createButton: function() {
    var toggler = L.DomUtil.create('a', '');
    toggler.innerHTML = L.IconUtil.create('keyboard_open');

    toggler.setAttribute('id', 'toggle-keymapper');
    toggler.setAttribute('href', '#');
    toggler.setAttribute('title', 'Show keymap');
    // Will force screen readers like VoiceOver to read this as "Show keymap - button"
    toggler.setAttribute('role', 'button');
    toggler.setAttribute('aria-label', 'Show keymap');

    return toggler;
  },

  _wrap: function() {
    var wrap = L.DomUtil.create('div', '');
    wrap.setAttribute('id', 'keymapper-wrapper');
    wrap.style.display = 'none';

    return wrap;
  },

  _setMapper: function(container, wrap, button) {
    this._keymapper = L.control({position: this.options.position});

    this._keymapper.onAdd = function() {
      container.appendChild(wrap);
      wrap.insertAdjacentHTML(
          'beforeend',
          '<table><tbody>' +
          '<hr id="keymapper-hr">' +
          /* eslint-disable */
          '<tr><td><div class="left"><span>Rotate Mode</span></div><div class="right"><kbd>R</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>RotateScale Mode</span></div><div class="right"><kbd>r</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Scale Mode</span></div><div class="right"><kbd>s</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Distort Mode</span></div><div class="right"><kbd>d</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Drag Mode</span></div><div class="right"><kbd>D</kbd></div></td></tr>' +   
          '<tr><td><div class="left"><span>Lock (Mode) / Unlock Image</span></div><div class="right"><kbd>l</kbd>\xa0<kbd>u</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Stack up / down</span></div><div class="right"><kbd>q</kbd>\xa0<kbd>a</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Add / Remove Image Border</span></div><div class="right"><kbd>b</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Toggle Opacity</span></div><div class="right"><kbd>o</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Deselect All</span></div><div class="right"><kbd>esc</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Delete Image(s)</span></div><div class="right"><kbd>delete</kbd>\xa0<kbd>backspace</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Export Image(s)</span></div><div class="right"><kbd>e</kbd></div></td></tr>' +
          '</tbody></table>'
      );
      /* eslint-enable */
      container.appendChild(button);
      return container;
    };

    this._keymapper.addTo(this._map);
  },

  _toggleKeymapper: function(e) {
    e.preventDefault();

    this._container.className = (
      this._container.className === 'ldi-keymapper leaflet-control' ?
        'ldi-keymapper-hide leaflet-control' :
        'ldi-keymapper leaflet-control'
    );

    this._scrollWrapper.style.display = (
      this._scrollWrapper.style.display === 'none' ? 'block' : 'none'
    );

    this._toggler.innerHTML = (
      this._toggler.innerHTML === 'close' ?
        L.IconUtil.create('keyboard_open') :
        'close'
    );

    L.IconUtil.toggleTitle(this._toggler, 'Show keymap', 'Hide keymap');
    L.DomUtil.toggleClass(this._toggler, 'close-icon');
  },

  _injectIconSet: function() {
    if (document.querySelector('#keymapper-iconset')) { return; }

    var el = L.DomUtil.create('div', '');
    el.id = 'keymapper-iconset';
    el.setAttribute('hidden', 'hidden');

    this._iconset = new L.KeymapperIconSet().render();
    el.innerHTML = this._iconset;

    document.querySelector('.leaflet-control-container').appendChild(el);
  },
});

L.DistortableImage.Keymapper.addInitHook(function() {
  L.DistortableImage.Keymapper.prototype._n = (
    L.DistortableImage.Keymapper.prototype._n ?
    L.DistortableImage.Keymapper.prototype._n + 1 :
    1
  );
  // dont enable keymapper for mobile
  if (L.DistortableImage.Keymapper.prototype._n === 1 && !L.Browser.mobile) {
    this.enable();
    this._injectIconSet();
  }
});

L.distortableImage.keymapper = function(map, options) {
  return new L.DistortableImage.Keymapper(map, options);
};

/**
 * `L.Map.DoubleClickZoom` from leaflet 1.5.1, overrwritten so that it
 * 1) Fires a `singleclick` event to avoid deselecting images on `dblclick`.
 * 2) Maintains a mutually exclusive relationship with the map's `DoubleClickLabels` handler
 */
L.Map.DoubleClickZoom.include({
  addHooks: function() {
    this._map.on({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  removeHooks: function() {
    this._map.off({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  enable: function() {
    if (this._enabled) { return this; }

    // don't enable 'doubleClickZoom' unless 'doubleClickLabels' is disabled first
    if (this._map.doubleClickLabels) {
      if (this._map.doubleClickLabels.enabled()) {
        return this;
      }
    }

    // signify to collection/instance classes to turn on 'singleclick' listeners
    this._map.fire('singleclickon');

    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    if (!this._enabled) { return this; }

    // signify to collection/instance safe to swap 'singleclick' listeners with 'click' listeners.
    this._map.fire('singleclickoff');

    this._enabled = false;
    this.removeHooks();
    return this;
  },

  _fireIfSingle: function(e) {
    var map = this._map;
    var oe = e.originalEvent;

    // prevents deselection in case of box selector
    if (oe && oe.shiftKey) { return; }

    map._clicked += 1;
    this._map._clickTimeout = setTimeout(function() {
      if (map._clicked === 1) {
        map._clicked = 0;
        map.fire('singleclick', {type: 'singleclick'});
      } else {
        // manually fire doubleclick event only for touch screens that don't natively fire it
        if (L.Browser.touch && (oe && oe.sourceCapabilities.firesTouchEvents)) {
          // in `DoubleClickLabels.js`, we just do map.fire('dblclick') bc `_onDoublClick` doesn't use the
          // passed "e" (for now). To generate a 'real' DOM event that will have all of its corresponding core
          // properties (originalEvent, latlng, etc.), use Leaflet's `#map._fireDOMEvent` (Leaflet 1.5.1 source)
          map._fireDOMEvent(oe, 'dblclick', [map]);
        }
      }
    }, 250);
  },

  _onDoubleClick: function(e) {
    var map = this._map;
    var oe = e.originalEvent;

    setTimeout(function() {
      map._clicked = 0;
      clearTimeout(map._clickTimeout);
    }, 0);

    if (!oe) { return false; }

    var oldZoom = map.getZoom();
    var delta = map.options.zoomDelta;
    var zoom = oe.shiftKey ? oldZoom - delta : oldZoom + delta;

    if (map.options.doubleClickZoom === 'center') {
      map.setZoom(zoom);
    } else {
      map.setZoomAround(e.containerPoint, zoom);
    }
  },
});

L.Map.mergeOptions({
  boxCollector: true,
  boxZoom: false,
});

/**
 * primarily Leaflet 1.5.1 source code. Overriden so that it's a collection box used with
 * our `L.DistortableCollection` class instead of a zoom box.
 * */
L.Map.BoxCollector = L.Map.BoxZoom.extend({
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
    if (!e.shiftKey || (e.which !== 1 && e.button !== 1)) {
      return false;
    }

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
    if (e.which !== 1 && e.button !== 1) {
      return;
    }

    this._finish();

    if (!this._moved) { return; }

    // Postpone to next JS tick so internal click event handling
    // still see it as "moved".
    this._clearDeferredResetState();
    this._resetStateTimeout = setTimeout(
        L.Util.bind(this._resetState, this), 0);

    var bounds = L.latLngBounds(
        this._map.containerPointToLatLng(this._bounds.getBottomLeft()),
        this._map.containerPointToLatLng(this._bounds.getTopRight())
    );

    var zoom = this._map.getZoom();
    var center = this._map.getCenter();

    // calls the `project` method but 1st updates the pixel origin - see https://github.com/publiclab/Leaflet.DistortableImage/pull/344
    bounds = this._map._latLngBoundsToNewLayerBounds(bounds, zoom, center);

    this._map.fire('boxcollectend', {boxCollectBounds: bounds});
  },
});

L.Map.addInitHook('addHandler', 'boxCollector', L.Map.BoxCollector);

L.Map.mergeOptions({
  doubleClickLabels: true,
});

/**
 * The `doubleClickLabels` handler replaces `doubleClickZoom` by default if `#addGoogleMutant`
 * is used unless the options 'labels: false' or 'doubleClickZoom: false` were passed to it.
 */
L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
  enable: function() {
    var map = this._map;

    if (this._enabled) { return this; }

    // disable 'doubleClickZoom' if 'doubleClickLabels' is enabled.
    if (map.doubleClickZoom.enabled()) {
      map.doubleClickZoom.disable();
    }

    this._map.fire('singleclickon');

    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    if (!this._enabled) { return this; }

    this._enabled = false;
    this.removeHooks();

    return this;
  },

  _fireIfSingle: function(e) {
    var map = this._map;
    var oe = e.originalEvent;

    // prevents deselection in case of box selector
    if (oe && oe.shiftKey) { return; }

    map._clicked += 1;
    this._map._clickTimeout = setTimeout(function() {
      if (map._clicked === 1) {
        map._clicked = 0;
        map.fire('singleclick', {type: 'singleclick'});
      } else {
        // manually fire doubleclick event only for touch screens that don't natively fire it
        if (L.Browser.touch && (oe && oe.sourceCapabilities.firesTouchEvents)) {
          map.fire('dblclick');
        }
      }
    }, 250);
  },

  _onDoubleClick: function() {
    var map = this._map;
    var labels = map._labels;

    setTimeout(function() {
      map._clicked = 0;
      clearTimeout(map._clickTimeout);
    }, 0);

    if (!labels) { return; }

    if (labels.options.opacity === 1) {
      labels.options.opacity = 0;
      labels.setOpacity(0);
    } else {
      labels.options.opacity = 1;
      labels.setOpacity(1);
    }
  },
});

L.Map.addInitHook('addHandler', 'doubleClickLabels', L.Map.DoubleClickLabels);

/* eslint-disable max-len */
L.Map.include({

  _clicked: 0,

  addGoogleMutant: function(opts) {
    var url = 'http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';

    opts = this.mutantOptions = L.extend({
      mutantOpacity: 0.8,
      maxZoom: 24,
      maxNativeZoom: 20,
      minZoom: 0,
      labels: true,
      labelOpacity: 1,
      doubleClickLabels: true,
    }, opts);

    if (!opts.labels) {
      this.mutantOptions = L.extend(this.mutantOptions, {
        labelOpacity: opts.labels ? 1 : undefined,
        doubleClickLabels: opts.labels ? true : undefined,
      });
    }

    this._googleMutant = L.tileLayer(url, {
      maxZoom: opts.maxZoom,
      maxNativeZoom: opts.maxNativeZoom,
      minZoom: opts.minZoom,
      opacity: opts.mutantOpacity,
    }).addTo(this);

    if (opts.labels) { this._addLabels(opts); }
    // shouldn't have this handler at all if there are no labels to toggle
    else {
      this.doubleClickLabels = undefined;
    }

    return this;
  },

  _addLabels: function(opts) {
    var url = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}';

    if (opts.labelOpacity !== 0 && opts.labelOpacity !== 1) {
      opts.labelOpacity = 1;
    }

    this._labels = L.tileLayer(url, {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      interactive: false,
      opacity: opts.labelOpacity,
      maxZoom: opts.maxZoom,
      maxNativeZoom: opts.maxNativeZoom,
      minZoom: opts.minZoom,
      ext: 'png',
    }).addTo(this);

    if (this.mutantOptions.doubleClickLabels) {
      this.doubleClickLabels.enable();
    }

    return this;
  },
});
// start off with doubleClickZoom enabled, doubleClickLabels can later be enabled instead
// during initialization
L.Map.addInitHook(function() {
  this.doubleClickLabels.disable();
  this.doubleClickZoom.enable();
});
