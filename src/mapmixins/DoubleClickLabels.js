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
