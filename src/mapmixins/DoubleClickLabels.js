L.Map.mergeOptions({
  doubleClickLabels: true,
});

/**
 * The 'doubleClickLabels' handler replaces 'doubleClickZoom' by default if #addGoogleMutant
 * is used unless the options 'labels: false' or 'doubleClickZoom: false` were passed to it.
 */

L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
  enable: function() {
    var map = this._map;

    if (this._enabled) { return this; }

    // disable 'doubleClickZoom' if enabling 'doubleClickLabels'
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

    // this._cancelSingleClick();

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
