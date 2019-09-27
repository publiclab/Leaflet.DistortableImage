L.DistortableImage = L.DistortableImage || {};

// holds the keybindings & toolbar API for an individual image instance
L.DistortableImage.Edit = L.Handler.extend({
  options: {
    opacity: 0.7,
    outline: '1px solid red',
    keymap: L.distortableImage.action_map,
  },

  statics: {
    colormap: {
      'scale': 'blue',
      'distort': 'blue',
      'rotate': 'red',
      'freeRotate': 'red',
      'lock': 'black',
    },
  },

  initialize: function(overlay, options) {
    this._overlay = overlay;
    this._toggledImage = false;
    this._mode = overlay.options.mode;
    this._transparent = false;
    this._outlined = false;

    L.setOptions(this, options);

    L.distortableImage.action_map.Escape = '_deselect';
  },

  /* Run on image selection. */
  addHooks: function() {
    var overlay = this._overlay;
    var map = overlay._map;
    var img = overlay.getElement();

    this.editActions = this.options.actions;

    this._initModes();
    this._initHandles();
    this._appendHandlesandDragable();

    if (overlay.isSelected() && !overlay.options.suppressToolbar) {
      this._addToolbar();
    }

    this.lastOpacity = img.style.opacity;
    this.lastOutline = img.style.outline;
    this._preview = false;
    this.parentGroup = overlay.eP ? overlay.eP : false;

    L.DomEvent.on(window, 'keydown', this._onKeyDown, this);
    L.DomEvent.on(map, 'dblclick', this._catchAndFire, this);
    L.DomEvent.on(img, 'mouseover', this._previewOn, this);
    L.DomEvent.on(img, 'mouseout mousedown', this._previewOff, this);
    L.DomEvent.on(img, 'mouseup', this._timeout, this);
    L.DomEvent.on(img, 'dblclick', this.nextMode, this);
  },

  /* Run on image deselection. */
  removeHooks: function() {
    var overlay = this._overlay;
    var map = overlay._map;
    var img = overlay.getElement();
    var eP = this.parentGroup;

    this._disableDragging();
    if (this.toolbar) { this._removeToolbar(); }

    for (var handle in this._handles) {
      L.DomUtil.remove(handle);
    }
    /**
     * ensures if you disable an image while it is multi-selected
     * additional deselection logic is run
     */
    if (L.DomUtil.hasClass(overlay.getElement(), 'collected')) {
      L.DomUtil.removeClass(overlay.getElement(), 'collected');
    }

    if (eP && (!eP.anyCollected() && eP.editing.toolbar)) {
      eP.editing._removeToolbar();
    }

    L.DomEvent.off(window, 'keydown', this._onKeyDown, this);
    L.DomEvent.off(map, 'dblclick', this._catchAndFire, this);
    L.DomEvent.off(img, 'mouseover', this._previewOn, this);
    L.DomEvent.off(img, 'mouseout mousedown', this._previewOff, this);
    L.DomEvent.off(img, 'mouseup', this._timeout, this);
    L.DomEvent.off(img, 'dblclick', this.nextMode, this);
  },

  disable: function() {
    if (!this._enabled) { return this; }

    this._overlay.deselect();
    this._enabled = false;
    this.removeHooks();
    return this;
  },

  _initModes: function() {
    this._modes = {};
    // passed from L.DistortablImage.PopupBar. If the mode is one
    // of the current toolbar actions, adds it to this._modes
    for (var mode in L.DistortableImage.Edit.MODES) {
      var action = L.DistortableImage.Edit.MODES[mode];
      if (this.editActions.indexOf(action) !== -1) {
        this._modes[mode] = action;
      }
    }

    // sets the current mode to the 1st available one if the one selected
    // during initialization is not available
    if (!this._modes[this._mode]) {
      this._mode = Object.keys(this._modes)[0];
    }
  },

  _initHandles: function() {
    var overlay = this._overlay;
    var i;

    this._scaleHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._scaleHandles.addLayer(L.scaleHandle(overlay, i));
    }

    this._distortHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._distortHandles.addLayer(L.distortHandle(overlay, i));
    }

    this._rotateHandles = L.layerGroup(); // individual rotate
    for (i = 0; i < 4; i++) {
      this._rotateHandles.addLayer(L.rotateHandle(overlay, i));
    }

    // handle includes rotate AND scale
    this._freeRotateHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._freeRotateHandles.addLayer(new L.RotateScaleHandle(overlay, i));
    }

    this._lockHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._lockHandles.addLayer(L.lockHandle(overlay, i, {draggable: false})
      );
    }

    this._handles = {
      scale: this._scaleHandles,
      distort: this._distortHandles,
      rotate: this._rotateHandles,
      freeRotate: this._freeRotateHandles,
      lock: this._lockHandles,
    };
  },

  _appendHandlesandDragable: function() {
    var ov = this._overlay;
    var wrap = ov.getElement().parentNode;

    if (!this._mode) { // won't throw error if user adds 0 mode actions to toolbar
      this._enableDragging();
      return;
    }

    this._updateHandle();

    if (!ov.isSelected() && this.currentHandle) {
      this.currentHandle.eachLayer(function(handle) {
        handle.setOpacity(0);
        if (handle.dragging) { handle.dragging.disable(); }
      });

      if (!this.isMode('lock')) { this._enableDragging(); }
      else { L.DomUtil.addClass(wrap, 'lock'); }
    }
  },

  _onKeyDown: function(e) {
    var keymap = this.options.keymap;
    var handlerName = keymap[e.key];
    var ov = this._overlay;
    var eP = this.parentGroup;

    if (eP && eP.anyCollected()) { return; }

    if (this[handlerName] !== undefined && !ov.options.suppressToolbar) {
      if (ov.isSelected() && this.toolbar) {
        this[handlerName].call(this);
      }
    }
  },

  _timeout: function() {
    if (!this._timer) { return; }
    clearTimeout(this._timer);

    if (this._overlay._tooltip) {
      setTimeout(L.bind(function() {
        this._overlay.unbindTooltip();
      }, this), 400);
    }
  },

  addTool: function(value) {
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
      for (var mode in L.DistortableImage.Edit.MODES) {
        if (L.DistortableImage.Edit.MODES[mode] === value) {
          this._modes[mode] = value;
        }
      }
      if (!this._overlay.isSelected()) { this._removeToolbar(); }
      return this;
    } else {
      return false;
    }
  },

  hasTool: function(value) {
    return this.editActions.some(function(action) {
      return action === value;
    });
  },

  removeTool: function(value) {
    var matched = this.editActions.some(function(item, idx) {
      if (item === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        for (var mode in L.DistortableImage.Edit.MODES) {
          if (L.DistortableImage.Edit.MODES[mode] === value) {
            delete this._modes[mode];
            this._nextOrNada(mode);
            return true;
          }
        }
      }
    }, this);
    if (!this._overlay.isSelected()) { this._removeToolbar(); }
    if (matched) { return this; }
    else { return false; }
  },

  // set the mode to the next mode or if that was the last one set mode to ''
  _nextOrNada: function(mode) {
    if (this.isMode(mode)) {
      if (Object.keys(this.getModes()).length >= 1) {
        this.nextMode();
      } else {
        if (mode === 'lock') { this._enableDragging(); }
        this._mode = '';
        this._updateHandle();
      }
    }
  },

  _removeToolbar: function() {
    var overlay = this._overlay;
    var map = overlay._map;

    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    }
  },

  _previewOn: function(e) {
    var ov = this._overlay;
    var img = ov.getElement();
    var eP = this.parentGroup;
    // images with no mode will just get white
    var color = L.DistortableImage.Edit.colormap[this.getMode()] || 'white';
    /* don't turn this this UI on for collection interface - has its own UI
     * TODO longpress registers as `mouseover`, figure out a way to get into this conditional
     * for touchscreens. (Not critical barely noticable UI diff - the image outline not removed)
     */
    if ((e && e.shiftKey) || (eP && eP.anyCollected())) {
      this._previewOff();
      return;
    }

    if (e && !e.shitKey) { L.DomEvent.stop(e); }
    if (this._preview) { return; }
    // prevents triggeringg preview UI for other images overlapped during dragging
    if (ov.isSelected() || eP && eP.anyMoving()) { return; }

    img.style.outline = '1px solid ' + color;
    L.DomUtil.setOpacity(img, 0.8);
    L.DomUtil.removeClass(img.parentNode, 'clear');
    this._showMarkers();
    this._preview = true;
  },

  _previewOff: function(e) {
    var ov = this._overlay;
    var img = ov.getElement();

    if (e && !e.shitKey) { L.DomEvent.stop(e); }
    if (this.isMode('lock') && (e && e.type === 'mousedown') && !e.shitKey) {
      ov.bindTooltip('Locked!').addTo(ov._map);
      // 500 sec === user trying to drag the locked overlay & confused?
      // Otherwise doesen't fire (see clearTimeout in `_timeout` for `mouseup`)
      this._timer = setTimeout(L.bind(function() {
        ov._openTooltip(ov._tooltip);
      }, ov), 500);
    }

    if (!this._preview) { return; }

    this._preview = false;
    this._hideMarkers();
    L.DomUtil.setOpacity(img, this.lastOpacity);
    /*
     * TODO: in order to not mess with the actual opacity and borders set by the user
     * go into their tb actions and make sure to set the opacity / border status they pick to
     * `this.lastOpacity` and `this.lastOutline`, respectively
     */
    img.style.outline = this.lastOutline;
  },

  _enableDragging: function() {
    var overlay = this._overlay;
    var map = overlay._map;
    var img = overlay.getElement();

    this.dragging = new L.Draggable(img);
    this.dragging.enable();

    /* Hide toolbars and markers while dragging; click will re-show it */
    this.dragging.on('dragstart', function() {
      overlay.fire('dragstart');
      if (overlay.eP && overlay.eP.anyCollected()) { return; }
      if (overlay.isSelected()) { overlay.deselect(); }
      console.log('no returned');
      L.DomUtil.setOpacity(img, 0.8);
      L.DomUtil.addClass(img.parentNode, 'clear');
    }, this);

    this.dragging.on('dragend', function() {
      if (overlay.eP && overlay.eP.anyCollected()) { return; }
      L.DomUtil.setOpacity(img, this.lastOpacity);
      this.lastOpacity = img.style.opacity;
      L.DomUtil.removeClass(img.parentNode, 'clear');
      if (!overlay.isSelected()) { overlay.select(); }
    }, this);

    /*
     * Adjust default behavior of L.Draggable, which overwrites the CSS3 distort transformations
     * that we set when it calls L.DomUtil.setPosition.
     */
    this.dragging._updatePosition = function() {
      var topLeft = overlay.getCorner(0);
      var delta = this._newPos.subtract(map.latLngToLayerPoint(topLeft));
      var currentPoint;
      var corners = {};
      var i;

      this.fire('predrag');

      for (i = 0; i < 4; i++) {
        currentPoint = map.latLngToLayerPoint(overlay.getCorner(i));
        corners[i] = map.layerPointToLatLng(currentPoint.add(delta));
      }

      overlay.setCorners(corners);
      overlay.fire('drag');

      this.fire('drag');
    };
  },

  _disableDragging: function() {
    if (this.dragging) {
      this.dragging.disable();
      delete this.dragging;
    }
  },

  _scaleMode: function() {
    this.setMode('scale');
  },

  _distortMode: function() {
    this.setMode('distort');
  },

  _rotateMode: function() {
    this.setMode('rotate');
  },

  _freeRotateMode: function() {
    this.setMode('freeRotate');
  },

  _toggleLockMode: function() {
    if (!this.hasTool(L.LockAction)) { return; }
    if (this.isMode('lock')) { this._unlock(); }
    else { this._lock(); }
  },

  _toggleOpacity: function() {
    var image = this._overlay.getElement();
    var opacity;

    if (!this.hasTool(L.OpacityAction)) { return; }

    this._transparent = !this._transparent;
    opacity = this._transparent ? this.options.opacity : 1;

    L.DomUtil.setOpacity(image, opacity);

    this._refresh();
  },

  _toggleBorder: function() {
    var image = this._overlay.getElement();
    // var opacity;
    var outline;

    if (!this.hasTool(L.BorderAction)) { return; }

    this._outlined = !this._outlined;
    outline = this._outlined ? this.options.outline : 'none';

    // L.DomUtil.setOpacity(image, opacity);

    image.style.outline = outline;

    this._refresh();
  },

  // compare this to using overlay zIndex
  _toggleOrder: function() {
    if (!this.hasTool(L.StackAction)) { return; }
    if (this._toggledImage) { this._stackUp(); }
    else { this._stackDown(); }
  },

  _removeOverlay: function() {
    var ov = this._overlay;
    var eP = this.parentGroup;

    if (this.isMode('lock') || !this.hasTool(L.DeleteAction)) { return; }

    var choice = L.DomUtil.confirmDelete();
    if (!choice) { return; }

    this._removeToolbar();

    if (eP) { eP.removeLayer(ov); }
    else { ov._map.removeLayer(ov); }
  },

  // Based on https://github.com/publiclab/mapknitter/blob/8d94132c81b3040ae0d0b4627e685ff75275b416/app/assets/javascripts/mapknitter/Map.js#L47-L82
  _getExport: function() {
    var overlay = this._overlay;
    var map = overlay._map;

    if (!this.hasTool(L.ExportAction)) { return; }

    // make a new image
    var downloadable = new Image();

    downloadable.id = downloadable.id || 'tempId12345';
    document.body.appendChild(downloadable);

    downloadable.onload = function onLoadDownloadableImage() {
      var height = downloadable.height;
      var width = downloadable.width;
      var nw = map.latLngToLayerPoint(overlay.getCorner(0));
      var ne = map.latLngToLayerPoint(overlay.getCorner(1));
      var sw = map.latLngToLayerPoint(overlay.getCorner(2));
      var se = map.latLngToLayerPoint(overlay.getCorner(3));

      // I think this is to move the image to the upper left corner,
      // eslint-disable-next-line max-len
      // jywarren: i think we may need these or the image goes off the edge of the canvas
      // jywarren: but these seem to break the distortion math...

      // jywarren: i think it should be rejiggered so it
      // finds the most negative values of x and y and then
      // adds those to all coordinates

      // nw.x -= nw.x;
      // ne.x -= nw.x;
      // se.x -= nw.x;
      // sw.x -= nw.x;

      // nw.y -= nw.y;
      // ne.y -= nw.y;
      // se.y -= nw.y;
      // sw.y -= nw.y;

      // run once warping is complete
      downloadable.onload = function() {
        L.DomUtil.remove(downloadable);
      };

      if (window && window.hasOwnProperty('warpWebGl')) {
        warpWebGl(
            downloadable.id,
            [0, 0, width, 0, width, height, 0, height],
            [nw.x, nw.y, ne.x, ne.y, se.x, se.y, sw.x, sw.y],
            true // trigger download
        );
      }
    };

    downloadable.src = overlay.options.fullResolutionSrc || overlay._image.src;
  },

  _stackUp: function() {
    var t = this._toggledImage;

    if (!t || !this.hasTool(L.StackAction)) { return; }

    this._toggledImage = false;
    this._overlay.bringToFront();
    this._refresh();
  },

  _stackDown: function() {
    var t = this._toggledImage;

    if (t || !this.hasTool(L.StackAction)) { return; }
    this._toggledImage = true;
    this._overlay.bringToBack();
    this._refresh();
  },

  _unlock: function() {
    var ov = this._overlay;
    var map = ov._map;
    var wrap = ov.getElement().parentNode;
    var eP = this.parentGroup;

    if (!this.isMode('lock')) { return; }
    if (!this.hasTool(L.LockAction) && (eP && !eP.editing.hasTool(L.UnlockAction))) { return; }
    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    if (ov.options.mode === 'lock' || !this.hasMode(ov.options.mode)) {
      this._mode = '';
      this.currentHandle = '';
    } else {
      this._mode = ov.options.mode;
    }

    L.DomUtil.removeClass(wrap, 'lock');
    this._updateHandle();
    this._enableDragging();
    this._refresh();
  },

  _lock: function() {
    var ov = this._overlay;
    var map = ov._map;
    var wrap = ov.getElement().parentNode;
    var eP = this.parentGroup;

    if (this.isMode('lock')) { return; }
    if (!this.hasTool(L.LockAction) && (eP && !eP.editing.hasTool(L.LockAction))) { return; }

    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    this._mode = 'lock';

    L.DomUtil.addClass(wrap, 'lock');
    this._updateHandle();
    this._disableDragging();
    this._refresh();
  },

  _deselect: function() {
    this._overlay.deselect();
  },

  _showMarkers: function(e) {
    var eP = this.parentGroup;

    if (!this.currentHandle) { return; }
    // only markers we want in collect interface for now is lock
    if (!this.isMode('lock') && (eP && eP.anyCollected())) { return; }
    this.currentHandle.eachLayer(function(handle) {
      handle.setOpacity(1);
      if (handle.dragging) { handle.dragging.enable(); }
    });
  },

  _hideMarkers: function(e) {
    var eP = this.parentGroup;
    // workaround for race condition w/ feature group
    if (!this._handles) { this._initHandles(); }
    if (!this.currentHandle) { return; }
    if (this.isMode('lock') && (eP && eP.isCollected(this._overlay))) { return; }

    this.currentHandle.eachLayer(function(handle) {
      handle.setOpacity(0);
      if (handle.dragging) { handle.dragging.disable(); }
    });
  },

  _addToolbar: function() {
    var ov = this._overlay;
    var eP = this.parentGroup;
    var map = ov._map;
    // Find the topmost point on the image.
    var corners = ov.getCorners();
    var maxLat = -Infinity;

    if (eP && eP.anyCollected()) {
      eP.editing._addToolbar();
      return;
    }

    if (ov.options.suppressToolbar || this.toolbar) { return; }

    for (var i = 0; i < corners.length; i++) {
      if (corners[i].lat > maxLat) {
        maxLat = corners[i].lat;
      }
    }
    // Longitude is based on the centroid of the image.
    var raisedPoint = ov.getCenter();
    raisedPoint.lat = maxLat;

    try {
      this.toolbar = L.distortableImage.popupBar(raisedPoint, {
        actions: this.editActions,
      }).addTo(map, ov);
      ov.fire('toolbar:created');
    } catch (e) { }
  },

  _refresh: function() {
    if (this.toolbar) { this._removeToolbar(); }
    this._addToolbar();
  },

  _updateToolbarPos: function() {
    var overlay = this._overlay;
    // Find the topmost point on the image.
    var corners = overlay.getCorners();
    var toolbar = this.toolbar;
    var maxLat = -Infinity;

    if (toolbar && toolbar instanceof L.DistortableImage.PopupBar) {
      for (var i = 0; i < corners.length; i++) {
        if (corners[i].lat > maxLat) {
          maxLat = corners[i].lat;
        }
      }
      // Longitude is based on the centroid of the image.
      var raisedPoint = overlay.getCenter();
      raisedPoint.lat = maxLat;

      if (!overlay.options.suppressToolbar) {
        this.toolbar.setLatLng(raisedPoint);
      }
    }
  },

  // this event catches fakely generated map doubleclicks on touchscreens and calls
  // nextMode on the original overlay that fired it, accessed via a stamp given to it
  // right before the doubleclick is fired. (see L.DistortableImageOverlay 'select')
  _catchAndFire: function(e) {
    var map = this._overlay._map;
    var ov = map._layers[map._stamp];
    var oe = e.originalEvent;
    var eP = this.parentGroup;

    L.DomEvent.stopPropagation(e);

    // _catchAndFire is just for synthetic events
    if (e.isTrusted || (eP && eP.anyCollected())) { return false; }

    if (oe && oe.target instanceof HTMLImageElement) {
      setTimeout(function() {
        map._clicked = 0;
        clearTimeout(map._clickTimeout);
      }, 0);

      ov.editing.nextMode(e);
    }
  },

  _updateHandle: function() {
    var ov = this._overlay;
    var map = ov._map;
    var mode = this.getMode();

    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    this.currentHandle = mode === '' ? '' : this._handles[this.getMode()];
    if (this.currentHandle !== '') {
      map.addLayer(this.currentHandle);
    }
  },

  isMode: function(mode) {
    if (!this.enabled()) { return false; }
    return this._mode === mode;
  },

  getMode: function() {
    if (!this.enabled()) { return false; }
    return this._mode;
  },

  hasMode: function(mode) {
    return !!this._modes[mode];
  },

  getModes: function() {
    return this._modes;
  },

  setMode: function(newMode) {
    var ov = this._overlay;
    var eP = this.parentGroup;

    if (this.isMode(newMode)) { return false; }
    if (!this.enabled()) { return false; }

    if (this.hasMode(newMode) || (eP && eP.editing.hasTool(L.DistortableCollection.Edit.MODES[newMode]))) {
      if (this.toolbar) { this.toolbar.clickTool(newMode); }
      if (this.isMode('lock') && !this.dragging) {
        this._enableDragging();
      }
      this._mode = newMode;
      if (this.isMode('lock') && this.dragging) {
        this._disableDragging();
      }
      this._updateHandle();
      this._refresh();
      if (eP && eP.isCollected(ov)) { ov.deselect(); }
      return this;
    }
    return false;
  },

  /**
    * need to attach a stop to img dblclick or it will propagate to
    * the map and fire the handler that shows map location labels on map dblclick.
    */
  nextMode: function(e) {
    var m = this.getMode();
    var eP = this.parentGroup;
    var modesArray = Object.keys(this.getModes());
    var idx = modesArray.indexOf(m);
    var nextIdx = (idx + 1) % modesArray.length;
    var newMode = modesArray[nextIdx];

    if (e) {
      if (eP && eP.anyCollected()) { return false; }
      L.DomEvent.stop(e);
    }

    return this.setMode(newMode);
  },
});

L.distortableImage.edit = function(overlay, options) {
  return new L.DistortableImage.Edit(overlay, options);
};
