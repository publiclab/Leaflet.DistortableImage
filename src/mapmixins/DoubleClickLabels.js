/* eslint-disable valid-jsdoc */
/**
 * The 'doubleClickLabels' handler only runs instead of 'doubleClickZoom' when a googleMutant
 * layer is added to the map using 'map.addGoogleMutant()' without the option labels: false.
 */

L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
  addHooks: function() {
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

    if (this._enabled) { return this; }

    // dont enable 'doubleClickLabels' if the labels layer has not been added.
    if (!map._labels) {
      this._enabled = false;
      return this;
    }

    // disable 'doubleClickZoom' if 'doubleClickLabels' is enabled.
    if (map.doubleClickZoom.enabled()) {
      map.doubleClickZoom.disable();
    }

    // signify to collection/instance classes to re-enable 'singleclick' listeners
    this._map.fire('singleclickon');

    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function() {
    var map = this._map;

    if (!this._enabled) { return this; }

    this._enabled = false;
    this.removeHooks();

    // enable 'doubleClickZoom' if 'doubleClickLabels' is disabled.
    if (!map.doubleClickZoom.enabled()) {
      map.doubleClickZoom.enable();
    }

    return this;
  },

  _fireIfSingle: function(e) {
    var map = this._map;
    var eo = e.originalEvent;

    // prevents deselection in case of box selector
    if (eo && eo.shiftKey) { return; }

    map.clicked += 1;
    setTimeout(function() {
      if (map.clicked === 1) {
        map.clicked = 0;
        map.fire('singleclick', L.extend(e, {type: 'singleclick'}));
      }
    }, 250);
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

/**
 * a little repetitive, but here we overrwrite the L.Map.DoubleClickZoom
 * handler so that in case L.Map.DoubleClickLabels is disabled, this handler
 * will fire a `singleclick` event that our collection and overlay classes
 * both listen for. Bonus: now DoubleClickZoom doesn't deselect our images either.
 */
L.Map.DoubleClickZoom.include({
  addHooks: function() {
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
    if (this._enabled) { return this; }

    // don't enable 'doubleClickZoom' unless 'doubleClickLabels' is disabled first
    if (this._map.doubleClickLabels) {
      if (this._map.doubleClickLabels.enabled()) {
        return this;
      }
    }

    this._map.fire('singleclickon');

    this._enabled = true;
    this.addHooks();
    return this;
  },

  /**
   * if L.Map.DoubleClickZoom is disabled as well, we fire one more custom event
   * to signify to our collection and instance classes to stop listening for `singleclick`
   * and start just listening for `click`.
   */
  disable: function() {
    if (!this._enabled) { return this; }

    this._map.fire('singleclickoff');

    this._enabled = false;
    this.removeHooks();
    return this;
  },

  _fireIfSingle: function(e) {
    var map = this._map;
    var eo = e.originalEvent;

    // prevents deselection in case of box selector
    if (eo && eo.shiftKey) { return; }

    map.clicked += 1;
    setTimeout(function() {
      if (map.clicked === 1) {
        map.clicked = 0;
        map.fire('singleclick', L.extend(e, {type: 'singleclick'}));
      }
    }, 250);
  },

  _onDoubleClick: function(e) {
    var map = this._map;

    map.clicked = 0;

    var oldZoom = map.getZoom();
    var delta = map.options.zoomDelta;
    var zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

    if (map.options.doubleClickZoom === 'center') {
      map.setZoom(zoom);
    } else {
      map.setZoomAround(e.containerPoint, zoom);
    }
  },
});

L.Map.addInitHook('addHandler', 'doubleClickLabels', L.Map.DoubleClickLabels);
