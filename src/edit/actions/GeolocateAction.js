L.GeolocateAction = L.EditAction.extend({
  initialize: function(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'explore',
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
