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
                    'test/*/*.js',
                    'Gruntfile.js'
                ],
                tasks: [ 'build:js' ]
            }
        },

        concat: {
            dist: {
                src: [
                    'src/util/MatrixUtil.js',
                    'src/util/DomUtil.js',
                    'src/ImageMarker.js',
                    'src/DistortableImageOverlay.js',
                    'src/DistortableImage.Edit.js'
                ],
                dest: 'DistortableImageOverlay.js',
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
        'concat:dist'
    ]);

    grunt.registerTask('build:css', [ 'less' ]);
};
