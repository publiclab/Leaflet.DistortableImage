# Leaflet.DistortableImage

[![Build Status](https://travis-ci.org/publiclab/Leaflet.DistortableImage.svg?branch=master)](https://travis-ci.org/publiclab/Leaflet.DistortableImage)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/publiclab/Leaflet.DistortableImage/issues)
[![npm version](https://badge.fury.io/js/leaflet-distortableimage.svg)](https://badge.fury.io/js/leaflet-distortableimage)

A Leaflet extension to distort images -- "rubbersheeting" -- for the [MapKnitter.org](http://mapknitter.org) ([src](https://github.com/publiclab/mapknitter)) image georectification service by [Public Lab](http://publiclab.org). Leaflet.DistortableImage allows for perspectival distortions of images, client-side, using CSS3 transformations in the DOM.

Advantages include:

* It can handle over 100 images smoothly, even on a smartphone.
* Images can be right-clicked and downloaded individually in their original state
* CSS3 transforms are GPU-accelerated in most (all?) browsers, for a very smooth UI
* No need to server-side generate raster GeoTiffs, tilesets, etc. in order to view distorted imagery layers
* Images use DOM event handling for real-time distortion
* [Full resolution download option](https://github.com/publiclab/Leaflet.DistortableImage/pull/100) for large images, using WebGL acceleration

[Download as zip](https://github.com/publiclab/Leaflet.DistortableImage/releases) or clone the repo to get a local copy.

Also available [on NPM](https://www.npmjs.com/package/leaflet-distortableimage) as `leaflet-distortableimage`

The recommended Google satellite base layer can be integrated using this Leaflet plugin: https://gitlab.com/IvanSanchez/Leaflet.GridLayer.GoogleMutant

Here's a screenshot:

![screenshot](example.png)

## Setup - Single Image Interface

1. From the root directory, run `npm install` or `sudo npm install`

2. Open `examples/index.html` in a browser

## Demo

Check out this [simple demo](https://publiclab.github.io/Leaflet.DistortableImage/examples/index.html).

And watch this GIF demo:

![demo gif](https://raw.githubusercontent.com/publiclab/mapknitter/master/public/demo.gif)

To test the code, open `index.html` in your browser and click and drag the markers on the edges of the image. The image will show perspectival distortions.

## Basic Usage

The simplest implementation is to create a map, then create an image instance of `L.distortableImageOverlay` and add it onto the map:

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

// create an image and add it to the map
img = L.distortableImageOverlay('example.png').addTo(map);
```

By default, the image will be placed centered on the map view specified during initialization. 

 placed on the center  the map center center of the map

, {
  // 'corners' is the only required option for this class
  // and is in NW, NE, SW, SE order
  corners: [
    L.latLng(51.52,-0.14),
    L.latLng(51.52,-0.10),
    L.latLng(51.50,-0.14),
    L.latLng(51.50,-0.10)
  ],
}).addTo(map);

Options available to pass during `L.DistortableImageOverlay` initialization:

* [actions](#Actions)
* [corners](#corners)
* [selected](#selected)
* [mode](#mode)
* [fullResolutionSrc](#Full-resolution%20download)
* [keymapper](#keymapper)
* [suppressToolbar](#Suppress-Toolbar)

### Actions

* `actions` (*optional*, default: [ToggleTransparency, ToggleOutline, ToggleLock, ToggleRotateScale, ToggleOrder, Revert, Export, Delete], value: *array*)

If you would like to overrwrite the default toolbar actions available for an individual image's `L.Popup` toolbar, pass an array with the actions you want. Reference the available values [here](#Single-Image-Interface).

For example, to overrwrite the toolbar to only include the `ToggleTransparency` and `Delete` actions, and also add on the additional `ToggleScale` action:

``` JS
img = L.distortableImageOverlay('example.png', {
  corners: [
    L.latLng(51.52,-0.14),
    L.latLng(51.52,-0.10),
    L.latLng(51.50,-0.14),
    L.latLng(51.50,-0.10)
  ],
  actions: [ToggleTransparency, ToggleScale, Delete]
}).addTo(map);
```

### Corners

* `corners` (*optional*, default: an array of `L.latLng` objects which position the image on the center of the map, value: *array*)

Allows you to set an image's position on the map manually (somewhere other than center).

They should be passed as an array of `L.latLng` objects in NW, NE, SW, SE order (in a "Z" shape).

This will not have an effect on the map view, but it will determine the shape and dimensions of the rendered image.

They will be stored on the image. See the [Quick API Reference](#Quick-API-Reference) for their getter and setter methods. 

Example:

```js
img = L.distortableImageOverlay('example.png', {
  corners: [
    L.latLng(51.52,-0.14),
    L.latLng(51.52,-0.10),
    L.latLng(51.50,-0.14),
    L.latLng(51.50,-0.10)
  ]
}).addTo(map);

// you can grab the initial corner positions
JSON.stringify(img.getCorners())
=> "[{"lat":51.52,"lng":-0.14},{"lat":51.52,"lng":-0.1},{"lat":51.5,"lng":-0.14},{"lat":51.5,"lng":-0.1}]"

// ...move the image around...

// you can check the new corner positions.
JSON.stringify(img.getCorners())
=> "[{"lat":51.50685099607552,"lng":-0.06058305501937867},{"lat":51.50685099607552,"lng":-0.02058595418930054},{"lat":51.486652692081925,"lng":-0.06058305501937867},{"lat":51.486652692081925,"lng":-0.02058595418930054}]"

// note there is an added level of precision after dragging the image
```

### Selected

`selected` (*optional*, default: false, value: *boolean*)

By default, your image will initially appear on the screen as "unselected", meaning its toolbar and editing handles will not be visible. Interacting with the image, such as by clicking it, will make these components visible.

Some developers prefer that an image initially appears as "selected" instead of "unselected". In this case, we provide an option to pass `selected: true`.

Note: when working with the multi image interface, only the last overlay you pass `selected: true` to will appear with editing handles _and_ a toolbar.

### Mode

`mode` (*optional*, default: "distort", value: *string*)

Each primary editing mode corresponds to a separate editing handle.

This option sets the image's initial editing mode, meaning the corresponding editing handle will always appear first when you interact with the image.

Values available to pass to `mode` are: 
- **distort** (_default_): Distortion via individually draggable corners.

- **rotate**: Rotation only.

- **scale**: Resize only. 

- **rotateScale**: Free transform. Combines the rotate and scale modes into one.

- **lock**: Prevents any image actions (including those triggered from the toolbar, user gestures, and hotkeys) until the toolbar action [ToggleLock](#ToggleLock-(<kbd>l</kbd>)) is explicitly triggered (or its hotkey <kbd>l</kbd>).

In the below example, the image will be initialiazed with "rotateScale" handles:

```js
  img = L.distortableImageOverlay("example.png", {
    corners: [
      L.latLng(51.52, -0.14),
      L.latLng(51.52, -0.10),
      L.latLng(51.50, -0.14),
      L.latLng(51.50, -0.10)
    ],
    mode: "rotateScale",
  }).addTo(map);

L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing);
```

### Full-resolution download

`fullResolutionSrc` (*optional*)


We've added a GPU-accelerated means to generate a full resolution version of the distorted image; it requires two additional dependencies to enable; see how we've included them in the demo:

```HTML
<script src="../node_modules/webgl-distort/dist/webgl-distort.js"></script>
<script src="../node_modules/glfx/glfx.js"></script>
```

When instantiating a Distortable Image, pass in a `fullResolutionSrc` option set to the url of the higher resolution image. This image will be used in full-res exporting.

```JS
img = L.distortableImageOverlay('example.png', {
  corners: [
    L.latLng(51.52,-0.14),
    L.latLng(51.52,-0.10),
    L.latLng(51.50,-0.14),
    L.latLng(51.50,-0.10)
  ],
  fullResolutionSrc: 'large.jpg'
}).addTo(map);

L.DomEvent.on(img._image, 'load', img.editing.enable, img.editing);
```

### Suppress Toolbar

`suppressToolbar` (*optional*, default: false, value: *boolean*)

To initialize an image without its toolbar, pass it `suppressToolbar: true`.

Typically, editing actions are triggered through our toolbar interface or our predefined keybindings. If disabling the toolbar, the developer will need to implement their own toolbar UI or just use the keybindings. (WIP API for doing this)

This option will override other options related to the toolbar, such as [`selected: true`](#Selected)

## Setup - Multiple Image Interface

1. From the root directory, run `npm install` or `sudo npm install`

2. Open `examples/select.html` in a browser (todo -- add gh pages demo)

Our `DistortableCollection` class allows working with multiple images simultaneously. This interface builds on the single image interface.

The setup is relatively similar - here is an example with two images:

```JS
// 1. Instantiate map
// 2. Instantiate images but this time *dont* add them directly to the map
img = L.distortableImageOverlay('example.png', {
  corners: [
    L.latLng(51.52, -0.14),
    L.latLng(51.52,-0.10),
    L.latLng(51.50, -0.14),
    L.latLng(51.50,-0.10)
  ],
});

img2 = L.distortableImageOverlay('example.png', {
  corners: [
    L.latLng(51.51, -0.20),
    L.latLng(51.51,-0.16),
    L.latLng(51.49, -0.21),
    L.latLng(51.49,-0.17)
  ],
});

// 3. Instantiate an empty `DistortableCollection` group
imgGroup = L.distortableCollection().addTo(map);

// 4. Add the images to the group 
imgGroup.addLayer(img);
imgGroup.addLayer(img2);
```

<blockquote><strong>Note</strong>: notice how we didn't <code>enable</code> the image editing above as we had done for the single image interface. This is because our <code>DistortableCollection</code> class uses event listeners internally (<code>layeradd</code>) to enable editing on every image as it's added. This event is only triggered if we add the layers to the group dynamically. I.e. you must add the group to the map initially empty.</blockquote>

Options available to pass during `L.DistortableCollection` initialization: 

* [actions](#✤-Actions)

### ✤ Actions

* `actions` (*optional*, default: [Exports, Deletes, Locks, Unlocks], value: *array*)

Overrwrite the default toolbar actions for an image collection's `L.Control` toolbar. Reference the available values [here](#Multiple-Image-Interface).

For example, to overrwrite the toolbar to only include the `Deletes` action:

```JS
imgGroup = L.distortableCollection({
  actions: [Deletes]
}).addTo(map);
```

To add / remove a tool from the toolbar at runtime, we have also added the methods `addTool(action)` and `removeTool(action)`.

### UI and functionalities

Currently it supports multiple image selection and translations, and WIP we are working on porting all editing tools to work for it, such as transparency, etc. Image distortions still use the single-image interface.

**multi-select:** A single toolbar instance (using `L.control`) renders the set of tools available to use on collections of images.

  1. Multi-selection works with <kbd>cmd</kbd> + `click` to toggle an individual image's inclusion in this interface.
  2. Or <kbd>shift</kbd> + `drag` to use our `BoxSelector` handler to select multiple at once.
  3. Or for touch devices, `touch` and `hold` (aka `longpress`). 

  **How to un-multi-select:**

  * In order to return to the single-image interface, where each `L.popup` toolbar only applies actions on the image it's attached to, you must toggle *all* images out of multi-select or...
  * ...Click on the map or hit the <kbd>esc</kbd> key to quickly deselect all images.
  * For the aforementioned 3 mutli-select methods, the `BoxSelector` method is the only one that doesn't also toggle _out_ of multi-select mode. 

<hr>

## Toolbar Actions (& Keybindings)

<hr>

### Single Image Interface:

<hr>

Defaults:

- **ToggleLock (<kbd>l</kbd>)**

  - Toggles between [lock mode](#lock) and [distort mode](#distort-(_default_)).

- **ToggleRotateScale (<kbd>r</kbd>, <kbd>d</kbd>)**

  - Toggles between [rotateScale](#rotateScale) and [distort mode](#distort-(_default_)).


- **ToggleOrder (<kbd>j</kbd>, <kbd>k</kbd>)**

  - If you have multiple images, use this to switch an individual image's overlap back and forth into view. Employs [`bringToFront()`](https://leafletjs.com/reference-1.5.0.html\#imageoverlay-bringtofront) and [`bringToBack()`](https://leafletjs.com/reference-1.5.0.html#imageoverlay-bringtoback) from the Leaflet API.

- **ToggleOutline (<kbd>o</kbd>)**

- **ToggleTransparency (<kbd>t</kbd>)**

- **Revert**

  - Restores the image to its original proportions and scale, but keeps its current rotation angle and location on the map intact.

- **Export**

- **Delete (<kbd>delete</kbd>, <kbd>backscpace</kbd>)**

  - Permanently deletes the image from the map.

 Addons:

- **ToggleRotate** (<kbd>caps lock</kbd>):

  - Toggles between [rotate mode](#rotate) and [distort mode](#distort-(_default_)).
  - Replaced as a default toolbar action by `ToggleRotateScale`, but still accessible via its hotkey, `mode`, and (WIP) custom toolbar actions API.


- **ToggleScale** (<kbd>s</kbd>):

  - Toggles between [scale mode](#scale) and [distort mode](#distort-(_default_)).
  - Replaced as a default toolbar action by `ToggleRotateScale`, but still accessible via its hotkey, `mode`, and (WIP) custom toolbar actions API.

-   **EnableEXIF (WIP)**


<hr>

### Multiple Image Interface:

<hr>

Defaults:

-   **Exports**

-   **Deletes (<kbd>delete</kbd>, <kbd>backscpace</kbd>)**

    - Permanently deletes groups of selected images from the map.

- **Locks** (<kbd>l</kbd>)

- **Unlocks** (<kbd>u</kbd>)

## Quick API Reference

<hr>

`L.DistortableImageOverlay`

<hr>

<details><summary><code><b>getCorner(<i>idx</i> &#60;number 0..3>)</b>: LatLng</code></summary>
 <ul><li>returns the coordinates of the image corner at <i>index</i>.</ul></li>
</details>

<details><summary><code><b>getCorners()</b>: 4 [LatLng, LatLng, LatLng, LatLng]</code></summary>
  <ul><li>returns the coordinates of the image corners in NW, NE, SW, SE order.
</details>

<details><summary><code><b>setCorner(<i>idx</i> &#60;number 0..3>, <i>LatLng</i>)</b>: this</code></summary>
<ul><li>updates the coordinates of the image corner at <i>index</i> to <i>LatLng</i> and, where applicable, marker and toolbar positioning.</ul></li>
<ul><li>We use this internally for <code>distort</code> mode.</ul></li>
</details>

<details><summary><code><b>setCorners(<i>corners</i>)</b>: this</code></summary>
<ul><li>same as <code>#setCorner</code>, but takes in a "corners" object to update all 4 corners with only one UI update at the end.</ul></li>
<ul><li> We use this internally for image translation, rotation, and scaling.</ul></li>
<ul><li><i>corners</i>: { <i>keys</i>: &#60;number 0..4>, <i>values</i>: LatLng } <br><br>
ex.

<pre>
  var scaledCorners = {0: '', 1: '', 2: '', 3: ''},
      i, p;

  for (i = 0; i < 4; i++) {
    p = map
      .project(this.getCorner(i))
      .subtract(center)
      .multiplyBy(scale)
      .add(center);
    scaledCorners[i] = map.unproject(p);
  }

  this.setCorners(scaledCorners);
  </pre>
</ul></li>
</details>

<details><summary><code><b>getCenter()</b>: LatLng</code></summary>
<ul><li>Calculates the centroid of the image.</ul></li>
</details>

<details><summary><code><b>scaleBy(<i>factor</i> &#60;number>)</b>: this</code></summary>
<ul><li>scales the image by the given factor and calls <code>#setCorners</code>.</ul></li>
<ul><li>a scale of 0 or 1 will leave the image unchanged - but 0 causes the function to automatically return</ul></li>
<ul><li>a negative scale will invert the image and, depending on the factor, change its size</ul></li>
<ul><li>ex. <code>overlay.scaleBy(0.5)</code></ul></li>
</details>

<details><summary><code><b>rotateBy(<i>rad</i> &#60;number>)</b>: this</code></summary>
<ul><li>rotates the image by the given radian angle and calls <code>#setCorners</code>.</ul></li>
</details>

<hr>

`L.DistortableCollection`

<hr>

- [`removeTool(action)`](#actions) - Removes the passed tool from the control toolbar in runtime.

  - Ex: `imgGroup.removeTool(Deletes)`

- [`addTool(action)`](#actions) - Adds the passed tool to the end of the control toolbar in runtime. Returns false if the tool is not available or is already present.

- `hasTool(action)` - Checks if the tool is already present in the currently rendered control toolbar.

## Additional Components

### Keymapper


```JS
// add a position option with combinations of 'top', 'bottom', 'left' or 'right'
L.distortableImage.keymapper(map, { 
  position: 'topleft' 
});
```

Options:
 - `position` (*optional*, default: 'topright', value: *string*)


Adds a control onto the map which opens a keymapper legend showing the available key bindings for different editing / interaction options. 

(WIP) Currently includes keybindings for all available actions and does not update yet if you use the `actions` API to limit available actions.

## Contributing

This plugin has basic functionality, and is in production as part of MapKnitter, but there are [plenty of outstanding issues to resolve](https://github.com/publiclab/Leaflet.DistortableImage/issues). Please consider helping out!

1) This project uses `grunt` to do a lot of things, including concatenate source files from `/src/` to `/DistortableImageOverlay.js`:

```Bash
#you may need to install grunt-cli first:
$ npm install -g grunt-cli

#run in root dir, and it'll watch for changes and concatenate them on the fly
$ grunt
```

2) To build all files from `/src/` into the `/dist/` folder, run:

```Bash
$ grunt concat:dist
```

3. _Optional_: We use SVG for our icon system. Please visit our wiki [SVG Icon System](https://github.com/publiclab/Leaflet.DistortableImage/wiki/SVG-Icon-System) if you are interested in making updates to them or just simply learning about our workflow. 
****

### Contributors

* Anish Shah, [@anishshah101](https://github.com/anishshah101)
* Justin Manley, [@manleyjster](https://github.com/manleyjster)
* Jeff Warren, [@jywarren](https://github.com/jywarren)
* Sasha Boginsky, [@sashadev-sky](https://github.com/sashadev-sky)
* Pranshu Srivastava, [@rexagod](https://github.com/rexagod)

Many more at https://github.com/publiclab/Leaflet.DistortableImage/graphs/contributors
﻿
