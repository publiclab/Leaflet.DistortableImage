webgl-distort
====

A prototype, demonstration project to test full-resolution perspective transforms done in-browser on the client side using WebGL. This would be useful for [MapKnitter](https://mapknitter.org) (https://github.com/publiclab/mapknitter) or its interface core library, [Leaflet.DistortableImage](https://github.com/publiclab/Leaflet.DistortableImage), where users could individually download their distorted images at full resolution for print or other uses. 

Try this out in the demo at https://jywarren.github.io/webgl-distort

Eventually, it could be packaged as a bower-installable library which simply accepts an image URL and a begin and end matrix, and initiates a download (so as not to cause the browser to render the large dataURL).

This makes use of the [glfx.js](https://github.com/evanw/glfx.js) library. 

Current usage is:

```html
  <img id="img" src="examples/example-1024.jpg" />

  <script>
    (function() {
 
      warpWebGl(
        'img',
        [0, 0,   1023, 0,    1023, 767, 0,   767], // matrix 1 (before) corner coordinates, NW, NE, SE, SW
        [0, 100, 1023, -50,  1223, 867, 100, 767]  // matrix 2 (after) corner coordinates
      );
 
    })();
  </script>
```
