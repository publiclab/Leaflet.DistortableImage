module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
      pkg: grunt.file.readJSON("package.json"),

      jshint: {
        options: {
          node: true,
          browser: true,
          esnext: true,
          bitwise: true,
          curly: true,
          eqeqeq: true,
          immed: true,
          indent: 4,
          latedef: true,
          newcap: true,
          noarg: true,
          regexp: true,
          undef: true,
          trailing: true,
          smarttabs: true,
          globals: {
            L: false,
            $: false,
            LeafletToolbar: false,
            warpWebGl: false,
            EXIF: false,
            alert: false,

            // Mocha

            describe: false,
            it: false,
            before: false,
            after: false,
            beforeEach: false,
            afterEach: false,
            chai: false,
            expect: false,
            sinon: false
          }
        },
        source: {
          src: ["src/**/*.js", "package.json"]
        },
        grunt: {
          src: ["Gruntfile.js"]
        }
      },

      karma: {
        development: {
          configFile: "test/karma.conf.js"
        },
        test: {
          configFile: "test/karma.conf.js"
        }
      },

      // Minify SVGs from svg directory, output to svg-min
      svgmin: {
        dist: {
          files: [
            {
              attrs: "fill",
              expand: true,
              cwd: "assets/icons/svg",
              src: ["*.svg"],
              dest: "assets/icons/svg-min/",
              ext: ".svg"
            }
          ]
        },
        options: {
          plugins: [
            { removeViewBox: false },
            { removeEmptyAttrs: false },
            { removeTitle: true } // addtitle will add it back in later
          ]
        }
      },

      svg_sprite: {
        options: {
          // Task-specific options go here.
        },
        dist: {
          expand: true,
          cwd: "assets/icons/svg-min/",
          src: ["*.svg"],
          dest: "assets/icons/",
          options: {
            log: "info",
            shape: {
              dimension: {
                maxWidth: 18,
                maxHeight: 18
              }
            },
            mode: {
              symbol: {
                sprite: "sprite.symbol.svg",
                example: true
              }
            }
          }
        }
      },

      watch: {
        options: {
          livereload: true
        },
        source: {
          files: ["src/**/*.js", "test/**/*.js", "Gruntfile.js"],
          tasks: ["build:js"]
        }
      },

      concat: {
        dist: {
          src: [
            "src/util/*.js",
            "src/DistortableImageOverlay.js",
            "src/DistortableCollection.js",
            "src/edit/getEXIFdata.js",
            "src/edit/EditHandle.js",
            "src/edit/LockHandle.js",
            "src/edit/DistortHandle.js",
            "src/edit/RotateScaleHandle.js",
            "src/edit/RotateHandle.js",
            "src/edit/ScaleHandle.js",
            "src/edit/tools/EditAction.js",
            "src/edit/tools/DistortableImage.PopupBar.js",
            "src/edit/tools/DistortableImage.ControlBar.js",
            "src/edit/DistortableImage.Edit.js",
            "src/edit/DistortableImage.Keymapper.js",
            "src/edit/BoxSelector.js"
          ],
          dest: "dist/leaflet.distortableimage.js"
        }
      }
    });

    /* Run tests once. */
    grunt.registerTask('test', [ 'jshint', 'karma:test' ]);

    /* Default (development): Watch files and lint, test, and build on change. */
    grunt.registerTask('default', ['karma:development:start', 'watch']);

    grunt.registerTask('build', [
        'jshint',
        'karma:development:start',
        'svgmin',
        'svg_sprite',
        'coverage',
        'concat:dist'
    ]);

    grunt.registerTask('coverage', 'Custom commmand-line reporter for karma-coverage', function() {
        var coverageReports = grunt.file.expand('coverage/*/coverage.txt'),
            reports = {},
            report, i, len;

        for (i = 0, len = coverageReports.length; i < len; i++) {
            report = grunt.file.read(coverageReports[i]);
            if (!reports[report]) {
                reports[report] = [coverageReports[i]];
            } else {
                reports[report].push(coverageReports[i]);
            }
        }

        for (report in reports) {
            if (reports.hasOwnProperty(report)) {
                for (i = 0, len = reports[report].length; i < len; i++) {
                    grunt.log.writeln(reports[report][i]);
                }
                grunt.log.writeln(report);
            }
        }
    });
};
