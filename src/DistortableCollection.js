L.DistortableCollection = L.FeatureGroup.extend({
  options: {
    editable: true,
    // suppressToolbar: false,
  },

  initialize: function(options) {
    L.setOptions(this, options);
    L.FeatureGroup.prototype.initialize.call(this, options);

    this.editable = this.options.editable;
    // this.suppressToolbar = this.options.suppressToolbar;
  },

  onAdd: function(map) {
    L.FeatureGroup.prototype.onAdd.call(this, map);

    this._map = map;

    if (this.editable) { this.editing.enable(); }

    this._animHandles = L.layerGroup();
    this._layerCount = 0;

    /**
     * although we have a DistortableCollection.Edit class that handles collection events to keep our code managable,
     * events that need to be added on individual images are kept here to do so through `layeradd`.
     */
    this.on('layeradd', this._addEvents, this);
    this.on('layerremove', this._removeEvents, this);
  },

  onRemove: function() {
    if (this.editing) { this.editing.disable(); }

    this.off('layeradd', this._addEvents, this);
    this.off('layerremove', this._removeEvents, this);
  },

  _addEvents: function(e) {
    var layer = e.layer;

    L.DomEvent.on(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.on(layer._image, {
      mousedown: this._deselectOthers,
      /* Enable longpress for multi select for touch devices. */
      contextmenu: this._longPressMultiSelect,
    }, this);

    this._animHandles.addLayer(new L.MutationAnim(layer._image, this, this._layerCount));
    this._layerCount++;
  },

  _removeEvents: function(e) {
    var layer = e.layer;

    L.DomEvent.off(layer, {
      dragstart: this._dragStartMultiple,
      drag: this._dragMultiple,
    }, this);

    L.DomEvent.off(layer._image, {
      mousedown: this._deselectOthers,
      contextmenu: this._longPressMultiSelect,
    }, this);
  },

  _collect: function(layer) {
    var groupEdit = this.editing;
    var edit = layer.editing;
    var div = layer.getElement().parentNode;

    layer.deselect();
    if (edit.isMode('lock')) { edit._showMarkers(); }

    if (this.getCollected().length === 1) {
      groupEdit._mode = edit.isMode('lock') ? 'lock' : 'unlock';
      groupEdit._addToolbar();
      if (groupEdit.toolbar) {
        groupEdit.toolbar.clickTool(groupEdit._mode);
      }
      groupEdit._collectionOn(layer);
    } else {
      if (this._hasGroupMode()) {
        groupEdit._mode = this._allLayersLocked() ? 'lock' : 'unlock';
        if (groupEdit.toolbar) {
          groupEdit.toolbar.clickTool(groupEdit._mode);
        }
      } else { groupEdit._mode = ''; }
      L.DomUtil.removeClass(div, 'wrapcollect');
    }
    groupEdit._refresh();
  },

  _uncollect: function(layer) {
    var groupEdit = this.editing;
    var div = layer.getElement().parentNode;

    if (!this.anyCollected()) {
      groupEdit._mode = '';
      groupEdit._refresh();
      groupEdit._removeToolbar();
      groupEdit._collectionOff(layer);
    } else {
      layer.deselect();
      L.DomUtil.addClass(div, 'wrapcollect');
      if (this._hasGroupMode()) {
        groupEdit._mode = this._allLayersLocked() ? 'lock' : 'unlock';
        if (groupEdit.toolbar) {
          groupEdit.toolbar.clickTool(groupEdit._mode);
        }
      } else { groupEdit._mode = ''; }
      groupEdit._refresh();
    }
  },

  _longPressMultiSelect: function(e) {
    if (!this.editable) { return; }

    e.preventDefault();

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (layer.getElement() === e.target && edit.enabled()) {
        L.DomUtil.toggleClass(layer.getElement(), 'collected');
        if (L.DomUtil.hasClass(layer.getElement(), 'collected')) {
          this._collect(layer);
        } else {
          this._uncollect(layer);
        }
      }
    }, this);
  },

  isCollected: function(overlay) {
    return L.DomUtil.hasClass(overlay.getElement(), 'collected');
  },

  anyCollected: function() {
    var layerArr = this.getLayers();
    return layerArr.some(this.isCollected.bind(this));
  },

  getCollected: function() {
    var layerArr = this.getLayers();
    return layerArr.filter(this.isCollected.bind(this));
  },

  getNotCollectedLayers: function() {
    var layerArr = this.getLayers();
    return layerArr.filter(!this.isCollected.bind(this));
  },

  _toggleCollected: function(e) {
    if (!this.editable) { return; }

    this.eachLayer(function(layer) {
      var edit = layer.editing;
      if (e.target === layer.getElement() && edit.enabled()) {
        L.DomUtil.toggleClass(e.target, 'collected');
        if (L.DomUtil.hasClass(e.target, 'collected')) {
          this._collect(layer);
        } else {
          this._uncollect(layer);
        }
      }
    }, this);
  },

  _deselectOthers: function(e) {
    this.eachLayer(function(layer) {
      if (layer.getElement() !== e.target) { layer.deselect(); }
    });

    if (e.shiftKey) { this._toggleCollected(e); }
  },

  _otherSelected: function() {
    this.eachLayer(function(layer) {
      if (layer._collectedAnim) {
        return layer._collectedAnim.currentTime;
      }
    });
    return false;
  },

  _dragStartMultiple: function(e) {
    var overlay = e.target;
    var map = this._map;
    var i;

    if (!this.isCollected(overlay)) { return; }

    this.eachLayer(function(layer) {
      layer._dragStartPoints = {};
      layer.deselect();
      for (i = 0; i < 4; i++) {
        var c = layer.getCorner(i);
        layer._dragStartPoints[i] = map.latLngToLayerPoint(c);
      }
    });
  },

  _dragMultiple: function(e) {
    var overlay = e.target;
    var map = this._map;

    if (!this.isCollected(overlay)) { return; }

    var topLeft = map.latLngToLayerPoint(overlay.getCorner(0));
    var delta = overlay._dragStartPoints[0].subtract(topLeft);

    this._updateCollectionFromPoints(delta, overlay);
  },

  _toRemove: function() {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var mode = layer.editing.getMode();
      return (this.isCollected(layer) && mode !== 'lock');
    }, this);
  },

  _toMove: function(overlay) {
    var layerArr = this.getLayers();

    return layerArr.filter(function(layer) {
      var mode = layer.editing.getMode();
      return layer !== overlay && this.isCollected(layer) && mode !== 'lock';
    }, this);
  },

  _hasGroupMode: function() {
    return this._allLayersLocked() || this._allLayersNotLocked();
  },

  _allLayersLocked: function() {
    var layerArr = this.getCollected();

    return layerArr.every(function(layer) {
      return layer.editing.isMode('lock');
    });
  },

  _allLayersNotLocked: function() {
    var layerArr = this.getCollected();

    return layerArr.every(function(layer) {
      return !layer.editing.isMode('lock');
    });
  },

  _updateCollectionFromPoints: function(delta, overlay) {
    var layersToMove = this._toMove(overlay);
    var p = new L.Transformation(1, -delta.x, 1, -delta.y);
    var i;

    layersToMove.forEach(function(layer) {
      var movedPoints = {};
      for (i = 0; i < 4; i++) {
        movedPoints[i] = p.transform(layer._dragStartPoints[i]);
      }
      layer.setCornersFromPoints(movedPoints);
    });
  },

  _getAvgCmPerPixel: function(imgs) {
    var reduce = imgs.reduce(function(sum, img) {
      return sum + img.cm_per_pixel;
    }, 0);
    return reduce / imgs.length;
  },

  generateExportJson: function() {
    var json = {};
    json.images = [];

    this.eachLayer(function(layer) {
      if (this.isCollected(layer)) {
        var sections = layer._image.src.split('/');
        var filename = sections[sections.length-1];
        var zc = layer.getCorners();
        var corners = [
          {lat: zc[0].lat, lon: zc[0].lng},
          {lat: zc[1].lat, lon: zc[1].lng},
          {lat: zc[3].lat, lon: zc[3].lng},
          {lat: zc[2].lat, lon: zc[2].lng},
        ];
        json.images.push({
          id: this.getLayerId(layer),
          src: layer._image.src,
          width: layer._image.width,
          height: layer._image.height,
          image_file_name: filename,
          nodes: corners,
          cm_per_pixel: L.ImageUtil.getCmPerPixel(layer),
        });
      }
    }, this);

    json.images = json.images.reverse();
    json.avg_cm_per_pixel = this._getAvgCmPerPixel(json.images);

    return json;
  },
});

L.distortableCollection = function(id, options) {
  return new L.DistortableCollection(id, options);
};

