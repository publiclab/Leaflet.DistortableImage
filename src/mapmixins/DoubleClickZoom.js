/**
 * `L.Map.DoubleClickZoom` from leaflet 1.5.1, overrwritten so that it
 * 1) Fires a `singleclick` event to avoid deselecting images on `dblclick`.
 * 2) Maintains a mutually exclusive relationship with the map's `DoubleClickLabels` handler
 */
L.Map.DoubleClickZoom.include({
  addHooks() {
    this._map.on({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  removeHooks() {
    this._map.off({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  enable() {
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

  disable() {
    if (!this._enabled) { return this; }

    // signify to collection/instance safe to swap 'singleclick' listeners with 'click' listeners.
    this._map.fire('singleclickoff');

    this._enabled = false;
    this.removeHooks();
    return this;
  },

  _fireIfSingle(e) {
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

  _onDoubleClick(e) {
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
