/**
 * we overrwrite the L.Map.DoubleClickZoom handler so that in case
 * L.Map.DoubleClickLabels is disabled, it will also will fire a `singleclick`
 * event so that images are not deselected on DoubleClickZoom either.
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
        return false;
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

  _clearSingleClickTimeout: function() {
    if (this._singleClickTimeout) {
      clearTimeout(this._singleClickTimeout);
      this._singleClickTimeout = null;
    }
  },

  _fireIfSingle: function(e) {
    var map = this._map;
    var eo = e.originalEvent;

    // prevents deselection in case of box selector
    if (eo && eo.shiftKey) { return; }

    this._clearSingleClickTimeout();

    map._clicked += 1;
    this._singleClickTimeout = setTimeout(function() {
      if (map._clicked === 1) {
        map._clicked = 0;
        if (eo && !eo._stopped) {
          map.fire('singleclick', L.extend(e, {type: 'singleclick'}));
        }
      }
    }, 250);
  },

  _cancelSingleClick: function() {
    // This timeout is key to workaround an issue where double-click events
    // are fired in this order on some touch browsers: ['click', 'dblclick', 'click']
    // instead of ['click', 'click', 'dblclick']
    setTimeout(this._clearSingleClickTimeout.bind(this), 0);
  },

  _onDoubleClick: function(e) {
    var map = this._map;

    map._clicked = 0;

    this._cancelSingleClick();

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
