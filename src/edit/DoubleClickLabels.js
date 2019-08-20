L.Map.mergeOptions({ 
  doubleClickLabels: true, 
  doubleClickZoom: false
});

L.Map.DoubleClickLabels = L.Map.DoubleClickZoom.extend({
  addHooks: function() {
    this._map.clicked = 0;

    this._map.on({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick
    }, this);
  },

  removeHooks: function() {
    this._map.off({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick
    }, this);
  },

  _fireIfSingle: function() {
    var map = this._map;
    map.clicked += 1;
    setTimeout(function() {
      if (map.clicked === 1) {
        map.clicked = 0;
        map.fire('singleclick', { deselect: true });
      }
    }, 300);
  },

  _onDoubleClick: function() {
    var map = this._map,
        labels = map._labels;

    map.clicked = 0;

    if (labels.options.opacity === 1) {
      labels.options.opacity = 0;
      labels.setOpacity(0);
    } else {
      labels.options.opacity = 1;
      labels.setOpacity(1);
    }
  }
});

L.Map.addInitHook('addHandler', 'doubleClickLabels', L.Map.DoubleClickLabels);
/** 
 * The 'doubleClickLabels' handler only runs instead of 'doubleClickZoom' when a googleMutant 
 * layer is added to the map using 'map.addGoogleMutant()' without the option labels: false.
 */
L.Map.addInitHook(function() {
  this.doubleClickLabels.disable();
  this.doubleClickZoom.enable();
});
