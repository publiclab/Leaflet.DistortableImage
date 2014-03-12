ImageDistortLeaflet
===================

A Leaflet extension to distort images.

Download as zip or clone to get a copy of the Repo.

To test the code, open index.html in your browser and click and drag the markers on the edges of the image. The image will show linear distortions.

Structure:

The leaflet folder contains the leaflet dependencies.

The scripts folder contains the javascript files and the jquery and require.js library. 
The ImageDistortLeaflet.js is the new file which contains the functions to create a canvas, load the image and distort it when the markers are dragged.
The main.js uses the ImageDistortLeaflet.js to make the map and the canvas on the html.


