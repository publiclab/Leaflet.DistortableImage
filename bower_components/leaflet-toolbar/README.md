Leaflet.Toolbar
===============

[![Build Status](https://travis-ci.org/Leaflet/Leaflet.toolbar.svg?branch=master)](https://travis-ci.org/Leaflet/Leaflet.toolbar)
[![Coverage Status](https://img.shields.io/coveralls/Leaflet/Leaflet.toolbar.svg)](https://coveralls.io/r/Leaflet/Leaflet.toolbar)

Leaflet.Toolbar provides flexible, extensible toolbar interfaces for Leaflet maps.

### Examples

View examples for [control-style](https://justinmanley.github.io/leaflet-draw-toolbar/examples/control.html) and [popup-style](https://justinmanley.github.io/leaflet-draw-toolbar/examples/popup.html) toolbars using Leaflet.draw, as well as a [minimal example](http://leaflet.github.io/Leaflet.toolbar/examples/minimal.html). NOTE: If you want to use this library with Leaflet.draw, you should use the toolbars provided with [leaflet-draw-toolbar](https://github.com/justinmanley/leaflet-draw-toolbar).

### Usage

Include Leaflet.Toolbar in your JavaScript project using `npm install leaflet-toolbar`.

You can then include Leaflet.Toolbar in your web application by adding the following HTML tags (paths below are relative to your project's root):

```
<script src="node_modules/leaflet-toolbar/dist/leaflet.toolbar.js"></script>
<link rel="stylesheet" href="node_modules/leaflet-toolbar/dist/leaflet.toolbar.css"/>
```

Leaflet.Toolbar exports two toolbar styles that can be used out of the box: a popup-style toolbar, and a control-style toolbar.  To instantiate a control-style toolbar and add it to the map, use:
```javascript
new L.Toolbar.Control({
	actions: [MyToolbarAction1, MyToolbarAction2, ...]
}).addTo(map);
```

For more information, see the [API Reference](https://github.com/leaflet/Leaflet.Toolbar/wiki/API-Reference) and [Building custom toolbars](https://github.com/leaflet/Leaflet.Toolbar/wiki/Building-custom-toolbars) on the wiki.

### Contributing

Contributors are welcomed!

Once you've cloned this repo, you'll need to run `npm install` in the project root to install the development dependencies using `npm`.

Leaflet.Toolbar uses `grunt` to run development and build tasks. You'll need to have the grunt command line interface installed: `npm install -g grunt-cli`. Once you've done this, running `grunt` without any arguments in the project root will watch the project source and lint, test, and build whenever the source files are modified.  Additional tasks that may be useful for development are specified in the [`Gruntfile`](https://github.com/leaflet/Leaflet.Toolbar/blob/master/Gruntfile.js).

### Testing

Run the test suite using `npm test`.

### Documentation and Examples

The examples in the gh-pages branch can be updated using Grunt: `grunt gh-pages`. This will create a new commit *and* push that commit to your gh-pages branch on GitHub. If you'd like to simply preview the gh-pages branch, you can run `grunt gh-pages --gh-pages-push false`.

Contributors are encouraged to open pull requests early to facilitate discussion about proposed changes!

Please follow the [Leaflet contribution guide](https://github.com/Leaflet/Leaflet/blob/master/CONTRIBUTING.md).

### Thanks

Thanks to [@jacobtoye](https://github.com/jacobtoye) for the excellent Leaflet.draw library which was the inspiration for Leaflet.Toolbar. And, of course, thanks to [@mourner](https://github.com/mourner) for a fantastic open-source mapping library.
