ImageDistortLeaflet
===================

A Leaflet extension to distort images -- "rubbersheeting" -- mainly for the [MapKnitter.org](http://mapknitter.org) ([src](https://github.com/publiclab/mapknitter)) image georectification service by [Public Lab](http://publiclab.org).

Download as zip or clone to get a copy of the Repo.

To test the code, open index.html in your browser and click and drag the markers on the edges of the image. The image will show perspectival distortions.

A copy is also running at https://publiclab.github.io/ImageDistortLeaflet

This plugin is not yet complete!

##To do:

* set initial dimensions from image
* hide handles when not active
* solve tool disappearance
* restructure for multiple images - image selection and cueing btns
* rotate/scale -- copy in code from old MapKnitter
* figure out what `_bounds` is for and if we really need to update it
* make outline() and opacity() of L.DistortableImage, so img.outline() 
* need to make easybuttons for image manip appear only when you've selected one
* map.on('click') should deselect all images

=================

* make shift-drag drag the nearest marker, not the image?
* needs remaining global methods and variables ported into the $L namespace or put into the DistortableImage class methods (at bottom)


