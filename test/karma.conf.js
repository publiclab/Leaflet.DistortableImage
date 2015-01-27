  // Karma configuration
// Generated on Tue Jul 08 2014 12:47:31 GMT-0500 (CDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      { pattern: 'examples/*.jpg', included: false, served: true },
      'node_modules/leaflet/dist/leaflet-src.js',
      'node_modules/leaflet/dist/leaflet.css',
      'node_modules/leaflet-toolbar/dist/leaflet.toolbar.js',
      'node_modules/leaflet-toolbar/dist/leaflet.toolbar.css',
      'node_modules/chai/chai.js',
      'node_modules/sinon/pkg/sinon.js',
      'src/util/*.js',
      'src/edit/EditHandle.js',
      'src/edit/LockHandle.js',
      'src/edit/DistortHandle.js',
      'src/edit/RotateHandle.js',
      'src/DistortableImageOverlay.js',
      'src/edit/DistortableImage.EditToolbar.js',      
      'src/edit/DistortableImage.Edit.js',
      'test/SpecHelper.js',
      'test/src/**/*Spec.js'
    ],


    // so that karma can serve examples/example.jpg
    proxies: {
      '/examples/': '/base/examples/'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ 'mocha', 'coverage' ],

    preprocessors: {
      '../src/**/*.js': 'coverage'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [ 'PhantomJS' ],


    plugins: [
      'karma-mocha',
      'karma-phantomjs-launcher',
      'karma-mocha-reporter',
      'karma-coverage'      
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    coverageReporter: {
      reporters: [
        { type: 'text', dir: '../coverage/', file: 'coverage.txt' },
        { type: 'lcovonly', dir: '../coverage/' },
        { type: 'html', dir: '../coverage/' }
      ]
    }    
    
  });
};
