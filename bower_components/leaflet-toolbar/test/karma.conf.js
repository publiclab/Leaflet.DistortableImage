// Karma configuration
// Generated on Tue Jul 08 2014 12:47:31 GMT-0500 (CDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      '../node_modules/leaflet/dist/leaflet-src.js',
      '../node_modules/leaflet/dist/leaflet.css',
      '../node_modules/chai/chai.js',
      '../node_modules/sinon/pkg/sinon-1.10.3.js',
      '../dist/leaflet.toolbar.css',
      '../src/Toolbar.js',
      '../src/ToolbarAction.js',
      '../src/Toolbar.*.js',
      '../test/SpecHelper.js',
      '../test/src/*Spec.js',
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '../src/*.js': 'coverage'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ 'mocha', 'coverage' ],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [ 'PhantomJS' ],

    plugins: [
      'karma-mocha',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
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
