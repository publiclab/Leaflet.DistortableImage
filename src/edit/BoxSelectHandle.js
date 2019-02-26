L.Map.mergeOptions({ boxSelector: true, boxZoom: false });

L.Map.BoxSelectHandle = L.Map.BoxZoom.extend({

  addHooks: function () {
    L.DomEvent.on(this._container, 'mousedown', this._onMouseDown, this);
  },

  removeHooks: function () {
    L.DomEvent.off(this._container, 'mousedown', this._onMouseDown);
  },

  _onMouseDown: function (e) {
    if (!e.shiftKey || ((e.which !== 1) && (e.button !== 1))) { return false; }

    L.DomUtil.disableTextSelection();

    this._startLayerPoint = this._map.mouseEventToLayerPoint(e);

    this._box = L.DomUtil.create('div', 'leaflet-zoom-box', this._pane);
    L.DomUtil.setPosition(this._box, this._startLayerPoint);

    this._container.style.cursor = 'crosshair';

    L.DomEvent
      .on(document, 'mousemove', this._onMouseMove, this)
      .on(document, 'mouseup', this._onMouseUp, this)
      .on(document, 'keydown', this._onKeyDown, this)
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
    // window.e = e;
    var map = this._map,
      layerPoint = map.mouseEventToLayerPoint(e);

    if (this._startLayerPoint.equals(layerPoint)) { return; }

    // var bounds = new L.LatLngBounds(
    //   map.layerPointToLatLng(this._startLayerPoint),
    //   map.layerPointToLatLng(layerPoint));

    map.fire('boxzoomend', {
      // boxBounds: bounds
    });

    let contents = $(this._pane).children();
    let images = contents.filter('img');
    // window.images = images;

    this._finish();
    
    return images;
  },

  _finish: function () {
    this._pane.removeChild(this._box);
    this._container.style.cursor = '';

    L.DomUtil.enableTextSelection();

    L.DomEvent
      .off(document, 'mousemove', this._onMouseMove)
      .off(document, 'mouseup', this._onMouseUp)
      .off(document, 'keydown', this._onKeyDown);
  },

  // escape keybinding for getting rid of the selection box (alternative to mouse up). keep for now to see if it will become useful
  // in deselecting images
  _onKeyDown: function (e) {
    if (e.keyCode === 27) {
      this._finish();
    }
  }
});

L.Map.addInitHook('addHandler', 'boxSelector', L.Map.BoxSelectHandle);