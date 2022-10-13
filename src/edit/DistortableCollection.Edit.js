L.DistortableImage = L.DistortableImage || {};

// this class holds the keybindings and toolbar API for an image collection instance
L.DistortableCollection.Edit = L.Handler.extend({
  options: {
    keymap: L.distortableImage.group_action_map,
  },

  initialize(group, options) {
    this._group = group;
    this._exportOpts = group.options.exportOpts;

    L.setOptions(this, options);

    L.distortableImage.group_action_map.Escape = '_decollectAll';
  },

  addHooks() {
    const group = this._group;
    const map = group._map;

    this.editActions = this.options.actions;
    this.runExporter =
        L.bind(L.Utils.getNestedVal(this, '_exportOpts', 'exporter') ||
        this.startExport, this);

    L.DomEvent.on(document, 'keydown', this._onKeyDown, this);

    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.on(map, 'click', this._decollectAll, this);
    }

    L.DomEvent.on(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
      boxcollectend: this._addCollections,
    }, this);

    this._group.editable = true;
    this._group.eachLayer(layer => layer.editing.enable());
  },

  removeHooks() {
    const group = this._group;
    const map = group._map;

    L.DomEvent.off(document, 'keydown', this._onKeyDown, this);

    if (!(map.doubleClickZoom.enabled() || map.doubleClickLabels.enabled())) {
      L.DomEvent.off(map, 'click', this._decollectAll, this);
    }

    L.DomEvent.off(map, {
      singleclickon: this._singleClickListeners,
      singleclickoff: this._resetClickListeners,
      singleclick: this._singleClick,
      boxcollectend: this._addCollections,
    }, this);

    this._decollectAll();
    this._group.editable = false;
    this._group.eachLayer(layer => layer.editing.disable());
  },

  enable() {
    this._enabled = true;
    this.addHooks();
    return this;
  },

  disable() {
    this._enabled = false;
    this.removeHooks();
    return this;
  },

  _onKeyDown(e) {
    const keymap = this.options.keymap;
    const handlerName = keymap[e.key];

    if (!this[handlerName]) { return; }

    if (this._group.anyCollected()) {
      this[handlerName].call(this);
    }
  },

  _singleClick(e) {
    if (e.type === 'singleclick') { this._decollectAll(e); }
    else { return; }
  },

  _singleClickListeners() {
    const map = this._group._map;
    L.DomEvent.off(map, 'click', this._decollectAll, this);
    L.DomEvent.on(map, 'singleclick', this._decollectAll, this);
  },

  _resetClickListeners() {
    const map = this._group._map;
    L.DomEvent.on(map, 'click', this._decollectAll, this);
    L.DomEvent.off(map, 'singleclick', this._decollectAll, this);
  },

  _decollectAll(e) {
    let oe;

    if (e) { oe = e.originalEvent; }
    /**
     * prevents image deselection following the 'boxcollectend' event - note 'shift' must not be released until dragging is complete
     * also prevents deselection following a click on a disabled img by differentiating it from the map
     */
    if (oe && (oe.shiftKey || oe.target instanceof HTMLImageElement)) {
      return;
    }

    this._group.eachLayer((layer) => {
      L.DomUtil.removeClass(layer.getElement(), 'collected');
      layer.deselect();
    });

    this._removeToolbar();

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  _unlockGroup() {
    if (!this.hasTool(L.UnlockAction)) { return; }

    this._group.eachLayer((layer) => {
      if (this._group.isCollected(layer)) {
        const edit = layer.editing;
        edit._unlock();
        // unlock updates the layer's handles; deselect to ensure they're hidden
        layer.deselect();
      }
    });
  },

  _lockGroup() {
    if (!this.hasTool(L.LockAction)) { return; }

    this._group.eachLayer((layer) => {
      if (this._group.isCollected(layer) ) {
        const edit = layer.editing;
        edit._lock();
        // map.addLayer also deselects the image, so we reselect here
        L.DomUtil.addClass(layer.getElement(), 'collected');
      }
    });
  },

  _addCollections(e) {
    const box = e.boxCollectBounds;
    const map = this._group._map;

    this._group.eachLayer((layer) => {
      const edit = layer.editing;

      if (layer.isSelected()) { layer.deselect(); }

      const zoom = map.getZoom();
      const center = map.getCenter();
      let imgBounds = L.latLngBounds(layer.getCorner(2), layer.getCorner(1));

      imgBounds = map._latLngBoundsToNewLayerBounds(imgBounds, zoom, center);
      if (box.intersects(imgBounds) && edit.enabled()) {
        if (!this.toolbar) { this._addToolbar(); }
        L.DomUtil.addClass(layer.getElement(), 'collected');
      }
    });
  },

  _removeGroup(e) {
    if (!this.hasTool(L.DeleteAction)) { return; }

    const layersToRemove = this._group._toRemove();
    const n = layersToRemove.length;

    if (n === 0) { return; }

    const choice = L.DomUtil.confirmDeletes(n);

    if (choice) {
      layersToRemove.forEach((layer) => {
        this._group.removeLayer(layer);
      });
      if (!this._group.anyCollected()) {
        this._removeToolbar();
      }
    }

    if (e) { L.DomEvent.stopPropagation(e); }
  },

  cancelExport() {
    if (!this.customCollection) {
      this._exportOpts.collection = undefined;
    }

    clearInterval(this.updateInterval);
  },

  _addToolbar() {
    const group = this._group;
    const map = group._map;

    if (group.options.suppressToolbar || this.toolbar) { return; }

    this.toolbar = L.distortableImage.controlBar({
      actions: this.editActions,
      position: 'topleft',
    }).addTo(map, group);
  },

  _removeToolbar() {
    const map = this._group._map;
    if (this.toolbar) {
      map.removeLayer(this.toolbar);
      this.toolbar = false;
    } else {
      return false;
    }
  },

  hasTool(value) {
    return this.editActions.some(action => action === value);
  },

  addTool(value) {
    if (value.baseClass === 'leaflet-toolbar-icon' && !this.hasTool(value)) {
      this._removeToolbar();
      this.editActions.push(value);
      this._addToolbar();
    }
    return this;
  },

  removeTool(value) {
    this.editActions.some((item, idx) => {
      if (this.editActions[idx] === value) {
        this._removeToolbar();
        this.editActions.splice(idx, 1);
        this._addToolbar();
        return true;
      } else {
        return false;
      }
    });
    return this;
  },

  startExport() {
    if (!this.hasTool(L.ExportAction)) { return; }

    return new Promise((resolve) => {
      const opts = this._exportOpts;
      opts.resolve = resolve; // allow resolving promise in user-defined functions, to stop spinner on completion

      let statusUrl;
      this.updateInterval = null;

      // this may be overridden to update the UI to show export progress or completion
      const _defaultUpdater = (data) => {
        data = JSON.parse(data);
        // optimization: fetch status directly from google storage:
        if (data.status_url) {
          if (statusUrl !== data.status_url && data.status_url.match('.json')) {
            // if (data.status_url && data.status_url.substr(0,1) === "/") {
            //   opts.statusUrl = opts.statusUrl + data.status_url;
            // } else {
            statusUrl = data.status_url;
            // }
          }

          if (data.status === 'complete') {
            clearInterval(this.updateInterval);

            if (!this.customCollection) {
              this._exportOpts.collection = undefined;
            }

            resolve();
            if (data.jpg !== null) {
              alert('Export succeeded. ' + opts.exportUrl + data.jpg);
            }
          }

          // TODO: update to clearInterval when status == "failed" if we update that in this file:
          // https://github.com/publiclab/mapknitter-exporter/blob/main/lib/mapknitterExporter.rb
          console.log(data);
        }
      };

      // receives the URL of status.json, and starts running the updater to repeatedly fetch from status.json;
      // this may be overridden to integrate with any UI
      const _defaultHandleStatusRes = (data) => {
        statusUrl = opts.statusUrl + data;
        // repeatedly fetch the status.json
        this.updateInterval = setInterval(() => {
          const reqOpts = {method: 'GET'};
          const req = new Request(`${statusUrl}?${Date.now()}`, reqOpts);
          fetch(req).then((res) => {
            if (res.ok) {
              return res.text();
            }
          }).then(opts.updater);
        }, opts.frequency);
      };

      // initiate the export
      const _defaultFetchStatusUrl = (mergedOpts) => {
        const form = new FormData();
        form.append('collection', JSON.stringify(mergedOpts.collection));
        form.append('scale', mergedOpts.scale);
        form.append('upload', true);

        const reqOpts = {method: 'POST', body: form};
        const req = new Request(mergedOpts.exportStartUrl, reqOpts);
        fetch(req).then((res) => {
          if (res.ok) {
            return res.text();
          }
        }).then(mergedOpts.handleStatusRes);
      };

      // If the user has passed collection property
      this.customCollection = !!opts.collection;
      if (!this.customCollection) {
        opts.collection = this._group.generateExportJson().images;
      }

      opts.frequency = opts.frequency || 3000;
      opts.scale = opts.scale || 100; // switch it to _getAvgCmPerPixel !
      opts.updater = opts.updater || _defaultUpdater;
      opts.handleStatusRes = opts.handleStatusRes || _defaultHandleStatusRes;
      opts.fetchStatusUrl = opts.fetchStatusUrl || _defaultFetchStatusUrl;

      opts.fetchStatusUrl(opts);
    });
  },
});

L.distortableCollection.edit = (group, options) => {
  return new L.DistortableCollection.Edit(group, options);
};
