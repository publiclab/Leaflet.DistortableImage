Leaflet.DistortableImage
===================

[![Build Status](https://travis-ci.org/publiclab/Leaflet.DistortableImage.svg?branch=master)](https://travis-ci.org/publiclab/Leaflet.DistortableImage)

A Leaflet extension to distort images -- "rubbersheeting" -- for the [MapKnitter.org](http://mapknitter.org) ([src](https://github.com/publiclab/mapknitter)) image georectification service by [Public Lab](http://publiclab.org). Leaflet.DistortableImage allows for perspectival distortions of images, client-side, using CSS3 transformations in the DOM.

Advantages include:

* it can handle over 100 images smoothly, even on a smartphone.
* images can be right-clicked and downloaded individually in their original state
* CSS3 transforms are GPU-accelerated in most (all?) browsers, for a very smooth UI
* no need to server-side generate raster GeoTiffs, tilesets, etc in order to view distorted imagery layers
* images use DOM event handling for real-time distortion
* [full resolution download option](https://github.com/publiclab/Leaflet.DistortableImage/pull/100) for large images, using WebGL acceleration

[Download as zip](https://github.com/publiclab/Leaflet.DistortableImage/releases) or clone to get a copy of the repo.

This plugin has basic functionality, and is in production as part of MapKnitter, but there are [plenty of outstanding issues to resolve](https://github.com/publiclab/Leaflet.DistortableImage/issues). Please consider helping out!

The recommended Google satellite base layer can be integrated using this Leaflet plugin: https://gitlab.com/IvanSanchez/Leaflet.GridLayer.GoogleMutant

Here's a screenshot:

![screenshot](example.png)

## Demo

Check out this [simple demo](https://publiclab.github.io/Leaflet.DistortableImage/examples/index.html).

And watch this GIF demo:

![demo gif](https://raw.githubusercontent.com/publiclab/mapknitter/master/public/demo.gif)

To test the code, open `index.html` in your browser and click and drag the markers on the edges of the image. The image will show perspectival distortions.

## Usage

```js
// basic Leaflet map setup
map = new L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tiles.mapbox.com/v3/anishshah101.ipm9j6em/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'examples.map-i86knfo3'
}).addTo(map);

// create an image
img = new L.DistortableImageOverlay(
  'example.png', {
    corners: [
      new L.latLng(51.52,-0.10),
      new L.latLng(51.52,-0.14),
      new L.latLng(51.50,-0.10),
      new L.latLng(51.50,-0.14)
    ],
    fullResolutionSrc: 'large.jpg', // optionally pass in a higher resolution image to use in full-res exporting
    suppressToolbar: false // defaults to false, but you can turn off the toolbar interface and build your own
  }
).addTo(map);

L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing); // enable editing

```

## Full-resolution download

We've added a GPU-accelerated means to generate a full resolution version of the distorted image; it requires two additional dependencies to enable; see how we've included them in the demo:


```
<script src="../node_modules/webgl-distort/dist/webgl-distort.js"></script>
<script src="../node_modules/glfx-js/dist/glfx.js"></script>
```
## "Reveal" functionality

The "reveal" tool extends the native `EditOverlayAction` Leaflet class behaviour and hides some user-specified tools, hence saving up space in the toolbar and giving more room to your mapview! Refer the comments below for a detailed explaination on what happens when the "reveal" tool is executed.

```js
function() {

  /* specify an array of tools that will initially be
   hidden inside the reveal tool in the toolbar
   also, input is taken from the exposed API in the HTML */
  var hidden_tools = this._overlay.options.hidden_tools, i;

  /* On reveal, add all the "hidden" tools to
  the toolbar */
  for (i = 0; i < hidden_tools.length; i++) {
    this._overlay._addTool(hidden_tools[i]);
  }

  /* Remove "reveal" tool from the toolbar */
  this._overlay._removeTool(ToggleReveal);

  this._overlay.editing._hideToolbar();
}
```
## Adding Custom Toolbars

You also have the ability to incorporate additional toolbars into view by defining appropriate fields in the exposed `custom_toolbar` API inside your HTML, for eg., we at Public Lab use a custom keymapping guide toolbar by defining it as,
```js
var keymapper = {
  position: "topright",
  el: "div",
  styleClass: "l-container",
  DOMString:
    "<b><center><h3>Keymappings</h3><center><hr/></center></center><ul><li>L: Lock overlay</li><li>O: Outline overlay</li><li>R: Rotate overlay</li><li>RR: Distort overlay</li><li>T: Transparent overlay&nbsp;&nbsp;&nbsp;&nbsp;</li><li>DEL: Remove overlay</li></ul></b>"
};
```
and sending it to the function below by defining a `customToolbarArray: [keymapper]` field during the `DistortableImageOverlay` object instantiation.

```js
function(map, position, el, styleClass, DOMString) {
  var custom_toolbar = L.control({ position: position });

  custom_toolbar.onAdd = function() {
    var el_wrapper = L.DomUtil.create(el, styleClass);
    el_wrapper.innerHTML = DOMString;
    return el_wrapper;
  };
  custom_toolbar.addTo(map);
}
```

## Usage

```js
// basic Leaflet map setup
map = new L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tiles.mapbox.com/v3/anishshah101.ipm9j6em/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'examples.map-i86knfo3'
}).addTo(map);

// keymap guide
var keymapper = {
  position: "topright",
  el: "div",
  styleClass: "l-container",
  DOMString:
    "<b><center><h3>Keymappings</h3><center><hr/></center></center><ul><li>L: Lock overlay</li><li>O: Outline overlay</li><li>R: Rotate overlay</li><li>RR: Distort overlay</li><li>T: Transparent overlay&nbsp;&nbsp;&nbsp;&nbsp;</li><li>DEL: Remove overlay</li></ul></b>"
};

// create an image
img = new L.DistortableImageOverlay("example.png", {
  suppressToolbar: false,
  customToolbarArray: [keymapper],
  hidden_tools: [ToggleEditable, ToggleExport, RemoveOverlay],
  corners: [
    new L.latLng(51.52, -0.1),
    new L.latLng(51.52, -0.14),
    new L.latLng(51.5, -0.1),
    new L.latLng(51.5, -0.14)
  ],
  fullResolutionSrc: "large.jpg"
}).addTo(map);

L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing); // enable editing

```

****

## Setup

1. From the root directory, run `npm install` or `sudo npm install`
2. Open examples/index.html in a browser

## Contributing

1. This project uses `grunt` to do a lot of things, including concatenate source files from /src/ to /DistortableImageOverlay.js. But you may need to install grunt-cli: `npm install -g grunt-cli` first.
2. Run `grunt` in the root directory, and it will watch for changes and concatenate them on the fly.

To build all files from `/src/` into the `/dist/` folder, run `grunt concat:dist`.

****

### Contributors

* Anish Shah, [@anishshah101](https://github.com/anishshah101)
* Justin Manley, [@manleyjster](https://github.com/manleyjster)
* Jeff Warren [@jywarren](https://github.com/jywarren)

Many more at https://github.com/publiclab/Leaflet.DistortableImage/graphs/contributors
