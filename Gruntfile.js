module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
                unused: true,
                trailing: true,
                smarttabs: true,
                globals: {
                    L: false,
                    $: false,

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
                src: [ 'src/**/*.js', 'package.json' ]
            },
            grunt: {
                src: [ 'Gruntfile.js' ]
            }
        },

        karma: {
            development: {
                configFile: 'test/karma.conf.js',
                background: true
            },
            test: {
                configFile: 'test/karma.conf.js',
                background: false,
                singleRun: true
            }
        },

        watch: {
            options : {
                livereload: true
            },
            source: {
                files: [
                    'src/**/*.js',
                    'test/**/*.js',
                    'Gruntfile.js'
                ],
                tasks: [ 'build:js' ]
            }
        },

        concat: {
            dist: {
                src: [
                    'src/util/*.js',
                    'src/edit/EditHandle.js',
                    'src/edit/LockHandle.js',
                    'src/edit/DistortHandle.js',
                    'src/edit/RotateHandle.js',
                    'src/DistortableImageOverlay.js',
                    'src/edit/DistortableImage.EditToolbar.js',
                    'src/edit/DistortableImage.Edit.js',
                ],
                dest: 'dist/leaflet.distortableimage.js',
            }
        }
    });

    /* Run tests once. */
    grunt.registerTask('test', [ 'jshint', 'karma:test' ]);

    /* Default (development): Watch files and lint, test, and build on change. */
    grunt.registerTask('default', ['karma:development:start', 'watch']);

    grunt.registerTask('build', [
        'jshint',
        'karma:development:run',
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
