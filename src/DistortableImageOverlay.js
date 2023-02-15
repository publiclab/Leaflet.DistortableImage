L.DistortableImageOverlay = L.ImageOverlay.extend({
  options: {
    height: 200,
    crossOrigin: true,
    // todo: find ideal number to prevent distortions during RotateScale, and make it dynamic (remove hardcoding)
    edgeMinWidth: 50,
    editable: true,
    mode: 'distort',
    selected: false,
    interactive: true,
    tooltipText: '',
  },

  initialize(url, options) {
    L.setOptions(this, options);
    L.Utils.initTranslation.call(this);

    this.edgeMinWidth = this.options.edgeMinWidth;
    this.editable = this.options.editable;
    this._selected = this.options.selected;
    this._url = url;
    this.rotation = {};

    this.interactive = this.options.interactive;
    this.tooltipText = this.options.tooltipText;
  },

  onAdd(map) {
    this._map = map;
    if (!this.getElement()) { this._initImage(); }

    map.on('viewreset', this._reset, this);

    if (this.options.corners) {
      this._corners = this.options.corners;
      if (map.options.zoomAnimation && L.Browser.any3d) {
        map.on('zoomanim', this._animateZoom, this);
      }
    }

    // Have to wait for the image to load because need to access its w/h
    L.DomEvent.on(this.getElement(), 'load', () => {
      this.getPane().appendChild(this.getElement());
      this._initImageDimensions();

      if (this.options.rotation) {
        const units = this.options.rotation.deg >= 0 ? 'deg' : 'rad';
        this.setAngle(this.options.rotation[units], units);
      } else {
        this.rotation = {deg: 0, rad: 0};
        this._reset();
      }

      /* Initialize default corners if not already set */
      if (!this._corners) {
        if (map.options.zoomAnimation && L.Browser.any3d) {
          map.on('zoomanim', this._animateZoom, this);
        }
      }

      /** if there is a featureGroup, only its editable option matters */
      const eventParents = this._eventParents;
      if (eventParents) {
        this.eP = eventParents[Object.keys(eventParents)[0]];
        if (this.eP.editable) { this.editing.enable(); }
      } else {
        if (this.editable) { this.editing.enable(); }
        this.eP = null;
      }
    });

    L.DomEvent.on(this.getElement(), 'click', this.select, this);
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

    L.DomEvent.on(this.getElement(), 'mousemove', this.activateTooltip, this);
    L.DomEvent.on(this.getElement(), 'mouseout', this.closeTooltip, this);
  },

  onRemove(map) {
    L.DomEvent.off(this.getElement(), 'click', this.select, this);
    L.DomEvent.off(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
    }, this);
    L.DomEvent.off(map, 'click', this.deselect, this);

    if (this.editing) { this.editing.disable(); }
    this.fire('remove');

    L.ImageOverlay.prototype.onRemove.call(this, map);

    L.DomEvent.on(this.getElement(), 'mouseout', this.closeTooltip, this);
    L.DomEvent.off(this.getElement(), 'mousemove', this.deactivateTooltip, this);
  },

  _initImageDimensions() {
    const map = this._map;
    const originalImageWidth = L.DomUtil.getStyle(this.getElement(), 'width');
    const originalImageHeight = L.DomUtil.getStyle(this.getElement(), 'height');
    const aspectRatio =
        parseInt(originalImageWidth) / parseInt(originalImageHeight);
    const imageHeight = this.options.height;
    const imageWidth = parseInt(aspectRatio * imageHeight);
    const center = map.project(map.getCenter());
    const offset = L.point(imageWidth, imageHeight).divideBy(2);
    if (this.options.corners) {
      this._corners = this.options.corners;
    } else {
      this._corners = [
        map.unproject(center.subtract(offset)),
        map.unproject(center.add(L.point(offset.x, -offset.y))),
        map.unproject(center.add(L.point(-offset.x, offset.y))),
        map.unproject(center.add(offset)),
      ];
    }

    this._initialDimensions = {
      'center': center,
      'offset': offset,
      'zoom': map.getZoom(),
    };
    this.setBounds(L.latLngBounds(this.getCorners()));
  },

  _singleClick(e) {
    if (e.type === 'singleclick') { this.deselect(); }
    else { return; }
  },

  _singleClickListeners() {
    const map = this._map;
    L.DomEvent.off(map, 'click', this.deselect, this);
    L.DomEvent.on(map, 'singleclick', this.deselect, this);
  },

  _resetClickListeners() {
    const map = this._map;
    L.DomEvent.on(map, 'click', this.deselect, this);
    L.DomEvent.off(map, 'singleclick', this.deselect, this);
  },

  isSelected() {
    return this._selected;
  },

  deselect() {
    const edit = this.editing;
    if (!edit.enabled()) { return; }

    edit._removeToolbar();
    edit._hideMarkers();

    this._selected = false;
    this.fire('deselect');
    return this;
  },

  select(e) {
    const edit = this.editing;
    const eP = this.eP;

    if (!edit.enabled()) { return; }
    if (e) { L.DomEvent.stopPropagation(e); }

    // this ensures deselection of all other images, allowing us to keep collection group optional
    this._programmaticGrouping();

    this._selected = true;
    edit._addToolbar();
    edit._showMarkers();
    this.fire('select');

    // we run the selection logic 1st anyway because the collection group's _addToolbar method depends on it
    if (eP && eP.anyCollected()) {
      this.deselect();
      return;
    }

    return this;
  },

  _programmaticGrouping() {
    this._map.eachLayer((layer) => {
      if (layer instanceof L.DistortableImageOverlay) {
        layer.deselect();
      }
    });
  },

  setCorner(corner, latlng) {
    const edit = this.editing;

    this._corners[corner] = latlng;

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    this.edited = true;

    return this;
  },

  _cornerExceedsMapLats(zoom, corner, map) {
    if (map.options.crs.Simple == L.CRS.Simple) {
      return false;
    } else {
      let exceedsTop;
      let exceedsBottom;
      if (zoom === 0) {
        exceedsTop = map.project(corner).y < 2;
        exceedsBottom = map.project(corner).y >= 255;
      } else {
        exceedsTop = map.project(corner).y / zoom < 2;
        exceedsBottom = map.project(corner).y / Math.pow(2, zoom) >= 255;
      }
      return (exceedsTop || exceedsBottom);
    }
  },

  activateTooltip() {
    if (!this._selected) {
      this.bindTooltip(this.tooltipText, {direction: 'top'}).openTooltip();
    }
  },

  closeToolTip() {
    this.closeTooltip();
  },

  deactivateTooltip() {
    this.unbindTooltip();
  },

  getTooltipText() {
    return this.tooltipText;
  },

  setCorners(latlngObj) {
    const map = this._map;
    const zoom = map.getZoom();
    const edit = this.editing;
    let i = 0;

    // this is to fix https://github.com/publiclab/Leaflet.DistortableImage/issues/402
    for (const k in latlngObj) {
      if (this._cornerExceedsMapLats(zoom, latlngObj[k], map)) {
        // calling reset / update w/ the same corners bc it prevents a marker flicker for rotate
        this.setBounds(L.latLngBounds(this.getCorners()));
        this.fire('update');
        return;
      }
    }

    for (const k in latlngObj) {
      this._corners[i] = latlngObj[k];
      i += 1;
    }

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    this.edited = true;

    return this;
  },

  setCornersFromPoints(pointsObj) {
    const map = this._map;
    const zoom = map.getZoom();
    const edit = this.editing;
    let i = 0;

    for (const k in pointsObj) {
      const corner = map.layerPointToLatLng(pointsObj[k]);

      if (this._cornerExceedsMapLats(zoom, corner, map)) {
        // calling reset / update w/ the same corners bc it prevents a marker flicker for rotate
        this.setBounds(L.latLngBounds(this.getCorners()));
        this.fire('update');
        return;
      }
    }

    for (const k in pointsObj) {
      this._corners[i] = map.layerPointToLatLng(pointsObj[k]);
      i += 1;
    }

    this.setBounds(L.latLngBounds(this.getCorners()));
    this.fire('update');

    if (edit.toolbar && edit.toolbar instanceof L.DistortableImage.PopupBar) {
      edit._updateToolbarPos();
    }

    this.edited = true;

    return this;
  },

  scaleBy(scale) {
    const map = this._map;
    const center = map.project(this.getCenter());
    let i;
    let p;
    const scaledCorners = {};

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

  getAngle(unit = 'deg') {
    const matrix = this.getElement().style[L.DomUtil.TRANSFORM]
        .split('matrix3d')[1]
        .slice(1, -1)
        .split(',');

    const row0x = matrix[0];
    const row0y = matrix[1];
    const row1x = matrix[4];
    const row1y = matrix[5];

    const determinant = row0x * row1y - row0y * row1x;

    let angle = L.TrigUtil.calcAngle(row0x, row0y, 'rad');

    if (determinant < 0) {
      angle += angle < 0 ? Math.PI : -Math.PI;
    }

    if (angle < 0) {
      angle = 2 * Math.PI + angle;
    }

    return unit === 'deg' ?
        Math.round(L.TrigUtil.radiansToDegrees(angle)) :
        L.Util.formatNum(angle, 2);
  },

  setAngle(angle, unit = 'deg') {
    const currentAngle = this.getAngle(unit);
    const angleToRotateBy = angle - currentAngle;
    this.rotateBy(angleToRotateBy, unit);

    return this;
  },

  rotateBy(angle, unit = 'deg') {
    const map = this._map;
    const center = map.project(this.getCenter());
    const corners = {};
    let i;
    let p;
    let q;

    if (unit === 'deg') {
      angle = L.TrigUtil.degreesToRadians(angle);
    }

    for (i = 0; i < 4; i++) {
      p = map.project(this.getCorner(i)).subtract(center);
      q = L.point(
          Math.cos(angle) * p.x - Math.sin(angle) * p.y,
          Math.sin(angle) * p.x + Math.cos(angle) * p.y
      );
      corners[i] = map.unproject(q.add(center));
    }

    this.setCorners(corners);

    return this;
  },

  dragBy(formerPoint, newPoint) {
    const map = this._map;
    let i;
    let p;
    const transCorners = {};
    const delta = map.project(formerPoint).subtract(map.project(newPoint));

    for (i = 0; i < 4; i++) {
      p = map.project(this.getCorner(i)).subtract(delta);
      transCorners[i] = map.unproject(p);
    }

    this.setCorners(transCorners);
  },

  restore() {
    const map = this._map;
    const center = this._initialDimensions.center;
    const offset = this._initialDimensions.offset;
    const zoom = this._initialDimensions.zoom;
    const corners = [
      center.subtract(offset),
      center.add(L.point(offset.x, -offset.y)),
      center.add(L.point(-offset.x, offset.y)),
      center.add(offset),
    ];

    for (let i = 0; i < 4; i++) {
      if (!map.unproject(corners[i], zoom).equals(this.getCorner(i))) {
        this.setCorner(i, map.unproject(corners[i], zoom));
      }
    }

    this.edited = false;
    this.fire('restore');

    return this;
  },

  /* Copied from Leaflet v0.7 https://github.com/Leaflet/Leaflet/blob/66282f14bcb180ec87d9818d9f3c9f75afd01b30/src/dom/DomUtil.js#L189-L199 */
  /* since L.DomUtil.getTranslateString() is deprecated in Leaflet v1.0 */
  _getTranslateString(point) {
    // on WebKit browsers (Chrome/Safari/iOS Safari/Android)
    // using translate3d instead of translate
    // makes animation smoother as it ensures HW accel is used.
    // Firefox 13 doesn't care
    // (same speed either way), Opera 12 doesn't support translate3d

    const is3d = L.Browser.webkit3d;
    const open = 'translate' + (is3d ? '3d' : '') + '(';
    const close = (is3d ? ',0' : '') + ')';

    return open + point.x + 'px,' + point.y + 'px' + close;
  },

  _reset() {
    const map = this._map;
    const image = this.getElement();
    const latLngToLayerPoint = L.bind(map.latLngToLayerPoint, map);
    const transformMatrix = this
        ._calculateProjectiveTransform(latLngToLayerPoint);
    const topLeft = latLngToLayerPoint(this.getCorner(0));
    const warp = L.DomUtil.getMatrixString(transformMatrix);
    const translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');

    /* Set origin to the upper-left corner rather than
     * the center of the image, which is the default.
     */
    image.style[L.DomUtil.TRANSFORM + '-origin'] = '0 0 0';

    this.rotation.deg = this.getAngle();
    this.rotation.rad = this.getAngle('rad');
  },

  /*
   * Calculates the transform string that will be
   * correct *at the end* of zooming.
   * Leaflet then generates a CSS3 animation between the current transform and
   * future transform which makes the transition appear smooth.
   */
  _animateZoom(event) {
    const map = this._map;
    const image = this.getElement();
    const latLngToNewLayerPoint = function(latlng) {
      return map._latLngToNewLayerPoint(latlng, event.zoom, event.center);
    };
    const transformMatrix = this._calculateProjectiveTransform(
        latLngToNewLayerPoint
    );
    const topLeft = latLngToNewLayerPoint(this.getCorner(0));
    const warp = L.DomUtil.getMatrixString(transformMatrix);
    const translation = this._getTranslateString(topLeft);

    /* See L.DomUtil.setPosition. Mainly for the purposes of L.Draggable. */
    image._leaflet_pos = topLeft;

    image.style[L.DomUtil.TRANSFORM] = [translation, warp].join(' ');
  },

  getCorners() {
    return this._corners;
  },

  getCorner(i) {
    return this._corners[i];
  },

  // image (vertex) centroid calculation
  getCenter() {
    const map = this._map;
    const reduce = this.getCorners().reduce(function(agg, corner) {
      return agg.add(map.project(corner));
    }, L.point(0, 0));
    return map.unproject(reduce.divideBy(4));
  },

  _calculateProjectiveTransform(latLngToCartesian) {
    /* Setting reasonable but made-up image defaults
     * allow us to place images on the map before
     * they've finished downloading. */
    const offset = latLngToCartesian(this.getCorner(0));
    const w = this.getElement().offsetWidth || 500;
    const h = this.getElement().offsetHeight || 375;
    const c = [];
    let j;
    /* Convert corners to container points (i.e. cartesian coordinates). */
    for (j = 0; j < 4; j++) {
      c.push(latLngToCartesian(this.getCorner(j))._subtract(offset));
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
