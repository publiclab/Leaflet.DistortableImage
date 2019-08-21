/**
 * The 'doubleClickLabels' handler only runs instead of 'doubleClickZoom' when a googleMutant
 * layer is added to the map using 'map.addGoogleMutant()' without the option labels: false.
 */

L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
  addHooks: function() {
    this._map.clicked = 0;

    this._map.on({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  removeHooks: function() {
    this._map.off({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  enable: function() {
    var map = this._map;

    if (this._enabled) {
      return this;
    }

    // dont enable 'doubleClickLabels' if the labels layer has not been added.
    if (!map._labels) {
      this._enabled = false;
      return this;
    }

    // disable 'doubleClickZoom' if 'doubleClickLabels' is enabled.
    if (map.doubleClickZoom.enabled()) {
      map.doubleClickZoom.disable();
    }

    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    var map = this._map;

    if (!this._enabled) {
      return this;
    }

    this._enabled = false;
    this.removeHooks();

    // enable 'doubleClickZoom' if 'doubleClickLabels' is disabled.
    if (!map.doubleClickZoom.enabled()) {
      map.doubleClickZoom.enable();
    }

    return this;
  },

  _fireIfSingle: function() {
    var map = this._map;

    map.clicked += 1;
    setTimeout(function() {
      if (map.clicked === 1) {
        map.clicked = 0;
        map.fire('singleclick', {deselect: true});
      }
    }, 300);
  },

  _onDoubleClick: function() {
    var map = this._map;
    var labels = map._labels;

    map.clicked = 0;

    if (labels.options.opacity === 1) {
      labels.options.opacity = 0;
      labels.setOpacity(0);
    } else {
      labels.options.opacity = 1;
      labels.setOpacity(1);
    }
  },
});

L.Map.DoubleClickZoom.include({
  enable: function() {
    if (this._enabled) {
      return this;
    }

    // don't enable 'doubleClickZoom' unless 'doubleClickLabels' is disabled first
    if (this._map.doubleClickLabels) {
      if (this._map.doubleClickLabels.enabled()) {
        return this;
      }
    }

    this._enabled = true;
    this.addHooks();
    return this;
  },
});

L.Map.addInitHook('addHandler', 'doubleClickLabels', L.Map.DoubleClickLabels);
