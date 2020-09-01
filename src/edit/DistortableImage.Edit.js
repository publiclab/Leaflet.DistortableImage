L.DistortableImage = L.DistortableImage || {};

// holds the keybindings & toolbar API for an individual image instance
L.DistortableImage.Edit = L.Handler.extend({
  options: {
    opacity: 0.7,
    outline: '1px solid red',
    keymap: L.distortableImage.action_map,
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

    this.editActions = this.options.actions;

    /* bring the selected image into view */
    overlay.bringToFront();
    this._initModes();
    this._initHandles();
    this._appendHandlesandDragable();


    if (overlay.isSelected() && !overlay.options.suppressToolbar) {
      this._addToolbar();
    }

    this.parentGroup = overlay.eP ? overlay.eP : false;

    L.DomEvent.on(overlay.getElement(), {
      dblclick: this.nextMode,
    }, this);

    L.DomEvent.on(window, 'keydown', this._onKeyDown, this);
  },

  /* Run on image deselection. */
  removeHooks: function() {
    var overlay = this._overlay;
    var eP = this.parentGroup;

    // First, check if dragging exists - it may be off due to locking
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

    L.DomEvent.off(overlay.getElement(), {
      dblclick: this.nextMode,
    }, this);

    L.DomEvent.off(window, 'keydown', this._onKeyDown, this);
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

    this._dragHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._dragHandles.addLayer(L.dragHandle(overlay, i));
    }

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
      this._freeRotateHandles.addLayer(L.freeRotateHandle(overlay, i));
    }

    this._lockHandles = L.layerGroup();
    for (i = 0; i < 4; i++) {
      this._lockHandles.addLayer(L.lockHandle(overlay, i, {draggable: false}));
    }

    this._handles = {
      drag: this._dragHandles,
      scale: this._scaleHandles,
      distort: this._distortHandles,
      rotate: this._rotateHandles,
      freeRotate: this._freeRotateHandles,
      lock: this._lockHandles,
    };
  },

  _appendHandlesandDragable() {
    var ov = this._overlay;

    // won't throw error if user adds 0 mode actions to toolbar
    if (!this._mode) {
      this._enableDragging();
      return;
    }

    this._updateHandle();

    if (!ov.isSelected() && this.currentHandle) {
      this.currentHandle.eachLayer((handle) => {
        handle.setOpacity(0);
        if (handle.dragging) { handle.dragging.disable(); }
      });
    }
    if (!this.isMode('lock')) { this._enableDragging(); }
  },

  _onKeyDown(e) {
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

  replaceTool(old, next) {
    if (next.baseClass !== 'leaflet-toolbar-icon' || this.hasTool(next)) {
      return this;
    }
    this.editActions.some((item, idx) => {
      if (item === old) {
        this._removeToolbar();
        this.editActions[idx] = next;
        this._addToolbar();
        for (var mode in L.DistortableImage.Edit.MODES) {
          if (L.DistortableImage.Edit.MODES[mode] === old) {
            delete this._modes[mode];
            this._nextOrNone(mode);
          } else if (L.DistortableImage.Edit.MODES[mode] === next) {
            this._modes[mode] = next;
          }
        }
        return true;
      }
    });
    return this;
  },

  addTool(value) {
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
    }
    return this;
  },

  hasTool(value) {
    return this.editActions.some(action => action === value);
  },

  removeTool(value) {
    this.editActions.some((item, idx) => {
      if (item === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        for (var mode in L.DistortableImage.Edit.MODES) {
          if (L.DistortableImage.Edit.MODES[mode] === value) {
            delete this._modes[mode];
            this._nextOrNone(mode);
          }
        }
        return true;
      }
    });
    if (!this._overlay.isSelected()) { this._removeToolbar(); }
    return this;
  },

  // set the mode to the next mode or if that was the last one set mode to ''
  _nextOrNone(mode) {
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

  _removeToolbar() {
    var ov = this._overlay;
    var map = ov._map;

    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    }
  },

  _enableDragging() {
    var overlay = this._overlay;
    var map = overlay._map;

    this.dragging = new L.Draggable(overlay.getElement());
    this.dragging.enable();

    /* Hide toolbars and markers while dragging; click will re-show it */
    this.dragging.on('dragstart', () => {
      overlay.fire('dragstart');
      this._removeToolbar();
    });

    /*
     * Adjust default behavior of L.Draggable, which overwrites the CSS3
     * distort transformations that we set when it calls L.DomUtil.setPosition.
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

  _disableDragging() {
    if (this.dragging) {
      this.dragging.disable();
      delete this.dragging;
    }
  },

  _dragMode() {
    this.setMode('drag');
  },

  _scaleMode() {
    this.setMode('scale');
  },

  _distortMode() {
    this.setMode('distort');
  },

  _rotateMode() {
    this.setMode('rotate');
  },

  _freeRotateMode() {
    this.setMode('freeRotate');
  },

  _toggleLockMode() {
    if (this.isMode('lock')) { this._unlock(); }
    else { this._lock(); }
  },

  _toggleOpacity() {
    var image = this._overlay.getElement();
    var opacity;

    if (!this.hasTool(L.OpacityAction)) { return; }

    this._transparent = !this._transparent;
    opacity = this._transparent ? this.options.opacity : 1;

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute('opacity', opacity);

    this._refresh();
  },

  _toggleBorder() {
    var image = this._overlay.getElement();
    var outline;

    if (!this.hasTool(L.BorderAction)) { return; }

    this._outlined = !this._outlined;
    outline = this._outlined ? this.options.outline : 'none';

    image.style.outline = outline;

    this._refresh();
  },

  // compare this to using overlay zIndex
  _toggleOrder: function() {
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
    var img = overlay.getElement();

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

    downloadable.src = overlay.options.fullResolutionSrc || img.src;
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
    var eP = this.parentGroup;

    if (!this.isMode('lock')) { return; }
    if ((eP && !eP.isCollected(ov)) || !eP) {
      if (!this.hasTool(L.LockAction)) { return; }
    }

    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    if (ov.options.mode === 'lock' || !this.hasMode(ov.options.mode)) {
      this._mode = '';
      this.currentHandle = '';
    } else {
      this._mode = ov.options.mode;
    }
    this._updateHandle();
    this._enableDragging();
    this._refresh();
  },

  _lock: function() {
    var ov = this._overlay;
    var map = ov._map;
    var eP = this.parentGroup;

    if (this.isMode('lock')) { return; }
    if ((eP && !eP.isCollected(ov)) || !eP) {
      if (!this.hasTool(L.LockAction)) { return; }
    }

    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    this._mode = 'lock';
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

    this.currentHandle.eachLayer((handle) => {
      handle.setOpacity(1);
      if (handle.dragging) { handle.dragging.enable(); }
      L.DomUtil.addClass(handle.getElement(), 'leaflet-interactive');
    });
  },

  _hideMarkers: function() {
    var ov = this._overlay;
    var eP = this.parentGroup;

    // workaround for race condition w/ feature group
    if (!this._handles) { this._initHandles(); }

    if (!this.currentHandle) { return; }
    if (this.isMode('lock') && (eP && eP.isCollected(ov))) { return; }

    this.currentHandle.eachLayer((handle) => {
      handle.setOpacity(0);
      if (handle.dragging) { handle.dragging.disable(); }
      L.DomUtil.removeClass(handle.getElement(), 'leaflet-interactive');
    });
  },

  _updateHandle: function() {
    var ov = this._overlay;
    var map = ov._map;
    var mode = this.getMode();

    if (this.currentHandle) { map.removeLayer(this.currentHandle); }
    this.currentHandle = mode === '' ? '' : this._handles[mode];
    if (this.currentHandle !== '') {
      map.addLayer(this.currentHandle);
    }
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

    this.toolbar = L.distortableImage.popupBar(raisedPoint, {
      actions: this.editActions,
    }).addTo(map, ov);
    ov.fire('toolbar:created');
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

  hasMode: function(mode) {
    return !!this._modes[mode];
  },

  getMode: function() {
    if (!this.enabled()) { return; }
    return this._mode;
  },

  getModes: function() {
    return this._modes;
  },

  isMode: function(mode) {
    if (!this.enabled()) { return false; }
    return this._mode === mode;
  },

  setMode: function(newMode) {
    var ov = this._overlay;
    var eP = this.parentGroup;
    var mode = this.getMode();

    if (mode === newMode || !this.hasMode(newMode) || !this.enabled()) {
      return;
    }

    if (this.toolbar) { this.toolbar.clickTool(newMode); }
    if (this.isMode('lock') && !this.dragging) { this._enableDragging(); }
    this._mode = newMode;
    if (this.isMode('lock')) { this._disableDragging(); }
    this._updateHandle();
    this._refresh();

    if (eP && eP.isCollected(ov)) { ov.deselect(); }

    return this;
  },

  /**
    * need to attach a stop to img dblclick or it will propagate to
    * the map and fire the handler that shows map location labels on map dblclick.
    */
  nextMode: function(e) {
    var mode = this.getMode();
    var eP = this.parentGroup;
    var modesArray = Object.keys(this.getModes());
    var idx = modesArray.indexOf(mode);
    var nextIdx = (idx + 1) % modesArray.length;
    var newMode = modesArray[nextIdx];

    if (e) {
      if (eP && eP.anyCollected()) { return; }
      L.DomEvent.stop(e);
    }

    return this.setMode(newMode);
  },
});

L.distortableImage.edit = function(overlay, options) {
  return new L.DistortableImage.Edit(overlay, options);
};
