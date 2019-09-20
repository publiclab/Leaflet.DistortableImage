L.Map.mergeOptions({
  doubleClickLabels: true,
});

/**
 * The 'doubleClickLabels' handler only runs instead of 'doubleClickZoom' when a googleMutant
 * layer is added to the map using 'map.addGoogleMutant()' without the option labels: false.
 */

L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
  enable: function() {
    var map = this._map;

    if (this._enabled) { return this; }

    // disable 'doubleClickZoom' if 'doubleClickLabels' is enabled.
    if (map.doubleClickZoom.enabled()) {
      map.doubleClickZoom.disable();
    }

    // signify to collection/instance classes to listen for 'singleclick'
    this._map.fire('singleclickon');

    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    if (!this._enabled) { return this; }

    this._map.fire('singleclickoff');

    this._enabled = false;
    this.removeHooks();

    return this;
  },

  _onDoubleClick: function() {
    var map = this._map;
    var labels = map._labels;

    this._cancelSingleClick();

    map._clicked = 0;

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
