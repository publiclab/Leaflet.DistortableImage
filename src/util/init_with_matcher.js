/* jshint ignore:start */
function init_with_matcher(paths) {
    Promise.resolve(new orbify(paths[0], paths[1], {
      browser: true
    }).utils).then(function (utils) {
      init(utils, init_, projector, paths);
    });
  }
/* jshint ignore:end */
