'use strict';

/**
 * grunt-svg-sprite is a Grunt plugin for creating SVG sprites
 *
 * @see https://github.com/jkphl/grunt-svg-sprite
 *
 * @author Joschi Kuphal <joschi@kuphal.net> (https://github.com/jkphl)
 * @copyright © 2018 Joschi Kuphal
 * @license MIT https://raw.github.com/jkphl/grunt-svg-sprite/master/LICENSE.txt
 */

module.exports = function(grunt) {
	var SVGSpriter			= require('svg-sprite'),
	path					= require('path'),
	pretty					= require('prettysize'),
	chalk					= require('chalk');

	grunt.registerMultiTask('svg_sprite', 'Takes a folder of SVG images and creates an SVG sprite along with suitable CSS / Sass / LESS / Stylus etc. resources out of them', function() {
		var spriter			= null,
		config				= null,
		errors				= [],
		rtrim				= function(str, strip) {
			while (str.length && strip.length && (str.substr(-strip.length) === strip)) {
				str			= str.substr(0, str.length - strip.length);
			}
			return str;
		};

		// Iterate over all specified file groups.
		this.files.forEach(function(f) {
			config			= config || this.options({dest: path.resolve(f.orig.dest)});
			var cwd			= rtrim(path.normalize(f.orig.cwd || ''), path.sep),
			cwdAbs			= path.resolve(cwd || '.'),
			expand			= !!f.orig.expand;

			if (spriter === null) {
				spriter		= new SVGSpriter(config);
				spriter.config.log.on('logging', function (transport, level, msg) {
					if (level === 'error') {
						errors.push(msg);
					}
				});
			}

			f.src.map(function(file) {
				file		= path.normalize(file);
				return path.resolve(cwdAbs, (expand && cwd.length && (file.indexOf(cwd + path.sep) === 0)) ? file.substr(cwd.length + path.sep.length) : file);
			}).filter(function(file) {
				if (!grunt.file.exists(file)) {
					grunt.log.warn('Source file "' + file + '" not found.');
					return false;
				}
				return true;
			}).forEach(function(file) {
				this.add(file, path.relative(cwdAbs, file), grunt.file.read(file));
			}, spriter);
		}, this);

		if (spriter) {
			var done		= this.async();
			spriter.compile(function(error, result) {
				console.log();
				if (error) {
					grunt.fail.warn('SVG sprite compilation failed with message: ' + error, 3);
				} else {
					for (var mode in result) {
						for (var resource in result[mode]) {
							var file		= result[mode][resource];
							if (grunt.file.write(file.path, file.contents)) {
								grunt.log.writeln(chalk.green('✔ ') + file.relative + chalk.gray(' (' + pretty(file.contents.length) + ')'));
							}
						}
					}
					if (errors.length) {
						console.log();
						grunt.fail.warn('The following errors occured:\n✖ ' + errors.join('\n✖ ') + '\n');
					}
				}
				done();
			});
		}
	});
};
