L.Map.mergeOptions({
  boxCollector: true,
  boxZoom: false,
});

/**
 * primarily Leaflet 1.5.1 source code. Overriden so that it's a collection box used with
 * our `L.DistortableCollection` class instead of a zoom box.
 * */
L.Map.BoxCollector = L.Map.BoxZoom.extend({
  initialize(map) {
    this._map = map;
    this._container = map._container;
    this._pane = map._panes.overlayPane;
    this._resetStateTimeout = 0;
    map.on('unload', this._destroy, this);
  },

  addHooks() {
    L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
  },

  removeHooks() {
    L.DomEvent.off(this._container, 'mousedown', this._onMouseDown, this);
  },

  moved() {
    return this._moved;
  },

  _destroy() {
    L.DomUtil.remove(this._pane);
    delete this._pane;
  },

  _resetState() {
    this._resetStateTimeout = 0;
    this._moved = false;
  },

  _clearDeferredResetState() {
    if (this._resetStateTimeout !== 0) {
      clearTimeout(this._resetStateTimeout);
      this._resetStateTimeout = 0;
    }
  },

  _onMouseDown(e) {
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

  _onMouseMove(e) {
    if (!this._moved) {
      this._moved = true;

      this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._container);
      L.DomUtil.addClass(this._container, 'leaflet-crosshair');

      this._map.fire('boxzoomstart');
    }

    this._point = this._map.mouseEventToContainerPoint(e);

    this._bounds = L.bounds(this._startPoint, this._point);
    const size = this._bounds.getSize();

    L.DomUtil.setPosition(this._box, this._bounds.min);

    this._box.style.width = size.x + 'px';
    this._box.style.height = size.y + 'px';
  },

  _finish() {
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

  _onMouseUp(e) {
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

    let bounds = L.latLngBounds(
        this._map.containerPointToLatLng(this._bounds.getBottomLeft()),
        this._map.containerPointToLatLng(this._bounds.getTopRight())
    );

    const zoom = this._map.getZoom();
    const center = this._map.getCenter();

    // calls the `project` method but 1st updates the pixel origin - see https://github.com/publiclab/Leaflet.DistortableImage/pull/344
    bounds = this._map._latLngBoundsToNewLayerBounds(bounds, zoom, center);

    this._map.fire('boxcollectend', {boxCollectBounds: bounds});
  },
});

L.Map.addInitHook('addHandler', 'boxCollector', L.Map.BoxCollector);
