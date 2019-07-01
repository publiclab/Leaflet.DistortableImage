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