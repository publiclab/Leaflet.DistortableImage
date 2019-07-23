L.Map.include({
  _newLayerPointToLatLng: function(point, newZoom, newCenter) {
    var topLeft = L.Map.prototype._getTopLeftPoint
      .call(this, newCenter, newZoom)
      .add(L.Map.prototype._getMapPanePos.call(this));
    return this.unproject(point.add(topLeft), newZoom);
  }
});
