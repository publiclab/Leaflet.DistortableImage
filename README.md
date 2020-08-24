# Leaflet.DistortableImage

[![Build Status](https://travis-ci.org/publiclab/Leaflet.DistortableImage.svg?branch=main)](https://travis-ci.org/publiclab/Leaflet.DistortableImage)
[![Code of Conduct](https://img.shields.io/badge/code-of%20conduct-brightgreen.svg)](https://publiclab.org/conduct)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/publiclab/Leaflet.DistortableImage/issues)
[![npm version](https://badge.fury.io/js/leaflet-distortableimage.svg)](https://badge.fury.io/js/leaflet-distortableimage)

A Leaflet extension to distort images -- "rubbersheeting" -- for the [MapKnitter.org](http://mapknitter.org) ([src](https://github.com/publiclab/mapknitter)) image georectification service by [Public Lab](http://publiclab.org). Leaflet.DistortableImage allows for perspectival distortions of images, client-side, using CSS3 transformations in the DOM.

Advantages include:

* It can handle over 100 images smoothly, even on a smartphone
* Images can be right-clicked and downloaded individually in their original state
* CSS3 transforms are GPU-accelerated in most (all?) browsers, for a very smooth UI
* No need to server-side generate raster GeoTiffs, tilesets, etc. in order to view distorted imagery layers
* Images use DOM event handling for real-time distortion
* [Full resolution download option](https://github.com/publiclab/Leaflet.DistortableImage/pull/100) for large images, using WebGL acceleration

[Download as zip](https://github.com/publiclab/Leaflet.DistortableImage/releases) or clone the repo to get a local copy.

Also available on NPM as [leaflet-distortableimage](https://www.npmjs.com/package/leaflet-distortableimage):

```Bash
npm i leaflet-distortableimage
```

## Compatibility with Leaflet versions

Compatible with Leaflet 1.0.0 and greater

## Demo

Check out this [simple demo](https://publiclab.github.io/Leaflet.DistortableImage/examples/index.html).

And watch this GIF demo:

![demo gif](https://raw.githubusercontent.com/publiclab/mapknitter/master/public/demo.gif)

To test the code, open `index.html` in your browser and click and drag the markers on the edges of the image. The image will show perspectival distortions.

For the additional features in the [multiple image interface](#Multiple-Image-Interface), open `select.html` and use <kbd>shift</kbd> + click on an image or <kbd>shift</kbd> + drag on the map to "multi-select" (collect) images. For touch screens, touch + hold the image.

## Single Image Interface

The simplest implementation is to create a map with our recommended `TileLayer`, then create an `L.distortableImageOverlay` instance and add it onto the map.

```js
// set the initial map center and zoom level
map = L.map('map').setView([51.505, -0.09], 13);

// adds a Google Satellite layer with a toner label overlay
map.addGoogleMutant();

map.whenReady(function() {
  // By default, 'img' will be placed centered on the map view specified above
  img = L.distortableImageOverlay('example.jpg').addTo(map);
});
```

<b>Note</b>: <code>map.addGoogleMutant()</code> is a convenience function for adding our recommended layer to the map. If you want a different baselayer, skip this line and add your preferred setup instead.

**Options** available to pass during `L.DistortableImageOverlay` initialization:

* [actions](#Actions)
* [corners](#corners)
* [editable](#editable)
* [fullResolutionSrc](#Full-resolution%20download)
* [mode](#mode)
* [rotation](#rotation)
* [selected](#selected)
* [suppressToolbar](#Suppress-Toolbar)

### Actions

* `actions` (*optional*, default: [`L.DragAction`, `L.ScaleAction`, `L.DistortAction`, `L.RotateAction`, `L.FreeRotateAction`, `L.LockAction`, `L.OpacityAction`, `L.BorderAction`, `L.ExportAction`, `L.DeleteAction`], value: *array*)

If you would like to overrwrite the default toolbar actions available for an individual image's `L.Popup` toolbar, pass an array with the actions you want. Reference the available values [here](#Single-Image-Interface).

For example, to overrwrite the toolbar to only include `L.OpacityAction` and `L.DeleteAction` , and also add on an additional non-default like `L.RestoreAction`:

```js
img = L.distortableImageOverlay('example.jpg', {
  actions: [L.OpacityAction, L.DeleteAction, L.RestoreAction],
}).addTo(map);
```

### Corners

* `corners` (*optional*, default: an array of `LatLang`s that position the image on the center of the map, value: *array*)

Allows you to set an image's position on the map manually (somewhere other than the center default).

Note that this can manipulate the shape and dimensions of your image.

The corners should be passed as an array of `L.latLng` objects in NW, NE, SW, SE order (in a "Z" shape).

They will be stored on the image. See the [Quick API Reference](#Quick-API-Reference) for their getter and setter methods.

Example:

```js
img = L.distortableImageOverlay('example.jpg', {
  corners: [
    L.latLng(51.52,-0.14),
    L.latLng(51.52,-0.10),
    L.latLng(51.50,-0.14),
    L.latLng(51.50,-0.10),
  ],
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

### Editable

`editable` (*optional*, default: true, value: *boolean*)

Internally, we use the image `load` event to trigger a call to `img.editing.enable()`, which sets up the editing interface (makes the image interactive, adds markers and toolbar).

If you want to enable editing based on custom logic instead, you can pass `editable: false` and then write your own function with a call to `img.editing.enable()`. Other passed options such as `selected: true` and `mode` will still be applicable and applied then.

<blockquote><b>Note</b>: when using the multiple image interface (<code>L.DistortableCollection</code>) this option will be ignored on individual <code>L.DistortableImageOverlay</code> instances and should instead be passed to the collection instance.</blockquote>

### Full-resolution download

`fullResolutionSrc` (*optional*)

We've added a GPU-accelerated means to generate a full resolution version of the distorted image; it requires two additional dependencies to enable; see how we've included them in the demo:

```HTML
<script src="../node_modules/webgl-distort/dist/webgl-distort.js"></script>
<script src="../node_modules/glfx/glfx.js"></script>
```

When instantiating a Distortable Image, pass in a `fullResolutionSrc` option set to the url of the higher resolution image. This image will be used in full-res exporting.

```js
img = L.distortableImageOverlay('example.jpg', {
  fullResolutionSrc: 'large.jpg',
}).addTo(map);
```

### Mode

`mode` (*optional*, default: "distort", value: *string*)

This option sets the image's initial editing mode, meaning the corresponding editing handles will always appear first when you interact with the image.

Values available to pass to `mode` are:

* **distort** (*default*): Distortion via individually draggable corners.
* **drag**: Translation via individually draggable corners.
* **rotate**: Rotation only.
* **scale**: Resize only.
* **freeRotate**: Combines the rotate and scale modes into one.
* **lock**: Locks the image in place. Disables any user gestures, toolbar actions, or hotkeys that are not associated with mode. Exception: `L.ExportAction` will still be enabled.

In the below example, the image will be initialiazed with "freeRotate" handles:

```js
img = L.distortableImageOverlay('example.jpg', {
  mode: 'freeRotate',
}).addTo(map);
```

If you select a <code>mode</code> that is removed or unavailable, your image will just be assigned the first available <code>mode</code> on initialization.

<hr>

**Limiting modes:**

<hr>

<blockquote>Each <code>mode</code> is just a special type of action, so to ensure that these are always in sync the <code>modes</code> available on an image instance can be limited by the <code>actions</code> available on it. <strong>To remove a mode, limit its corresponding action via the <code><a name="Actions">actions</a></code> option during initialization.</strong> This holds true even when <code>suppressToolbar: true</code> is passed.</blockquote>

In the below example, the image will be initialiazed with `'freeRotate'` handles, and limit its available modes to `'freeRotate'` and `'scale'`.

* We also remember to add the normal toolbar actions we will want:

```js
img = L.distortableImageOverlay('example.jpg', {
  mode: 'freeRotate',
  actions: [L.FreeRotateAction, L.ScaleAction, L.BorderAction, L.OpacityAction],
}).addTo(map);
```

Likewise, it is possible to remove or add `actions` during runtime (`addTool`, `removeTool`), and if those actions are modes it will remove / add the `mode`.

### Rotation

`rotation` (*optional*, default: {deg: 0, rad: 0}, value: *hash*)

Set the initial rotation angle of your image, in degrees or radians. Set the unit as the key, and the angle as the value.

```js
img = L.distortableImageOverlay('example.jpg', {
  rotation: {
    deg: 180,
  },
}).addTo(map);
```

### Selected

`selected` (*optional*, default: false, value: *boolean*)

By default, your image will initially appear on the screen as unselected (no toolbar or markers). Interacting with it will make them visible.

If you prefer that an image initially appears as selected instead, pass `selected: true`.

Note: when working with the multi-image interface, only the last overlay you pass `selected: true` to will appear with editing handles _and_ a toolbar.

### Suppress Toolbar

`suppressToolbar` (*optional*, default: false, value: *boolean*)

To initialize an image without its `L.Popup` instance toolbar, pass it `suppressToolbar: true`.

Typically, editing actions are triggered through our toolbar interface. If disabling the toolbar, the developer will need to implement their own toolbar UI connected to our actions (WIP API for doing this)

## Multiple Image Interface

Our `DistortableCollection` class builds on the single image interface to allow working with multiple images simultaneously.

The setup is relatively similar.

Although not required, you will probably want to pass `corners` to individual images when adding multiple or they will be positioned on top of eachother.

Here is an example with two images:

```js
// 1. Instantiate map
// 2. Instantiate images but this time *dont* add them directly to the map
img = L.distortableImageOverlay('example.jpg', {
  corners: [
    L.latLng(51.52, -0.14),
    L.latLng(51.52,-0.10),
    L.latLng(51.50, -0.14),
    L.latLng(51.50,-0.10),
  ],
});

img2 = L.distortableImageOverlay('example.jpg', {
  corners: [
    L.latLng(51.51, -0.20),
    L.latLng(51.51,-0.16),
    L.latLng(51.49, -0.21),
    L.latLng(51.49,-0.17),
  ],
});

// 3. Instantiate an empty `DistortableCollection` group
imgGroup = L.distortableCollection().addTo(map);

// 4. Add the images to the group
imgGroup.addLayer(img);
imgGroup.addLayer(img2);
```

<blockquote><strong>Note</strong>: You must instantiate a blank collection, then dynamically add layers to it like above. This is because <code>DistortableCollection</code> internally uses the <code>layeradd</code> event to enable additional editing features on images as they are added, and it is only triggered when they are added dynamically.</blockquote>


Options available to pass during `L.DistortableCollection` initialization:

* [actions](#Actions-1)
* [editable](#Editable-1)
* [supressToolbar](#Suppress-Toolbar-1)

### Actions

* `actions` (*optional*, default: [`L.ExportAction`, `L.DeleteAction`, `L.LockAction`, `L.UnlockAction`], value: *array*)

Overrwrite the default toolbar actions for an image collection's `L.Control` toolbar. Reference the available values [here](#Multiple-Image-Interface).

For example, to overrwrite the toolbar to only include the `L.DeleteAction`:

```JS
imgGroup = L.distortableCollection({
  actions: [L.DeleteAction],
}).addTo(map);
```

To add / remove a tool from the toolbar at runtime, we have also added the methods `addTool(action)` and `removeTool(action)`.

### Editable

`editable` (*optional*, default: true, value: *boolean*)

See [editable](#editable).

### Suppress Toolbar

`suppressToolbar` (*optional*, default: false, value: *boolean*)

Same usage as [suppressToolbar](#Suppress-Toolbar), but for the collection group's `L.Control` toolbar instance.

This provides the developer with the flexibility to keep the popup toolbars, the control toolbar, both, or neither.

For ex.

```js
// suppress this images personal toolbar
img = L.distortableImageOverlay('example.jpg', {
  suppressToolbar: true,
  corners: [
    L.latLng(51.52, -0.14),
    L.latLng(51.52,-0.10),
    L.latLng(51.50, -0.14),
    L.latLng(51.50,-0.10),
  ],
});

// suppress the other images personal toolbar
img2 = L.distortableImageOverlay('example.jpg', {
  suppressToolbar: true,
});

// suppress collection toolbar accessed during multi-image selection
imgGroup = L.distortableCollection({
  supressToolbar: true,
}).addTo(map);
```

### UI and functionalities

Currently it supports multiple image selection and translations, and WIP we are working on porting all editing tools to work for it, such as opacity, etc. Image distortions (via modes) still use the single-image interface.

A single toolbar instance (using `L.control`) renders the set of tools available to use on collections of images.

**collect**:

1. Collect an indvidiual image with <kbd>shift</kbd> + `click`.
2. Or for touch devices, `touch` + `hold` (aka `longpress`).
3. Collect multiple images at once with <kbd>shift</kbd> + `drag` (Uses our `L.Map.BoxCollector`).

**decollect:**

* In order to return to the single-image interface, where each `L.popup` toolbar only applies actions on the image it's attached to, you must toggle *all* images out of collection with `shift` + click / `touch` + `hold`, or...
* ...Click on the map or hit the <kbd>esc</kbd> key to quickly decollect all.

---

## Toolbar Actions (& Keybindings)

---

### Single Image Interface

---

#### Default tools

* **L.BorderAction** (<kbd>b</kbd>)
  * Toggles a thin border around the overlay.
* **L.DeleteAction** (<kbd>backscpace</kbd>, <kbd>delete</kbd>)
  * Permanently deletes the image from the map. Uses a `confirm()` modal dialog.
  * windows `backspace` / mac `delete`
* **L.DistortAction** (<kbd>d</kbd>)
  * Sets `distort` mode.
* **L.DragAction**
  * Sets `drag` mode.
* **L.ExportAction** (<kbd>e</kbd>)
* **L.FreeRotateAction** (<kbd>f</kbd>)
  * Sets `freeRotate` mode.
* **L.LockAction** (<kbd>l</kbd>, <kbd>u</kbd>)
  * Toggles between `lock` mode and the initially set default mode (`distort` by default).
* **L.OpacityAction** (<kbd>o</kbd>)
* **L.RotateAction** (<kbd>r</kbd>):
  * Sets `rotate` mode.
* **L.ScaleAction** (<kbd>s</kbd>):
  * Sets `scale` mode.

#### Add-on tools

These may be added using `addTool()`, like this: 

```js
distortableImageLayer.editing.addTool(L.StackAction);
```

* **L.RestoreAction**
  * Restores the image to its natural dimensions, scale, rotation, and location on the map.
* **L.StackAction** (<kbd>q</kbd>, <kbd>a</kbd>)
  * Switch an image's overlap compared to neighboring images back and forth into view. Employs [`bringToFront()`](https://leafletjs.com/reference-1.5.0.html\#imageoverlay-bringtofront) and [`bringToBack()`](https://leafletjs.com/reference-1.5.0.html#imageoverlay-bringtoback) from the Leaflet API.
* **L.GeolocateAction (WIP)**

---

### Multiple Image Interface

---

Defaults:

* **L.ExportAction** (<kbd>e</kbd>)
* **L.DeleteAction** (<kbd>backscpace</kbd>, <kbd>delete</kbd>)
  * Permanently deletes a collection of images from the map.
* **L.LockAction** (<kbd>l</kbd>)
  * Sets `lock` mode for a collection of images.
* **L.UnlockAction** (<kbd>u</kbd>)
  * Unsets `lock` mode for a collection of images.

## Quick API Reference

---

`L.Map`

---

We have extended Leaflet's `L.Map` to include a convenience method for this library:

<details><summary><code><b>addGoogleMutant(<i>opts?</i> &#60;Mutant options>)</b>: this</code></summary>
  <ul>
    <li>Adds a Google Mutant layer with location labels according to our recommended setup.</li>
    <li><code><b>Mutant options: {[mutantOpacity][, maxZoom][, minZoom][, labels][, labelOpacity][, doubleClickLabels]}</b></code>
      <ul>
        <li><code>mutantOpacity</code> (default 0.8, value: <i>number 0..1</i>)</li>
        <ul>
          <li>Same as Leaflet's <code>L.TileLayer</code> <code>opacity</code> option.</li>
        </ul>
        <li><code>maxZoom</code> (default: 18, value: <i>number 0..21</i>)</li>
        <ul>
          <li>Same as Leaflet's <code>L.TileLayer</code> <code>maxZoom</code> option, except has a maximum value of 21 because higher zoom levels on the mutant layer will result in an error being thrown.</li>
          <li>The mutant layer will appear blurry for zoom levels exceeding 18.</li>
        </ul>
        <li><code>minZoom</code> (default: 0, value: <i>number 0..maxZoom</i>)</li>
        <ul>
          <li>Same as Leaflet's <code>L.TileLayer</code> <code>minZoom</code> option.</li>
        </ul>
        <li><code>labels</code> (default: true, value: <i>boolean</i>)</li>
        <ul>
          <li>If set to <code>false</code>, the mutant layer will not have location labels.</li>
        </ul>
        <li><code>labelOpacity</code> (default: 1, value: <i>number 0, 1</i>)</li>
        <ul>
          <li>If set to <code>0</code>, labels will be initially invisible.</li>
          <li>Set to <code>undefined</code> if <code>labels: false</code> is also passed.</li>
        </ul>
        <li><code>doubleClickLabels</code> (default: true, value: <i>boolean</i>)</li>
        <ul>
          <li>Label visibility (opacity) is toggled between 0 and 1 on map <code>dblclick</code>. To turn this functionality off, set this option to false.</li>
          <li>Set to <code>undefined</code> if <code>labels: false</code> is also passed.</li>
        </ul>
      </ul>
    </li>
    <li>Mutant options are saved on the map and accessible during runtime as <code>map.mutantOptions.</code></li>
  </ul>
</details>
<br>
And the following custom handlers:
<br><br>

<details><summary><code><b>doubleClickLabels</b>: this</code></summary>
  <ul>
    <li>Allows toggling label visibility on map <code>dblclick</code>.</li>
    <li>Enabled by default on <code>#addGoogleMutant</code> unless the options <code>labels: false</code> or <code>doubleClickLabels: false</code> are passed to it.</li>
    <ul>
      <li>If <code>labels: false</code> passed, removed from map altogether.</li>
      <li>If there are labels present but <code>doubleClickLabels: false</code> was passed, just disabled and can always be enabled during runtime via <a href="https://leafletjs.com/reference-1.5.0.html#handler">Leaflet's Handler API</a>.</li>
    </ul>
    <li>Disables the map's default <a href="https://leafletjs.com/reference-1.5.0.html#map-doubleclickzoom"><code>doubleClickZoom</code></a> handler when enabled.</li>
  </ul>
</details>

<details><summary><code><b>boxCollector</b>: this</code></summary>
  <ul>
    <li>Overrides the map's default <a href="https://leafletjs.com/reference-1.5.0.html#map-boxzoom"><code>boxZoom</code></a> handler. To use <code>boxZoom</code> instead, pass the options <code>{ boxCollector: false, boxZoom: true }</code> to the map on initialization.
</li>
    <li>Allows multiple images to be collected when <kbd>shift</kbd> + <code>drag</code>ing on the map for the multiple image interface.</li>
  </ul>
</details>
<br>
We have slightly changed a default Leaflet handler:
<br><br>
<details><summary><code><b>doubleClickZoom</b>: this</code></summary>
<ul>
  <li>This handler may not be <code>enabled</code> (and will return false) while the <code>doubleClickLabels</code> handler is <code>enabled</code>.</li>
  <li>This handler and <code>doubleClickLabels</code> time and fire a custom <code>singleclick</code> event on map click.</li>
</ul>
</details>

<br>

<blockquote>Our "doubleClick" handlers mentioned above use a custom <strong><code>singleclick</code></strong> event to run logic on map <code>dblclick</code> while allowing the images on the map to remain <code>selected</code>. You can read more about the implications of this and how to disable it on our wiki <a href="https://github.com/publiclab/Leaflet.DistortableImage/wiki/The-singleclick-event">"singleclick event"</a>.</blockquote>

---

`L.DistortableImageOverlay`

---

An individual image instance that can have transformation methods called on it and can be "selected".

<details><summary><code><b>getCorner(<i>idx</i> &#60;number 0..3>)</b>: LatLng</code></summary>
  <ul><li>Returns the coordinates of the image corner at <i>index</i>.</li></ul>
</details>

<details><summary><code><b>getCorners()</b>: 4 [LatLng, LatLng, LatLng, LatLng]</code></summary>
  <ul><li>Returns the coordinates of the image corners in NW, NE, SW, SE order.</li></ul>
</details>

<details><summary><code><b>setCorner(<i>idx</i> &#60;number 0..3>, <i>LatLng</i>)</b>: this</code></summary>
  <ul>
    <li>Updates the coordinates of the image corner at <i>index</i> to <i>LatLng</i> and, where applicable, marker and toolbar positioning.</li>
    <li>We use this internally for <code>distort</code> mode.</li>
  </ul>
</details>

<details><summary><code><b>setCorners(<i>LatLngCorners</i>)</b>: this</code></summary>
  <ul>
    <li>Same as <code>#setCorner</code>, but takes in a "corners" object made up of <code>LatLng</code>s to update all 4 corners with only one UI update at the end.</li>
    <li>We use this internally for image translation, rotation, and scaling.</li>
    <li><b>LatLngCorners</b>: { <i>keys</i>: &#60;number 0..4>, <i>values</i>: LatLng } <br>
  ex.

<pre>
var scaledCorners = {};
var i;
var p;

for (i = 0; i < 4; i++) {
  p = map
    .project(img.getCorner(i))
    .subtract(center)
    .multiplyBy(scale)
    .add(center);
  scaledCorners[i] = map.unproject(p);
}

img.setCorners(scaledCorners);
</pre></li>
  </ul>
</details>

<details><summary><code><b>setCornersFromPoints(<i>PointCorners</i>)</b>: this</code></summary>
  <ul>
     <li>Same as <code>#setCorners</code>, but takes in a "corners" object made up of <code>Point</code>s instead of <code>LatLng</code>s.</li>
    <li><b>PointCorners</b>: { <i>keys</i>: &#60;number 0..4>, <i>values</i>: Point }
  </ul>
</details>

<details><summary><code><b>getCenter()</b>: LatLng</code></summary>
  <ul><li>Returns the center (<a href="http://en.wikipedia.org/wiki/Centroid">centroid</a>) of the image.</li></ul>
</details>

<details><summary><code><b>getAngle(<i>[unit = 'deg']</i> &#60;string>)</b>: Number</code></summary>
  <ul>
    <li>Returns the image's rotation angle in <code>units</code>, or in degrees by default.
    <li><code>Number</code> will always be >= 0.</li>
    <li><code>unit</code> (<i>optional</i>, default: 'deg', value: <i>string 'deg'|'rad'</i>) <br>
  ex.
<pre>
img.getAngle();
img.getAngle('deg');
img.getAngle('rad');
</pre></li>
  </ul>
</details>

<details><summary><code><b>setAngle(<i>angle</i> &#60;number>, <i>[unit = 'deg']</i> &#60;string>)</b>: this</code></summary>
  <ul>
    <li>Sets the image's rotation to <code>angle</code> in <code>units</code>, or in degrees by default.</li>
    <li><code>unit</code> (<i>optional</i>, default: 'deg', value: <i>string 'deg'|'rad'</i>) <br>
  ex.
<pre>
img.setAngle(180);
img.setAngle(180, 'deg');
img.setAngle(Math.PI, 'rad');
</pre></li>
  </ul>
</details>

<details><summary><code><b>rotateBy(<i>angle</i> &#60;number>, <i>[unit = 'deg']</i> &#60;string>)</b>: this</code></summary>
  <ul>
    <li>Rotates the image relative to its current angle by <code>angle</code> in <code>units</code>, or in degrees by default.</li>
    <li><code>unit</code> (<i>optional</i>, default: 'deg', value: <i>string 'deg'|'rad'</i>) <br>
  ex.
<pre>
img.rotateBy(180);
img.rotateBy(180, 'deg');
img.rotateBy(Math.PI, 'rad');
</pre></li>
  </ul>
</details>

<details><summary><code><b>scaleBy(<i>factor</i> &#60;number>)</b>: this</code></summary>
  <ul>
    <li>Scales the image by the given factor and calls <code>#setCorners</code>.</li>
    <li>A scale of 0 or 1 will leave the image unchanged - but 0 causes the function to automatically return.</li>
    <li>A negative scale will invert the image and, depending on the factor, change its size.</li>
    <li>Ex. <code>img.scaleBy(0.5)</code></li>
  </ul>
</details>

<details><summary><code><b>restore()</b>: this</code></summary>
  <ul>
    <li>Restores the image to its natural dimensions, scale, rotation, and location on the map.</li>
  </ul>
</details>

<details><summary><code><b>isSelected()</b>: Boolean</code></summary>
  <ul><li>Returns true if the individual image instance is selected.</li></ul>
</details>

<details><summary><code><b>select()</b>: this</code></summary>
  <ul>
    <li>Selects an individual image instance.</li>
    <li>If its editing handler is disabled or the multiple image interface is on (<code>imgGroup.anyCollected() === true</code>), does not select and instead just returns undefined.</li>
    <li>Internally invoked on image <code>click</code>.</li>
  </ul>
</details>

<details><summary><code><b>deselect()</b>: this</code></summary>
  <ul>
    <li>Deselects an individual image instance.</li>
    <li>If its editing handler is disabled, does not deselect and instead just returns undefined.</li>
    <li>Internally invoked on map <code>click</code> and image collect (<kbd>shift</kbd> + <code>click</code>).</li>
  </ul>
</details>

---

`L.DistortableImageOverlay.Edit`

---

A handler that holds the keybindings and toolbar API for an image instance. It is always initialized with an instance of `L.DistortableImageOverlay`. Besides code organization, it provides the ability to `enable` and `disable` image editing using the Leaflet API.

<blockquote><b>Note</b>: The main difference between the <code>enable</code> / <code>disable</code> runtime API and using the <code>editable</code> option during initialization is in runtime, neither individual image instaces nor the collection group get precedence over the other.</blockquote>

<details><summary><code><b>enable()</b>: this</code></summary>
  <ul>
    <li>Sets up the editing interface (makes the image interactive).</li>
    <li>Called internally by default (<a href="#editable">editable</a>), but unlike the option it can be used in runtime and is not ignored if there is a collection group. In fact...</li>
    <li>...An individual image can be enabled while the group is disabled. i.e. calling <code>img.editing.enable()</code> after <code>imgGroup.editing.disable()</code> is valid. In this case, the single image interface will be available on this image but not the multi-image interface.</li>
  </ul>
</details>

<details><summary><code><b>disable()</b>: this</code></summary>
  <ul>
    <li>Deselects the image, and disables its editing interface (makes it non-interactive).</li>
    <li>Called internally by default on image deletion.</li>
    <li>An individual image can be disabled while the group is enabled.</li>
  </ul>
</details>

<details><summary><code><b>enabled()</b>: Boolean</code></summary>
  <ul>
    <li>Returns true if editing on the individual image instance is enabled.</li>
    <li><code>img.editing.enabled()</code></li>
  </ul>
</details>

<details><summary><code><b>hasMode(<i>mode</i> &#60;string>)</b>: Boolean</code></summary>
  <ul>
    <li>Returns true if the image has the passed mode.</li>
  </ul>
</details>

<details><summary><code><b>getMode()</b>: String</code></summary>
  <ul>
    <li>Returns the current <code>mode</code> of the image.</li>
  </ul>
</details>

<details><summary><code><b>getModes()</b>: Hash</code></summary>
  <ul>
    <li>Returns all the modes available on the image.</li>
  </ul>
</details>

<details><summary><code><b>nextMode()</b>: this</code></summary>
  <ul>
    <li>Sets the <code>mode</code> of the image to the next one in the <code>modes</code> array by passing it to <code>#setMode</code>.</li>
    <li>If the image's editing interface is not enabled or <code>modes</code> only has 1 <code>mode</code>, it will instead return undefined and not update the image's <code>mode</code>.</li>
    <li>We use this internally to iterate through an image's editing modes easily on <code>dblclick</code>, but you can call it programmatically if you find a need. Note that <code>dblclick</code> also selects the image (given it's not disabled and the collection interface is not on).</li>
  </ul>
</details>

<details><summary><code><b>setMode(<i>mode</i> &#60;string>)</b>: this</code></summary>
  <ul>
    <li>Sets the <code>mode</code> of the image to the passed one given that it is in the <code>modes</code>array, it is not already the current <code>mode</code>, and the image editing interface is enabled. Otherwise, does not set the mode and instead just returns undefined.</li>
  </ul>
</details>

---

`L.DistortableCollection`

---

A collection instance made up of a group of images. Images can be "collected" in this interface and a "collected" image is never also "selected".

<details><summary><code><b>isCollected(<i>img</i> &#60;DistortableImageOverlay>)</b>: Boolean</code></summary>
<ul><li>Returns true if the passed <code>L.DistortableImageOverlay</code> instance is collected, i.e. its underlying <code>HTMLImageElement</code> has a class containing "selected".</li></ul>
</details>

<details><summary><code><b>anyCollected()</b>: Boolean</code></summary>
<ul><li>Returns true if any <code>L.DistortableImageOverlay</code> instances are collected.</li></ul>
</details>

---

`L.DistortableCollection.Edit`

---

Same as `L.DistortableImage.Edit` but for the collection (`L.DistortableCollection`) instance.

<details><summary><code><b>enable()</b>: this</code></summary>
  <ul>
    <li>Sets up the multi-editing interface.</li>
    <li>Called internally by default, see <a href="#editable"> editable</a>.</li>
    <li>Calls each individual image's <code>#enable</code> method and then enables the multi-image interface.</li>
  </ul>
</details>

<details><summary><code><b>disable()</b>: this</code></summary>
  <ul>
    <li>Removes the editing interface (makes the image non-interactive, removes markers and toolbar).</li>
    <li>Called internally by default on image group deletion, but can also be used for custom behavior.</li>
    <li>Calls each individual image's <code>#disable</code> method and disables the multi-image interface.</li>
  </ul>
</details>

<details><summary><code><b>enabled()</b>: Boolean</code></summary>
  <ul>
    <li>Returns true if editing on the collection instance is enabled.</li>
    <li><code>imgGroup.editing.enabled()</code></li>
  </ul>
</details>

<details><summary><code><b>removeTool(<i>action</i> &#60;EditAction>)</b>: this</code></summary>
  <ul>
    <li>Removes the passed tool from the control toolbar in runtime if the tool is present.</li>
    <li>ex: <code>imgGroup.removeTool(Deletes)</code></li>
  </ul>
</details>

<details><summary><code><b>addTool(<i>action</i> &#60;EditAction>)</b>: this</code></summary>
<ul><li>Adds the passed tool to the end of the control toolbar in runtime.</li></ul>
</details>

<details><summary><code><b>replaceTool(<i>old</i> &#60;EditAction>), <i>next</i> &#60;EditAction>)</b></code></summary>
<ul><li>Replaces the first parameter with the second parameter. Returns the parent object.</li></ul>
</details>

<details><summary><code><b>hasTool(<i>action</i> &#60;EditAction>)</b>: Boolean</code></summary>
<ul><li>Returns true if the tool is present in the currently rendered control toolbar.</li></ul>
</details>

## Additional Components

### Keymapper

```JS
// add a position option with combinations of 'top', 'bottom', 'left' or 'right'
L.distortableImage.keymapper(map, {
  position: 'topleft',
});
```

Options:

* `position` (*optional*, default: 'topright', value: *string*)

Adds a control onto the map which opens a keymapper legend showing the available key bindings for different editing / interaction options.

(WIP) Currently includes keybindings for all available actions and does not update yet if you use the `actions` API to limit available actions.

### Custom Translations

You can translate the LDI toolbar buttons in your native language by providing a custom `translation` object to `DistortableImageOverlay` or `DistortableCollection`.

**NOTE:** If you don't specify a custom translation for a certain field, it will fallback to English.

These are the defaults:

```javascript
var translation = {
  deleteImage: 'Delete Image',
  deleteImages: 'Delete Images',
  distortImage: 'Distort Image',
  dragImage: 'Drag Image',
  exportImage: 'Export Image',
  exportImages: 'Export Images',
  removeBorder: 'Remove Border',
  addBorder: 'Add Border',
  freeRotateImage: 'Free rotate Image',
  geolocateImage: 'Geolocate Image',
  lockMode: 'Lock Mode',
  lockImages: 'Lock Images',
  makeImageOpaque: 'Make Image Opaque',
  makeImageTransparent: 'Make Image Transparent',
  restoreImage: 'Restore Natural Image',
  rotateImage: 'Rotate Image',
  scaleImage: 'Scale Image',
  stackToFront: 'Stack to Front',
  stackToBack: 'Stack to Back',
  unlockImages: 'Unlock Images',
  confirmImageDelete: 'Are you sure? This image will be permanently deleted from the map.',
  confirmImagesDeletes: 'Are you sure? These images will be permanently deleted from the map.',
};
```

For `confirmImagesDeletes` you can pass a function that returns a string.
This is useful for languages where noun form depends on the number:

```javascript
var translation = {
  confirmImagesDeletes: function(n) {
    var cond = n%10 >= 2 && n%10 <= 4 && n%100 - n%10 !== 10;
    var str = 'Czy na pewno chcesz usunąć ' + n;
    if(cond) str += ' obrazy?';
    else str += ' obrazów?';
    return str;
  },
  // ...
}
```

**L.DistortableImageOverlay**

```js
img = L.distortableImageOverlay('example.jpg', {
  translation: {
    deleteImage: 'Obriši sliku',
    distortImage: 'Izobliči sliku',
    dragImage: 'Pomjeri sliku',
    // ...
  },
}).addTo(map);
```

**L.DistortableCollection**

```javascript
imgGroup = L.distortableCollection({
  translation: {
    deleteImages: 'Obriši slike',
    exportImages: 'Izvezi slike',
    // ...
  },
}).addTo(map);
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how you can contribute to Leaflet.DistortableImage.

### Contributors

* Anish Shah, [@anishshah101](https://github.com/anishshah101)
* Justin Manley, [@manleyjster](https://github.com/manleyjster)
* Jeff Warren, [@jywarren](https://github.com/jywarren)
* Sasha Boginsky, [@sashadev-sky](https://github.com/sashadev-sky)
* Pranshu Srivastava, [@rexagod](https://github.com/rexagod)

Many more at https://github.com/publiclab/Leaflet.DistortableImage/graphs/contributors
