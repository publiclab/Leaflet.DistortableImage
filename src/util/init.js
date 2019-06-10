
  function init(utils, init_, projector, paths) { // jshint ignore:line
    var obj = init_(paths);
    var images = document.getElementsByClassName('leaflet-image-layer leaflet-zoom-animated');
    var array = [];
    for (var i =0; i<images.length; i++) {
        images[i].addEventListener('click', function (e) { // jshint ignore:line
          projector(utils, e, array, obj.L_images, obj.map);
        });
    }
  }
