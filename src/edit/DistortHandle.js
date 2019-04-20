L.DistortHandle = L.EditHandle.extend({
  options: {
    TYPE: "distort",
    icon: new L.Icon({
      iconUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAChSURBVO3BIU4DURgGwNkvL2B6AkQTLBqP4QCoSm7DDXoBLBZHDbfgICAIZjEV3YTn9uVHdMZZtcnCfI13bIzxg0emg6Nm6QVbYz3jylEsXRrvwommb49X67jFkz80fR9Mb1YxTzqiWBSLYlEsikWxKBbFolgUi2JRLIpFsSgWxaJY03fHHOu40dH07bAzWCx9Ge/TiWbpHgdsjPGNB2f/yS+7xRCyiiZPJQAAAABJRU5ErkJggg==",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  },

  updateHandle: function() {
    this.setLatLng(this._handled._corners[this._corner]);
	},

  _onHandleDrag: function() {
    this._handled._updateCorner(this._corner, this.getLatLng());

    this._handled.fire("update");
    this._handled.editing._showToolbar();
  }
});
