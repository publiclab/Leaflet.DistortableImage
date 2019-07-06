L.EditAction = L.Toolbar2.Action.extend({
  initialize: function (map, overlay, options) {
    this._overlay = overlay;
    this._map = map;

    L.Toolbar2.Action.prototype.initialize.call(this, options);
  }
});
