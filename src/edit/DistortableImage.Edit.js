L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Edit = L.Handler.extend({
  options: {
    opacity: 0.7,
    outline: '1px solid red',
    keymap: {
     'Backspace': '_removeOverlay', // backspace windows / delete mac
     'CapsLock': '_toggleRotate',
     'Escape': '_deselect',
     'd': '_toggleDistort',
     'r': '_toggleRotateScale',
     'j': '_toggleOrder',
     'k': '_toggleOrder',
     'l': '_toggleLock',
     'o': '_toggleOutline',
     's': '_toggleScale',
		 't': '_toggleTransparency',
    },
    modes: {
      'distort': '_distortHandles',
      'lock': '_lockHandles',
      'rotate': '_rotateHandles', 
      'rotateScale': '_rotateScaleHandles',
      'scale': '_scaleHandles'
    },
    mode: 'distort',
  },

  initialize: function(overlay, options) {
    this._overlay = overlay;
    this._toggledImage = false;

    var ooms = overlay.options.modes;
    window.ee = this.options.modes;
    this._modes = ooms ? ooms : Object.keys(this.options.modes);

    var oom = overlay.options.mode;
    this._mode = oom && this.options.modes[oom] !== -1 ? oom : this.options.mode;
    this._initialMode = this._mode;
    
    this._selected = this._overlay.options.selected || false;
    this._transparent = false;
    this._outlined = false;

    /* generate instance counts. TODO - add the keymapper to collection instead of individ. imgs perhaps? */
    this.instance_count = L.DistortableImage.Edit.prototype.instances =
      L.DistortableImage.Edit.prototype.instances ? L.DistortableImage.Edit.prototype.instances + 1 : 1;

    L.setOptions(this, options); 
  },

  /* Run on image selection. */
  addHooks: function() {
    var overlay = this._overlay,
      map = overlay._map,
      keymapper_position;

    /* instantiate and render keymapper for one instance only */
    if (this.instance_count === 1 && overlay.options.keymapper !== false) {
      keymapper_position = overlay.options.keymapper_position || 'topright';
      map.addControl(new L.DistortableImage.Keymapper({ position: keymapper_position }));
    }

    /* bring the selected image into view */
    overlay.bringToFront();

    this._initHandles();

    this._appendHandlesandDragable(this._mode);

    this.editActions = this.options.actions;

    if (this._selected && !overlay.options.suppressToolbar) { this._addToolbar(); }

    this._overlay._dragStartPoints = {
      0: L.point(0, 0),
      1: L.point(0, 0),
      2: L.point(0, 0),
      3: L.point(0, 0)
    };

    L.DomEvent.on(map, "click", this._deselect, this);
    L.DomEvent.on(overlay._image, "click", this._select, this);

    /* Enable hotkeys. */
    L.DomEvent.on(window, "keydown", this._onKeyDown, this);

    this._handles = {
      lock: this._lockHandles,
      distort: this._distortHandles,
      rotateScale: this._rotateScaleHandles,
      scale: this._scaleHandles,
      rotate: this._rotateHandles
    };
  },

  /* Run on image deselection. */
  removeHooks: function() {
    var overlay = this._overlay,
      map = overlay._map,
      modeHandles;

    // First, check if dragging exists - it may be off due to locking
    if (this.dragging) { this.dragging.disable(); }
    delete this.dragging;

    if (this.toolbar) { this._removeToolbar(); }
    if (this.editing) { this.editing.disable(); }

    if (this._mode !== 'none') {
      modeHandles = this.options.modes[this._mode];
      map.removeLayer(this[modeHandles]);
    }

    L.DomEvent.off(map, "click", this._deselect, this);
    L.DomEvent.off(overlay._image, "click", this._select, this);

    /* Disable hotkeys. */
    L.DomEvent.off(window, "keydown", this._onKeyDown, this);
  },

  _initHandles: function() {
    var modeMap = this.options.modes,
        modes = this._modes;

    for (var i = 0; i < modes.length; i++) {
      var modeHandler = modeMap[modes[i]];
      if (modeHandler) {
        this[modeHandler].call(this);
      }
    }
  },

  /** ==== mode handles begin here ==== */

  _distortHandles: function() {
    this._distortHandles = L.layerGroup();
    for (var i = 0; i < 4; i++) {
      this._distortHandles.addLayer(
        new L.DistortHandle(this._overlay, i)
      );
    }
  },

  _lockHandles: function () {
    this._lockHandles = L.layerGroup();
    for (var i = 0; i < 4; i++) {
      this._lockHandles.addLayer(
        new L.LockHandle(this._overlay, i, { draggable: false })
      );
    }
  },
 
  _rotateHandles: function () {
    this._rotateHandles = L.layerGroup(); // individual rotate
    for (var i = 0; i < 4; i++) {
      this._rotateHandles.addLayer(
        new L.RotateHandle(this._overlay, i)
      );
    }
  },

  _rotateScaleHandles: function () {
    this._rotateScaleHandles = L.layerGroup(); // handle includes rotate AND scale
    for (var i = 0; i < 4; i++) {
      this._rotateScaleHandles.addLayer(
        new L.RotateScaleHandle(this._overlay, i)
      );
    }
  },

  _scaleHandles: function() {
    this._scaleHandles = L.layerGroup();
    for (var i = 0; i < 4; i++) {
      this._scaleHandles.addLayer(
        new L.ScaleHandle(this._overlay, i)
      );
    }
  },
    
  /** ==== mode handles end here ==== */

  _appendHandlesandDragable: function (mode) {
    var overlay = this._overlay,
        map = overlay._map;

    /** using this classes default 'modes' option as the map ensures that a user-provided 'mode' (initial mode) 
     * option doesn't also have to be provided by them in the 'modes' option arary if they overrwrite the default */
    var modeHandles = this.options.modes[mode];
    if (modeHandles) {
      map.addLayer(this[modeHandles]);
    }
   
    if (mode !== 'lock') {
      if (!this._selected) {
        this[modeHandles].eachLayer(function (layer) {
          layer.setOpacity(0);
          layer.dragging.disable();
          layer.options.draggable = false;
        });
      }

      this._enableDragging();
    }
  },

  _addToolbar: function () {
    var overlay = this._overlay,
        map = overlay._map,
        corners = overlay.getCorners(),
        maxLat = -Infinity;

    //Find the topmost point on the image.
    for (var i = 0; i < corners.length; i++) {
      if (corners[i].lat > maxLat) {
        maxLat = corners[i].lat;
      }
    }
    //Longitude is based on the centroid of the image.
    var raised_point = overlay.getCenter();
    raised_point.lat = maxLat;

    try {
      this.toolbar = L.distortableImage.popupBar(raised_point, {
        actions: this.editActions
      }).addTo(map, overlay);
      overlay.fire('toolbar:created');
    }
    catch (e) { }
  },

  _showToolbar: function () {
    var overlay = this._overlay,
      eventParents = overlay._eventParents;

    if (overlay.options.suppressToolbar) { return; }

    if (eventParents) {
      var eP = eventParents[Object.keys(eventParents)[0]];
      if (eP.anySelected()) {
        eP._addToolbar();
        return;
      }
    }

    this._addToolbar();
  },

  addTool: function (value) {
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
    } else {
      return false;
    }
  },

  hasTool: function (value) {
    return this.editActions.some(function (action) {
      return action === value;
    });
  },

  removeTool: function (value) {
    this.editActions.some(function (item, idx) {
      if (this.editActions[idx] === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    }, this);
  },

  _rotateBy: function(angle) {
    var overlay = this._overlay,
      map = overlay._map,
      center = map.latLngToLayerPoint(overlay.getCenter()),
      i,
      p,
      q;

    for (i = 0; i < 4; i++) {
      p = map.latLngToLayerPoint(overlay.getCorner(i)).subtract(center);
      q = L.point(
        Math.cos(angle) * p.x - Math.sin(angle) * p.y,
        Math.sin(angle) * p.x + Math.cos(angle) * p.y
      );
      overlay.setCorner(i, map.layerPointToLatLng(q.add(center)));
    }

    // window.angle = L.TrigUtil.radiansToDegrees(angle);

    this._overlay.rotation -= L.TrigUtil.radiansToDegrees(angle);

    overlay._reset();
  },

  _revert: function() {
    var overlay = this._overlay;
    var angle = overlay.rotation;
    var map = overlay._map;
    var center = map.latLngToLayerPoint(overlay.getCenter());
    var offset = overlay._initialDimensions.offset;

    var corners = { 
      0: map.layerPointToLatLng(center.subtract(offset)),
      1: map.layerPointToLatLng(center.add(L.point(offset.x, -offset.y))),
      2: map.layerPointToLatLng(center.add(L.point(-offset.x, offset.y))),
      3: map.layerPointToLatLng(center.add(offset))
    };

    map.removeLayer(this._handles[this._mode]);

    overlay.setCorners(corners);

    if (angle !== 0) { this._rotateBy(L.TrigUtil.degreesToRadians(360 - angle)); }

    map.addLayer(this._handles[this._mode]);

    this._updateToolbarPos();

    this._overlay.rotation = angle;
  },

  _scaleBy: function(scale) {
    var overlay = this._overlay,
      map = overlay._map,
      center = map.latLngToLayerPoint(overlay.getCenter()),
      i,
      p;

    for (i = 0; i < 4; i++) {
      p = map
        .latLngToLayerPoint(overlay.getCorner(i))
        .subtract(center)
        .multiplyBy(scale)
        .add(center);
      overlay.setCorner(i, map.layerPointToLatLng(p));
    }

    overlay._reset();
  },

  _enableDragging: function() {
    var overlay = this._overlay,
      map = overlay._map;

    this.dragging = new L.Draggable(overlay.getElement());
    this.dragging.enable();

    /* Hide toolbars and markers while dragging; click will re-show it */
    this.dragging.on("dragstart", function() {
      overlay.fire("dragstart");
      this._removeToolbar();
    },this);

    /*
     * Adjust default behavior of L.Draggable.
     * By default, L.Draggable overwrites the CSS3 distort transform
     * that we want when it calls L.DomUtil.setPosition.
     */
    this.dragging._updatePosition = function() {
      var delta = this._newPos.subtract(
          map.latLngToLayerPoint(overlay._corners[0])
        ),
        currentPoint,
        i;

      this.fire("predrag");

      for (i = 0; i < 4; i++) {
        currentPoint = map.latLngToLayerPoint(overlay._corners[i]);
        overlay._corners[i] = map.layerPointToLatLng(currentPoint.add(delta));
			}

      overlay._reset();
      overlay.fire("update");
      overlay.fire("drag");

      this.fire("drag");
    };
  },

  _onKeyDown: function(event) {
    var keymap = this.options.keymap,
      handlerName = keymap[event.key],
      eventParents = this._overlay._eventParents;

    if (eventParents) {
      var eP = eventParents[Object.keys(eventParents)[0]];
      if (eP.anySelected()) {
        return;
      }
    }

    if (this[handlerName] !== undefined && !this._overlay.options.suppressToolbar) {
      if (this._selected) {
        this[handlerName].call(this);
      }
    }
  },

  /** ==== mode handle togglers begin here ==== */

  _toggleLock: function () {
    var map = this._overlay._map,
        modeHandles;

    // this conditional gives the user the ability to forbid the corresponding mode
    if (L.Util.indexOf(this._modes, 'lock') === -1 && this._initialMode !== 'lock') { return; }

    if (this._mode !== 'none') {
      modeHandles = this.options.modes[this._mode];
      map.removeLayer(this[modeHandles]);
    }
    
    if (this._mode === 'lock') {
      this._unlock();
    } else {
      this._lock();
    }

    /** If the user selected `lock` mode as their initial mode, then toggleLock will just 
     * remove the handles ('none'). Otherwise stuck in lock? For the other 3 modes, if they were 
     * the initially selected mode then their handles just don't toggle out. (ex. see comment on toggleDistort below) */
    if (this._mode !== 'none') { 
      modeHandles = this.options.modes[this._mode];
      map.addLayer(this[modeHandles]);
    }
  },

  _toggleDistort: function () {
    var map = this._overlay._map,
        modeHandles;

    if (this._mode === 'lock') { return; }
    if (L.Util.indexOf(this._modes, 'distort') === -1 && this._initialMode !== 'distort') { return; }
    /** this conditional is for when the mode is the initially selected mode, so don't toggle the handles */
    if (this._mode === 'distort' && this._mode === this._initialMode) { return; }

    if (this._mode !== 'none') {
      modeHandles = this.options.modes[this._mode];
      map.removeLayer(this[modeHandles]);
      if (this._mode === 'distort') { this._mode = this._initialMode; }
      else { this._mode = 'distort'; }
    } else {
      this._mode = 'distort';
    }
  
    modeHandles = this.options.modes[this._mode];
    map.addLayer(this[modeHandles]);
  },

  _toggleRotateScale: function() {
    var map = this._overlay._map,
        modeHandles;

    if (this._mode === 'lock') { return; }
    if (L.Util.indexOf(this._modes, 'rotateScale') === -1 && this._initialMode !== 'rotateScale') { return; }
    if (this._mode === 'rotateScale' && this._mode === this._initialMode) { return; }

    if (this._mode !== 'none') { 
      modeHandles = this.options.modes[this._mode];
      map.removeLayer(this[modeHandles]);
      if (this._mode === 'rotateScale') { this._mode = this._initialMode; }
      else { this._mode = 'rotateScale'; }
    } else {
      this._mode = 'rotateScale';
    }

    modeHandles = this.options.modes[this._mode];
    map.addLayer(this[modeHandles]);
  },

  _toggleScale: function() {
    var map = this._overlay._map,
        modeHandles;

    if (this._mode === 'lock') { return; }
    if (L.Util.indexOf(this._modes, 'scale') === -1 && this._initialMode !== 'scale') { return; }
    if (this._mode === 'scale' && this._mode === this._initialMode) { return; }

    if (this._mode !== 'none') { 
      modeHandles = this.options.modes[this._mode];
      map.removeLayer(this[modeHandles]);
		  if (this._mode === 'scale') { this._mode = this._initialMode; }
      else { this._mode = 'scale'; }
    } else {
      this._mode = 'scale';
    }

    modeHandles = this.options.modes[this._mode];
    map.addLayer(this[modeHandles]);
  },

  _toggleRotate: function() {
    var map = this._overlay._map,
        modeHandles;

    if (this._mode === 'lock') { return; }
    if (L.Util.indexOf(this._modes, 'rotate') === -1 && this._initialMode !== 'rotate') { return; }
    if (this._mode === 'rotate' && this._mode === this._initialMode) { return; }

    if (this._mode !== 'none') { 
      modeHandles = this.options.modes[this._mode];
      map.removeLayer(this[modeHandles]);
      if (this._mode === 'rotate') { this._mode = this._initialMode; } 
      else { this._mode = 'rotate'; }
    } else {
      this._mode = 'rotate';
    }

    modeHandles = this.options.modes[this._mode];
    map.addLayer(this[modeHandles]);
  },

  /** ==== mode handle togglers end here ==== */

  _toggleTransparency: function() {
    var image = this._overlay._image,
      opacity;

    this._transparent = !this._transparent;
    opacity = this._transparent ? this.options.opacity : 1;

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute('opacity', opacity);
  },

  _toggleOutline: function() {
    var image = this._overlay.getElement(),
      opacity,
      outline;

    this._outlined = !this._outlined;
    outline = this._outlined ? this.options.outline : 'none';

    L.DomUtil.setOpacity(image, opacity);
    image.setAttribute('opacity', opacity);

    image.style.outline = outline;
  },

  _sendUp: function() {
    this._overlay.bringToFront();
  },

  _sendDown: function() {
    this._overlay.bringToBack();
  },

  /** in case your initial mode was lock, then just swap to 'none' */
  _unlock: function() {
    this._mode = this._initialMode === 'lock' ? 'none' : this._initialMode;
    this._enableDragging();
  },

  _lock: function() {
    this._mode = 'lock';
    if (this.dragging) { this.dragging.disable(); }
    delete this.dragging;
  },

  _select: function(event) {
    this._selected = true;
    this._showToolbar();
    this._showMarkers();

    if (event) { L.DomEvent.stopPropagation(event); }
  },

  _deselect: function() {
    this._selected = false;
    this._removeToolbar();
    if (this._mode !== 'lock') { 
      this._hideMarkers(); 
    }
  },

  _removeToolbar: function() {
    var overlay = this._overlay,
      map = overlay._map;

    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    }
  },

  _showMarkers: function() {
    if (this._mode === 'lock' || this._mode === 'none') { return; }

    if (this.toolbar && this.toolbar instanceof L.DistortableImage.PopupBar) {
      var modeHandles = this[this.options.modes[this._mode]];

      modeHandles.eachLayer(function (layer) {
        var drag = layer.dragging,
          opts = layer.options;

        layer.setOpacity(1);
        if (drag) { drag.enable(); }
        if (opts.draggable) { opts.draggable = true; }
      });
    }
  },

  _hideMarkers: function() {
    if (!this._handles) { this._initHandles(); }  // workaround for race condition w/ feature group

    if (this._mode === 'none') { return; }
    var modeHandles = this[this.options.modes[this._mode]]; //using the bracket method to turn string into method
    
		modeHandles.eachLayer(function (layer) {
      var drag = layer.dragging,
				opts = layer.options;

      if (this._mode !== 'lock') {
        layer.setOpacity(0);
      }
			if (drag) { drag.disable(); }
			if (opts.draggable) { opts.draggable = false; }
		});
  },

  _refreshPopupIcons: function() {
    this._addToolbar();
    this._removeToolbar();
  },
  
  _updateToolbarPos: function() {
    var overlay = this._overlay,
      //Find the topmost point on the image.
      corners = overlay.getCorners(),
      toolbar = this.toolbar,
      maxLat = -Infinity;

    if (toolbar && toolbar instanceof L.DistortableImage.PopupBar) { 
      for (var i = 0; i < corners.length; i++) {
        if (corners[i].lat > maxLat) {
          maxLat = corners[i].lat;
        }
      }

      //Longitude is based on the centroid of the image.
      var raised_point = overlay.getCenter();
      raised_point.lat = maxLat;

      if (overlay.options.suppressToolbar !== true) {
        this.toolbar.setLatLng(raised_point);
      }
    }
  },

  _removeOverlay: function () {
    var overlay = this._overlay,
      eventParents = overlay._eventParents;

    if (this._mode === 'lock') { return; }

    var choice = L.DomUtil.confirmDelete();
    if (!choice) { return; }

    this._removeToolbar();

    if (eventParents) {
      var eP = eventParents[Object.keys(eventParents)[0]];
      eP.removeLayer(overlay);
    } else {
      overlay._map.removeLayer(overlay);
    }
	},

	// compare this to using overlay zIndex
	_toggleOrder: function () {
    if (this._toggledImage) {
      this._toggledImage = false;
      this._overlay.bringToFront();
    } else {
      this._toggledImage = true;
      this._overlay.bringToBack();
    }
  },

  // Based on https://github.com/publiclab/mapknitter/blob/8d94132c81b3040ae0d0b4627e685ff75275b416/app/assets/javascripts/mapknitter/Map.js#L47-L82
  _getExport: function() {
    var map = this._overlay._map;
    var overlay = this._overlay;

    // make a new image
    var downloadable = new Image();

    downloadable.id = downloadable.id || 'tempId12345';
    $('body').append(downloadable);

    downloadable.onload = function onLoadDownloadableImage() {
      var height = downloadable.height,
        width = downloadable.width,
        nw = map.latLngToLayerPoint(overlay.getCorner(0)),
        ne = map.latLngToLayerPoint(overlay.getCorner(1)),
        sw = map.latLngToLayerPoint(overlay.getCorner(2)),
        se = map.latLngToLayerPoint(overlay.getCorner(3));

      // I think this is to move the image to the upper left corner,
      // jywarren: i think we may need these or the image goes off the edge of the canvas
      // jywarren: but these seem to break the distortion math...

      // jywarren: i think it should be rejiggered so it
      // finds the most negative values of x and y and then
      // adds those to all coordinates

      //nw.x -= nw.x;
      //ne.x -= nw.x;
      //se.x -= nw.x;
      //sw.x -= nw.x;

      //nw.y -= nw.y;
      //ne.y -= nw.y;
      //se.y -= nw.y;
      //sw.y -= nw.y;

      // run once warping is complete
      downloadable.onload = function() {
        $(downloadable).remove();
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

  toggleIsolate: function() {
    // this.isolated = !this.isolated;
    // if (this.isolated) {
    // 	$.each($L.images,function(i,img) {
    // 		img.hidden = false;
    // 		img.setOpacity(1);
    // 	});
    // } else {
    // 	$.each($L.images,function(i,img) {
    // 		img.hidden = true;
    // 		img.setOpacity(0);
    // 	});
    // }
    // this.hidden = false;
    // this.setOpacity(1);
  }
});
