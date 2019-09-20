L.Map.mergeOptions({
  doubleClickLabels: true,
  tap: true,
  doubleTap: true,
});

/**
 * The 'doubleClickLabels' handler replaces 'doubleClickZoom' by default if #addGoogleMutant
 * is used unless the options 'labels: false' or 'doubleClickZoom: false` were passed to it.
 */

// L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
//   // addHooks: function() {
//   // this._singleClickTimeout = null;

//   //   this._map.on({
//   //     click: this._scheduleSingleClick,
//   //     dblclick: this._onDoubleClick,
//   //   }, this);
//   // },

//   // removeHooks: function() {
//   //   this._singleClickTimeout = null;

//   //   this._map.off({
//   //     click: this._scheduleSingleClick,
//   //     dblclick: this._onDoubleClick,
//   //   }, this);
//   // },

//   enable: function() {
//     var map = this._map;

//     if (this._enabled) { return this; }

//     // disable 'doubleClickZoom' if enabling 'doubleClickLabels'
//     if (map.doubleClickZoom.enabled()) {
//       map.doubleClickZoom.disable();
//     }

//     // signify to collection/instance classes to listen for 'singleclick'
//     this._map.fire('singleclickon');

//     this._enabled = true;
//     this.addHooks();
//     this.addHooks();
//     return this;
//   },

//   disable: function() {
//     if (!this._enabled) { return this; }

//     this._map.fire('singleclickoff');

//     this._enabled = false;
//     this.removeHooks();

//     return this;
//   },

//   // _clearSingleClickTimeout: function() {
//   //   if (this._singleClickTimeout !== null) {
//   //     console.log('clearclicktimeout');
//   //     clearTimeout(this._singleClickTimeout);
//   //     this._singleClickTimeout = null;
//   //   }
//   // },

//   // _scheduleSingleClick: function(e) {
//   //   var oe = e.originalEvent;
//   //   var map = this._map;

//   //   // prevents deselection in case of box selector
//   //   if (oe && oe.shiftKey) { return; }

//   //   console.log('singleclick');
//   //   this._clearSingleClickTimeout();

//   //   // this._singleClickTimeout = (
//   //   // setTimeout(L.bind(this._fireSingleClick, e, this), 250)
//   //   // );
//   //   this._singleClickTimeout = setTimeout(function() {
//   //     // if (oe && !oe._stopped) {
//   //     map.fire('singleclick', L.extend(e, {type: 'singleclick'}));
//   //     // }
//   //   }, 250);
//   // },

//   // _cancelSingleClick: function() {
//   //   // This timeout is key to workaround an issue where double-click events
//   //   // are fired in this order on some touch browsers: ['click', 'dblclick', 'click']
//   //   // instead of ['click', 'click', 'dblclick']
//   //   setTimeout(L.bind(this._clearSingleClickTimeout, this), 0);
//   // },

//   _onDoubleClick: function() {
//     var map = this._map;
//     var labels = map._labels;

//     console.log('doubleclick');

//     this._cancelSingleClick();

//     if (labels.options.opacity === 1) {
//       labels.options.opacity = 0;
//       labels.setOpacity(0);
//     } else {
//       labels.options.opacity = 1;
//       labels.setOpacity(1);
//     }
//   },
// });

// L.Map.addInitHook('addHandler', 'doubleClickLabels', L.Map.DoubleClickLabels);
L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
  addHooks: function() {
    L.DomEvent.on(this._map, {
      // pointerdown: this._fireIfSingle,
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  removeHooks: function() {
    // this._map.off({
    //   click: this._fireIfSingle,
    //   dblclick: this._onDoubleClick,
    // }, this);
    L.DomEvent.on(this._map, {
      // tap: this._fireIfSingle,
      // pointerdown: this._fireIfSingle,
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick,
    }, this);
  },

  enable: function() {
    var map = this._map;

    if (this._enabled) { return this; }

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
    // var map = this._map;

    if (!this._enabled) { return this; }

    this._enabled = false;
    this.removeHooks();

    // // enable 'doubleClickZoom' if 'doubleClickLabels' is disabled.
    // if (!map.doubleClickZoom.enabled()) {
    //   map.doubleClickZoom.enable();
    // }

    return this;
  },

  _fireIfSingle: function(e) {
    var map = this._map;
    var eo = e.originalEvent;

    // prevents deselection in case of box selector
    if (eo && eo.shiftKey) { return; }

    map._clicked += 1;
    this._map._clickTimeout = setTimeout(function() {
      if (map._clicked === 1) {
        map._clicked = 0;
        map.fire('singleclick', {type: 'singleclick'});
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

    map._clicked += 1;
    setTimeout(function() {
      if (map._clicked === 1) {
        map._clicked = 0;
        map.fire('singleclick', L.extend(e, {type: 'singleclick'}));
      }
    }, 250);
  },

  _onDoubleClick: function(e) {
    var map = this._map;

    map._clicked = 0;

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

