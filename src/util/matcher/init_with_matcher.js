/* jshint ignore:start */
function init_with_matcher(add, paths) {
  Promise.resolve(
    new orbify(paths[0], paths[1], {
      browser: true
    }).utils
  ).then(function(utils) {
    var array = [];
    var obj = init_(add);
    var images = document.getElementsByClassName(
      "leaflet-image-layer leaflet-zoom-animated"
    );
    var ext = function(e) {
      setInterval(function() {
        projector(utils, e, array, obj);
      }, 10);
    };
    for (var i = 0; i < images.length; i++) {
      L.DomEvent.on(images[i], "click", ext);
    }
  });
}
/* jshint ignore:end */
