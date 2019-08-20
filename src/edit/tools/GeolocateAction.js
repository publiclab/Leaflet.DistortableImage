L.GeolocateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    var use = 'explore';

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: 'Geolocate Image'
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: function() {
    var image = this._overlay.getElement();

    // eslint-disable-next-line new-cap
    EXIF.getData(image, L.EXIF(image));
  }
});
