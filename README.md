Leaflet.DistortableImageOverlay
===================

A Leaflet extension to distort images -- "rubbersheeting" -- mainly for the [MapKnitter.org](http://mapknitter.org) ([src](https://github.com/publiclab/mapknitter)) image georectification service by [Public Lab](http://publiclab.org).

Download as zip or clone to get a copy of the Repo.

To test the code, open index.html in your browser and click and drag the markers on the edges of the image. The image will show perspectival distortions.

A copy is also running at https://publiclab.github.io/ImageDistortLeaflet/examples/

This plugin is not yet complete!

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
* integrate creation of #inputimage DOM element into $L
* make shift-drag drag the nearest marker, not the image?
* scale is not true scaling -- it moves points equally from the "center" which causes distortion when scaling down a lot


