L.Map.mergeOptions({ boxSelector: true, boxZoom: false });

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
    if (!$(this._pane).children('.leaflet-zoom-box').length) { return false; }
    // window.e = e;
    var map = this._map,
      layerPoint = map.mouseEventToLayerPoint(e);

    if (this._startLayerPoint.equals(layerPoint)) { return; }

    this._boxBounds = new L.LatLngBounds(
      map.layerPointToLatLng(this._startLayerPoint),
      map.layerPointToLatLng(layerPoint));

    window.bounds = this._boxBounds;
    // window.div = this._div;
    window.box = this._box;
    window.pane = this._pane;
    window.map = map;
    window.container = this._container;

    map.fire('boxzoomend', {
      boxZoomBounds: this._boxBounds
    }, this);

    // window._boxBounds = this._boxBounds;

    let contents = $(this._pane).children();
    let images = contents.filter('img');

    this._finish();

    this._attach(images);

    console.log(images);
    return images;
  },

  _check: function(e){
    window.zoome = e;
  },

  _finish: function () {
    // if (!this._box) { return false; }
    // this._pane.removeChild(this._box);[]
    $(this._box).remove();
    this._container.style.cursor = '';

    L.DomUtil.enableTextSelection();
    L.DomUtil.enableImageDrag();

    L.DomEvent
      .off(document, 'mousemove', this._onMouseMove)
      .off(document, 'mouseup', this._onMouseUp)
      .off(document, 'keydown', this._onKeyDown);
  },

  _attach: function(images) {
    if ($('#holding')) {
      this._imagesDiv = $('#holding');
      $(images).appendTo(this._imagesDiv);
      window.imagesDiv = this._imagesDiv;
    }
  },

  // escape keybinding for getting rid of the selection box (alternative to mouse up). keep for now to see if it will become useful
  // in deselecting images
  _onKeyDown: function (e) {
    if (e.keyCode === 27) {
      if ($(this._pane).children('.leaflet-zoom-box').length) {
        $(this._box).remove();
      }
      // this._finish();
    }
  },

});

L.Map.addInitHook('addHandler', 'boxSelector', L.Map.BoxSelectHandle);