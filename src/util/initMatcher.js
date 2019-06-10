  function initMatcher(utils, projector, L_img_array, map) { // jshint ignore:line
    var images = document.getElementsByClassName('leaflet-image-layer leaflet-zoom-animated');
    var array = [];
    for (var i in images) {
      images[i].addEventListener('click', function (e) { // jshint ignore:line
        projector(utils, e, array, L_img_array, map);
      });
    }
  }
