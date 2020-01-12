grunt-svg-sprite [![NPM version][npm-image]][npm-url] [![NPM downloads][npm-downloads]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]  [![Development Dependency Status][devdepstat-image]][devdepstat-url]  [![Peer Dependency Status][peerdepstat-image]][peerdepstat-url]
==========

is a Grunt plugin wrapping around [svg-sprite](https://github.com/jkphl/svg-sprite) which **takes a bunch of [SVG](http://www.w3.org/TR/SVG/) files**, optimizes them and bakes them into **SVG sprites** of several types:

*	Traditional [CSS sprites](http://en.wikipedia.org/wiki/Sprite_(computer_graphics)#Sprites_by_CSS) for use as background images,
*	CSS sprites with **pre-defined `<view>` elements**, useful for foreground images as well,
*	inline sprites using the **`<defs>` element**,
*	inline sprites using the **`<symbol>` element**
*	and [SVG stacks](http://simurai.com/blog/2012/04/02/svg-stacks/).

## Features & configuration? → [svg-sprite](https://github.com/jkphl/svg-sprite)

This document covers only Grunt specific installation and configuration aspects. For a full list of features and options, please see the [svg-sprite manual](https://github.com/jkphl/svg-sprite).

## Getting Started

This plugin requires Grunt `>=0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-svg-sprite --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-svg-sprite');
```

## The «svg_sprite» task

### Overview

In your project's Gruntfile, add a section named `svg_sprite` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
	svg_sprite		: {
		options		: {
			// Task-specific options go here.
		},
		your_target	: {
			// Target-specific file lists and/or options go here.
		},
	}
});
```

The task-specific `options` are optional and affect all defined targets. You may define as many targets (`your_target`) as you want.

### Targets

In the simplest case an «svg_sprite» target looks like this:

```js
your_target: {
	src			: ['path/to/assets/**/*.svg'],
	dest		: 'path/to/css/dir',
	options		: {
		// Target-specific options
	}
},
```

However, as the `path/to/assets` would become part of the shape IDs, you will most likely want to add a working directory in most cases:

```js
your_target: {
	expand		: true,
	cwd			: 'path/to/assets',
	src			: ['**/*.svg'],
	dest		: 'path/to/css/dir',
	options		: {
		// Target-specific options
	}
},
```

### Options

As **target-specific options** you may provide a [main configuration object](https://github.com/jkphl/svg-sprite/blob/master/docs/configuration.md) as described in the *svg-sprite* manual. Configuration-wise, *svg-sprite* and *grunt-svg-sprite* differ only in one respect:

#### options.dest → dest

Type: `String`
Default value: `'.'`

Instead of being nested inside the `options` object, *svg-sprite*'s `dest` property gets **promoted one level up** and becomes part of the Grunt target configuration itself (see examples above).

### Usage Examples

#### Basic example

In this very basic example, mostly default settings will be applied to create a traditional CSS sprite (bundle of SVG sprite and CSS stylesheet).

```js
grunt.initConfig({
	svg_sprite					: {
		basic					: {

			// Target basics
			expand				: true,
			cwd					: 'assets',
			src					: ['**/*.svg'],
			dest				: 'out',

			// Target options
			options				: {
				mode			: {
					css			: {		// Activate the «css» mode
						render	: {
							css	: true	// Activate CSS output (with default options)
						}
					}
				}
			}
		}
	}
});
```

The following files and directories are created:

```
out
`-- css
    |-- sprite.css
    `-- svg
        `-- sprite.css-495d2010.svg
```

> The cryptical looking part in the SVG's file name is the result of *svg-sprite*'s cache busting feature which is enabled by default for CSS sprites. We'll turn this off in the next example.

#### More complex example

The following example is a little more complex:

* We'll create a **«view» CSS sprite** and a **«symbol» sprite** in one go.
* Instead of CSS, we'll render a **Sass stylesheet** resource for the «view» sprite.
* We'll **turn off cache busting** for the «view» sprite and create **extra CSS rules specifying each shape's dimensions**.
* We'll **downscale the SVG shapes** to 32×32 pixels if necessary and **add 10 pixels padding** to all sides.
* We'll keep the intermediate SVG source files.

```js
grunt.initConfig({
	svg_sprite					: {
		complex: {

			// Target basics
			expand					: true,
			cwd						: 'assets',
			src						: ['**/*.svg'],
			dest					: 'out',

			// Target options
			options					: {
				shape				: {
					dimension		: {			// Set maximum dimensions
						maxWidth	: 32,
						maxHeight	: 32
					},
					spacing			: {			// Add padding
						padding		: 10
					},
					dest			: 'out/intermediate-svg'	// Keep the intermediate files
				},
				mode				: {
					view			: {			// Activate the «view» mode
						bust		: false,
						render		: {
							scss	: true		// Activate Sass output (with default options)
						}
					},
					symbol			: true		// Activate the «symbol» mode
				}
			}
		}
	}
});
```

The following files and directories are created:

```
out
|-- intermediate-svg
|   |-- weather-clear.svg
|   |-- weather-snow.svg
|   `-- weather-storm.svg
|-- symbol
|   `-- svg
|       `-- sprite.symbol.svg
`-- view
    |-- sprite.scss
    `-- svg
        `-- sprite.view.svg
```

#### Advanced features

For more advanced features like

*	[custom transformation](https://github.com/jkphl/svg-sprite/blob/master/docs/configuration.md#svg-transformations),
*	[meta data injection](https://github.com/jkphl/svg-sprite/blob/master/docs/meta-data.md),
*	[customizing output templates](https://github.com/jkphl/svg-sprite/blob/master/docs/templating.md) or
*	introducing new output formats

please refer to the [svg-sprite manual](https://github.com/jkphl/svg-sprite).


Contributing
------------

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).


Changelog
---------

Please refer to the [changelog](CHANGELOG.md) for a complete release history.


Legal
-----
Copyright © 2018 Joschi Kuphal <joschi@kuphal.net> / [@jkphl](https://twitter.com/jkphl). *grunt-svg-sprite* is licensed under the terms of the [MIT license](LICENSE.txt). The contained example SVG icons are part of the [Tango Icon Library](http://tango.freedesktop.org/Tango_Icon_Library) and belong to the Public Domain.


[npm-url]: https://npmjs.org/package/grunt-svg-sprite
[npm-image]: https://badge.fury.io/js/grunt-svg-sprite.svg
[npm-downloads]: https://img.shields.io/npm/dm/grunt-svg-sprite.svg

[travis-url]: http://travis-ci.org/jkphl/grunt-svg-sprite
[travis-image]: https://secure.travis-ci.org/jkphl/grunt-svg-sprite.svg

[depstat-url]: https://david-dm.org/jkphl/grunt-svg-sprite
[depstat-image]: https://david-dm.org/jkphl/grunt-svg-sprite.svg
[devdepstat-url]: https://david-dm.org/jkphl/grunt-svg-sprite#info=devDependencies
[devdepstat-image]: https://david-dm.org/jkphl/grunt-svg-sprite/dev-status.svg
[peerdepstat-url]: https://david-dm.org/jkphl/grunt-svg-sprite#info=peerDependencies
[peerdepstat-image]: https://david-dm.org/jkphl/grunt-svg-sprite/peer-status.svg
