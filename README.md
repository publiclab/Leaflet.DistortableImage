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

* map.on('click') should deselect all images, but is unfort. triggered even when you click directly on an image
* fix image ordering -- bringToFront() kinda janky? check event sequence
* figure out what `_bounds` is for and if we really need to update it
* ensure it's easy to attach event callback to 'deselect' for saving
  * and/or mouseup?
* fix/separate transparency and outlining
* create/document easy properties so we can send a concise description of an image to MapKnitter in JSON: locked, four corners in lat/lng, last touched/edited, uniq id or name of editor? (this belongs in mapknitter, not here), layer order
* there are some Chrome/Firefox bugs on Android
* hotkey defaults that can be turned off?
  * t: transparency
  * shift-drag: scale, no rotate

=================

##Leftovers, persnickity stuff:

* make shift-drag drag the nearest marker, not the image?
* long-click or double-click to lock an image? Can't get more advanced event handling working, only .onclick = function, which doesn't support dblclick event
* scale is not true scaling -- it moves points equally from the "center" which causes distortion in some edge cases


