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

  removeHooks: function() {
    this._map.off({
      click: this._fireIfSingle,
      dblclick: this._onDoubleClick
    }, this);
  },

  _onDoubleClick: function() {
    var map = this._map,
        labels = map._labels;

    map.clicked = 0;

    if (labels.opacity === 1) {
      labels.opacity = 0;
      labels.setOpacity(0);
    } else {
      labels.opacity = 1;
      labels.setOpacity(1);
    }
  }
});

L.Map.addInitHook('addHandler', 'doubleClickLabels', L.Map.DoubleClickLabels);
