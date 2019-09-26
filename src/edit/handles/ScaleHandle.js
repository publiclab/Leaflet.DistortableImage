L.ScaleHandle = L.EditHandle.extend({
  options: {
    TYPE: 'scale',
    icon: L.icon({
      iconUrl:
        // eslint-disable-next-line max-len
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  _onHandleDrag: function() {
    var overlay = this._handled;
    var map = overlay._map;
    var edgeMinWidth = overlay.edgeMinWidth;
    var formerLatLng = overlay.getCorner(this._corner);
    var newLatLng = this.getLatLng();
    var scale = this._calculateScalingFactor(formerLatLng, newLatLng);

    /*
     * checks whether the "edgeMinWidth" property is set and tracks the minimum edge length;
     * this enables preventing scaling to zero, but we might also add an overall scale limit
     */

    if (!edgeMinWidth) { edgeMinWidth = 50; } /* just in case */
    var corner1 = map.latLngToLayerPoint(overlay.getCorner(0));
    var corner2 = map.latLngToLayerPoint(overlay.getCorner(1));
    var w = Math.abs(corner1.x - corner2.x);
    var h = Math.abs(corner1.y - corner2.y);
    var distance = Math.sqrt(w * w + h * h);

    if (distance > edgeMinWidth || scale > 1) {
      overlay.scaleBy(scale);
      /*
       * running scale logic even for a scale ratio of 1
       * prevents a small, occasional marker flicker
       */
    } else {
      overlay.scaleBy(1);
    }
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },
});

L.scaleHandle = function(overlay, idx, options) {
  return new L.ScaleHandle(overlay, idx, options);
};
