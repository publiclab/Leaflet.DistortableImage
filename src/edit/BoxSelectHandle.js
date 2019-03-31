L.Map.mergeOptions({ boxSelector: true, boxZoom: false });

// used for multiple image select. Temporarily disabled until click
// propagation issue is fixed

L.Map.BoxSelectHandle = L.Map.BoxZoom.extend({

  initialize: function (map) {
    this._map = map;
    this._container = map._container;
    this._pane = map._panes.overlayPane;
  },

  addHooks: function () {
    L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
  },

  removeHooks: function () {
    L.DomEvent.off(this._container, 'mousedown', this._onMouseDown, this);
  },

  _onMouseDown: function (e) {
    if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

    L.DomUtil.disableTextSelection();
    L.DomUtil.disableImageDrag();

    this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

    this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
    L.DomUtil.setPosition(this._box, this._startLayerPoint);

    this._container.style.cursor = 'crosshair';

    L.DomEvent
      .on(document, 'mousemove', this._onMouseMove, this)
      .on(document, 'mouseup', this._onMouseUp, this)
      .preventDefault(e);

    this._map.fire('boxzoomstart');
  },

  _onMouseMove: function (e) {
    var startPoint = this._startLayerPoint,
      box = this._box,

      layerPoint = this._map.mouseEventToLayerPoint(e),
      offset = layerPoint.subtract(startPoint),

      newPos = new L.Point(
        Math.min(layerPoint.x, startPoint.x),
        Math.min(layerPoint.y, startPoint.y));

    L.DomUtil.setPosition(box, newPos);

    box.style.width = (Math.max(0, Math.abs(offset.x) - 4)) + 'px';
    box.style.height = (Math.max(0, Math.abs(offset.y) - 4)) + 'px';
  },

  _onMouseUp: function (e) {
    var map = this._map,
      layerPoint = map.mouseEventToLayerPoint(e);

    if (this._startLayerPoint.equals(layerPoint)) { return; }

    this._boxBounds = new L.LatLngBounds(
      map.layerPointToLatLng(this._startLayerPoint),
      map.layerPointToLatLng(layerPoint));

    this._finish();

    map.fire('boxzoomend', { boxZoomBounds: this._boxBounds });

    // this._finish();
  },

  _finish: function () {
    $(this._map.boxSelector._box).remove();
    // L.DomUtil.remove(this._box);
    // L.DomUtil.remove(this._map.boxSelector);
    this._container.style.cursor = '';

    L.DomUtil.enableTextSelection();
    L.DomUtil.enableImageDrag();

    L.DomEvent
      .off(document, 'mousemove', this._onMouseMove)
      .off(document, 'mouseup', this._onMouseUp);
  },
});

L.Map.addInitHook('addHandler', 'boxSelector', L.Map.BoxSelectHandle);