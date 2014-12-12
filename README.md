Leaflet.DistortableImageOverlay
===================

A Leaflet extension to distort images -- "rubbersheeting" -- mainly for the [MapKnitter.org](http://mapknitter.org) ([src](https://github.com/publiclab/mapknitter)) image georectification service by [Public Lab](http://publiclab.org).

Download as zip or clone to get a copy of the Repo.

To test the code, open index.html in your browser and click and drag the markers on the edges of the image. The image will show perspectival distortions.

A copy is also running at https://publiclab.github.io/ImageDistortLeaflet

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

* locking of images
* remove addTo(map) from initialize
* add bringToFront() to onclick
* solve tool disappearance - watch the DOM
* hide handles when not active
* image selection and cueing btns
* figure out what `_bounds` is for and if we really need to update it
* need to make easybuttons for image manip appear only when you've selected one
* map.on('click') should deselect all images
* ensure it's easy to attach event callback to 'deselect' for saving
  * and/or mouseup?
* improve image selection interface
* finishing transparency and outlining
  * make outline() and opacity() of L.DistortableImage, so img.outline() 

* image ordering (will do later, perhaps, as MapKnitter doesn't have a way to store it yet) 
* there are some Chrome/Firefox bugs on Android
* hotkey defaults that can be turned off?

o: outline
t: transparency
d: distort
r: rotate
l: lock
shift-drag: scale, no rotate

=================

##Leftovers, persnickity stuff:

* make shift-drag drag the nearest marker, not the image?
* long-click or double-click to lock an image? Can't get more advanced event handling working, only .onclick = function, which doesn't support dblclick event
* scale is not true scaling -- it moves points equally from the "center" which causes distortion in some edge cases


