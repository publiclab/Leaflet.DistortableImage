Leaflet.DistortableImage
===================

A Leaflet extension to distort images -- "rubbersheeting" -- for the [MapKnitter.org](http://mapknitter.org) ([src](https://github.com/publiclab/mapknitter)) image georectification service by [Public Lab](http://publiclab.org). Leaflet.DistortableImage allows for perspectival distortions of images, client-side, using CSS3 transformations in the DOM. 

Advantages include:

* it can handle over 100 images smoothly, even on a smartphone. 
* images can be right-clicked and downloaded individually in their original state
* CSS3 transforms are GPU-accelerated in most (all?) browsers, for a very smooth UI
* no need to server-side generate raster GeoTiffs, tilesets, etc in order to view distorted imagery layers
* images use DOM event handling for real-time distortion 

[Download as zip](https://github.com/publiclab/Leaflet.DistortableImage/releases) or clone to get a copy of the repo.

This plugin has basic functionality, and is in production as part of MapKnitter, but there are [plenty of outstanding issues to resolve](https://github.com/publiclab/Leaflet.DistortableImage/issues). Please consider helping out!

Here's a screenshot:

![screenshot](example.png)

Check out this [simple demo](https://publiclab.github.io/Leaflet.DistortableImage/examples/index.html).

##

Download as zip or clone to get a copy of the Repo.

To test the code, open index.html in your browser and click and drag the markers on the edges of the image. The image will show perspectival distortions.

****

##Setup

1. From the root directory, run `npm install` or `sudo npm install`
2. Open examples/index.html in a browser

##Contributing

1. This project uses `grunt` to do a lot of things, including concatenate source files from /src/ to /DistortableImageOverlay.js. But you may need to install grunt-cli: `npm install -g grunt-cli` first.
2. Run `grunt` in the root directory, and it will watch for changes and concatenate them on the fly.

****

##To do:

* there are some Chrome/Firefox bugs on Android
* shift-drag (scale with no rotate) doesnt work if you shift first, only if you drag first
* default to order by size -- maybe need a custom $L.customOrdering boolean?
* [plenty of other issues](https://github.com/publiclab/Leaflet.DistortableImage/issues)

##Lower priority:

* decide if we need to keep updating `_bounds`
* create img.toGeoJSON() so we can send a concise description of an image to MapKnitter, plus properties: 
  * locked
  * layer order
  * last touched/edited?
  * "{"type":"Feature","properties":{},"geometry":{"type":"Polygon","coordinates":[[[-0.08,51.509],[-0.06,51.503],[-0.047,51.51],[-0.08,51.509]]]}}"
* add onLock, onUnlock, onDistortEnd - and consider plumbing events properly
* add image ordering -- bringToFront() should be temporary only; we need img.raise() or img.lower() or img.raiseToTop() etc... also img.order() for current position in order
* add an img.revert() which reverts it to orig dimensions and rotation
* implement tab to select next image; $L.selectedIndex?

=================

##Leftovers, persnickity stuff:

* plumb or remove debug system
* make shift-drag drag the nearest marker, not the image?
* scale is not true scaling -- it moves points equally from the "center" which causes distortion when scaling down a lot

### Contributors

* Anish Shah, [@anishshah101](https://github.com/anishshah101)
* Justin Manley, [@manleyjster](https://github.com/manleyjster)
* Jeff Warren [@jywarren](https://github.com/jywarren)
