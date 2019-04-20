Leaflet.DistortableImage
===================

[![Build Status](https://travis-ci.org/publiclab/Leaflet.DistortableImage.svg?branch=master)](https://travis-ci.org/publiclab/Leaflet.DistortableImage)

A Leaflet extension to distort images -- "rubbersheeting" -- for the [MapKnitter.org](http://mapknitter.org) ([src](https://github.com/publiclab/mapknitter)) image georectification service by [Public Lab](http://publiclab.org). Leaflet.DistortableImage allows for perspectival distortions of images, client-side, using CSS3 transformations in the DOM.

Advantages include:

* It can handle over 100 images smoothly, even on a smartphone.
* Images can be right-clicked and downloaded individually in their original state
* CSS3 transforms are GPU-accelerated in most (all?) browsers, for a very smooth UI
* No need to server-side generate raster GeoTiffs, tilesets, etc. in order to view distorted imagery layers
* Images use DOM event handling for real-time distortion
* [Full resolution download option](https://github.com/publiclab/Leaflet.DistortableImage/pull/100) for large images, using WebGL acceleration

[Download as zip](https://github.com/publiclab/Leaflet.DistortableImage/releases) or clone the repo to get a local copy.

This plugin has basic functionality, and is in production as part of MapKnitter, but there are [plenty of outstanding issues to resolve](https://github.com/publiclab/Leaflet.DistortableImage/issues). Please consider helping out!

The recommended Google satellite base layer can be integrated using this Leaflet plugin: https://gitlab.com/IvanSanchez/Leaflet.GridLayer.GoogleMutant

Here's a screenshot:

![screenshot](example.png)

## Demo

Check out this [simple demo](https://publiclab.github.io/Leaflet.DistortableImage/examples/index.html).

And watch this GIF demo:

![demo gif](https://raw.githubusercontent.com/publiclab/mapknitter/master/public/demo.gif)

To test the code, open `index.html` in your browser and click and drag the markers on the edges of the image. The image will show perspectival distortions.

## Basic Usage

The most simple implementation to get started:

```js
// basic Leaflet map setup
map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tiles.mapbox.com/v3/anishshah101.ipm9j6em/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'examples.map-i86knfo3'
}).addTo(map);

// create an image
img = L.distortableImageOverlay(
  'example.png', {
    corners: [
      new L.latLng(51.52,-0.10),
      new L.latLng(51.52,-0.14),
      new L.latLng(51.50,-0.10),
      new L.latLng(51.50,-0.14)
    ],
  }
).addTo(map);

// enable editing
L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing); 

```

## Full-resolution download

We've added a GPU-accelerated means to generate a full resolution version of the distorted image; it requires two additional dependencies to enable; see how we've included them in the demo:


```
<script src="../node_modules/webgl-distort/dist/webgl-distort.js"></script>
<script src="../node_modules/glfx/glfx.js"></script>
```

When instantiating a Distortable Image, pass in a `fullResolutionSrc` option set to the url of the higher resolution image. This image will be used in full-res exporting. 



```js

// create basic map setup from above

// create an image - note the optional 
// fullResolutionSrc option is now passed in
img = L.distortableImageOverlay(
  'example.png', {
    corners: [
      new L.latLng(51.52,-0.10),
      new L.latLng(51.52,-0.14),
      new L.latLng(51.50,-0.10),
      new L.latLng(51.50,-0.14)
    ],
    fullResolutionSrc: 'large.jpg'
  }
).addTo(map);

L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing);

```

## Multiple Images

To test the multi-image interface, open `select.html`. Currently it supports multiple image selection and translations; image distortions still use the single-image interface.

  - Multiple images can be selected using <kbd>cmd</kbd> + `click` to toggle individual image selection.
  - Click on the map or hit the <kbd>esc</kbd> key to quickly deselect all images.
   
Our `DistortableCollection` class allows working with multiple images simultaneously. Say we instantiated 3 images, saved them to the variables `img`, `img2`, and `img3`, and enabled editing on all of them. To access the UI and functionalities available in the multiple image interface, pass them to the collection class:

```js
// OPTION 1: Pass in images immediately
L.distortableCollection([img, img2, img3]).addTo(map);

// OPTION 2: Instantiate an empty collection and pass in images later 
var imageFeatureGroup = L.distortableCollection().addTo(map);

imageFeatureGroup.addLayer(img);
imageFeatureGroup.addLayer(img2);
imageFeatureGroup.addLayer(img3);

```

## Image-ordering

For multiple images, we've also added a `ToggleOrder` action, that switches overlapping images back and forth into view by employing [`bringToFront()`](https://leafletjs.com/reference-1.4.0.html#popup-bringtofront) and [`bringToBack()`](https://leafletjs.com/reference-1.4.0.html#popup-bringtoback) from the Leaflet API. 

```js
ToggleOrder = EditOverlayAction.extend({
  options: {
    toolbarIcon: {
      html: '<span class="fa fa-sort"></span>',
      tooltip: 'Change order',
      title: 'Toggle order'
    }
  },

  addHooks: function ()
  {
    var editing = this._overlay.editing;

    editing._toggleOrder(); // toggles images into view
    this.disable();
  }
});

```

## Corners

The corners are stored as `L.latLng` objects
on the image, and can be accessed using our `getCorners()` method after the image is instantiated and added to the map.

Useful usage example: 

```js
// instantiate and add to map
img = L.distortableImageOverlay(...);
img.addTo(map);

// grab the initial corner positions
JSON.stringify(img.getCorners())
=> "[{"lat":51.52,"lng":-0.1},{"lat":51.52,"lng":-0.14},{"lat":51.5,"lng":-0.1},{"lat":51.5,"lng":-0.14}]"

// ...move the image around...

// check the new corner positions.
JSON.stringify(img.getCorners())
=> "[{"lat":51.51091971397745,"lng":-0.015994012355804447},{"lat":51.51091971397745,"lng":-0.05599111318588257},{"lat":51.49093697986642,"lng":-0.015994012355804447},{"lat":51.49093697986642,"lng":-0.05599111318588257}]"

// note there is an added level of precision after dragging the image for debugging purposes

```

### Corner

We further added a `getCorner(idx)` method used the same way as its plural counterpart but with an index passed to it.

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
﻿
