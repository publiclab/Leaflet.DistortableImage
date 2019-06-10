/* jshint ignore:start */
function init_with_matcher(add, paths) {
    Promise.resolve(new orbify(paths[0], paths[1], {
      browser: true
    }).utils).then(function (utils) {
      init(add, utils, init_, projector);
    });
  }
/* jshint ignore:end */
