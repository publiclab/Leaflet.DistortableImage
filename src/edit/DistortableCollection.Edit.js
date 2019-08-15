L.DistortableImage = L.DistortableImage || {};

/** this class holds keybindings and our toolbar API */
L.DistortableCollection.Edit = L.Handler.extend({
  options: {
    keymap: {
      Backspace: '_removeGroup', // backspace windows / delete mac
      Escape: '_deselectAll',
      l: '_lockGroup',
      u: '_unlockGroup'
    }
  },

  initialize: function(group, options) {
    this._group = group;
    L.setOptions(this, options); 
  },

  addHooks: function() {
    var group = this._group,
        map = group._map;

    this.editActions = this.options.actions;

    L.DomEvent.on(document, 'keydown', this._onKeyDown, this);
    
    L.DomEvent.on(map, {
      click: this._deselectAll,
      boxzoomend: this._addSelections
    }, this);

    this._group.editable = true;
    this._group.eachLayer(function(layer) {
      layer.editing.enable();
    });
  },

  removeHooks: function() {
    var group = this._group,
        map = group._map;

    L.DomEvent.off(document, 'keydown', this._onKeyDown, this);

    L.DomEvent.off(map, {
      click: this._deselectAll,
      boxzoomend: this._addSelections
    }, this);

    this._deselectAll();
    this._group.editable = false;
    this._group.eachLayer(function(layer) {
      layer.editing.disable();
    });
  },

  enable: function () {
    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable: function () {
    this._enabled = false;
    this.removeHooks();

    return this;
  },

  _onKeyDown: function(e) {
    var keymap = this.options.keymap,
        handlerName = keymap[e.key];

    if (!this[handlerName]) { return; }

    this._group.eachLayer(function(layer) {
      if (this._group.isSelected(layer)) {
        this[handlerName].call(this);
      }
    }, this);
  },

  _deselectAll: function(e) {
    var oe;
      
    if (e) { oe = e.originalEvent; }
    /** 
     * prevents image deselection following the 'boxzoomend' event - note 'shift' must not be released until dragging is complete
     * also prevents deselection following a click on a disabled img by differentiating it from the map
     */
    if (oe && (oe.shiftKey || oe.target instanceof HTMLImageElement)) { return; }
  
    this._group.eachLayer(function(layer) {
      var edit = layer.editing;
      L.DomUtil.removeClass(layer.getElement(), 'selected');
      edit._deselect();
    });

    this._removeToolbar();

    if (e) { L.DomEvent.stopPropagation(e); }
  },

   _unlockGroup: function() {
    var map = this._group._map;

    this._group.eachLayer(function (layer) {
      if (this._group.isSelected(layer)) {
        var edit = layer.editing;
        if (edit._mode === 'lock') { 
          map.removeLayer(edit._handles[edit._mode]); 
          edit._unlock();
          edit._refreshPopupIcons();
        }
      }
    }, this);
  },

  _lockGroup: function() {
    var map = this._group._map;

    this._group.eachLayer(function (layer) {
      if (this._group.isSelected(layer) ) {
        var edit = layer.editing;
        if (edit._mode !== 'lock') {
          edit._lock();
          map.addLayer(edit._handles[edit._mode]);
          edit._refreshPopupIcons();
          // map.addLayer also deselects the image, so we reselect here
          L.DomUtil.addClass(layer.getElement(), 'selected');
        }
      }
    }, this);
  },

  _addSelections: function(e) {
    var box = e.boxZoomBounds,
        map = this._group._map;

    this._group.eachLayer(function(layer) {
      var edit = layer.editing;
      if (edit._selected) {
        edit._deselect();
      }

      var imgBounds = L.latLngBounds(layer.getCorner(2), layer.getCorner(1));
      imgBounds = map._latLngBoundsToNewLayerBounds(imgBounds, map.getZoom(), map.getCenter());
      if (box.intersects(imgBounds)) {
        if (!this.toolbar) {
          this._addToolbar();
        }
        L.DomUtil.addClass(layer.getElement(), 'selected');
      }
    }, this);
  },
  
  _removeGroup: function(e) {
    var layersToRemove = this._group._toRemove(),
        n = layersToRemove.length;

    if (n === 0) { return; }
    var choice = L.DomUtil.confirmDeletes(n);

    if (choice) {
      layersToRemove.forEach(function(layer) {
        this._group.removeLayer(layer);
      }, this);
      this._removeToolbar();
    }

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  _addToolbar: function() {
    var map = this._group._map;

    try {
      if (!this.toolbar) {
        this.toolbar = L.distortableImage.controlBar({
          actions: this.editActions,
          position: 'topleft'
        }).addTo(map, this);
        this.fire('toolbar:created');
      }
    } catch (e) { }
  },

  _removeToolbar: function() {
    var map = this._group._map;

    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    } else {
      return false;
    }
  },

  hasTool: function(value) {
    return this.editActions.some(function(action) {
      return action === value;
    });
  },

  addTool: function(value) {
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
    } else {
      return false; 
    }
  },

  removeTool: function(value) {
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
});
