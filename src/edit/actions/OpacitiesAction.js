L.OpacitiesAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    const edit = overlay.editing;
    const mode = edit._mode;
    let use;
    let tooltip;

    if (edit._transparent) {
      use = 'opacity_empty';
      tooltip = overlay.options.translation.makeImageOpaque;
    } else {
      use = 'opacities';
      tooltip = overlay.options.translation.makeImageTransparent;
    }

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: use,
      tooltip: tooltip,
      className: mode === 'lock' ? 'disabled' : '',
    };

    options.subToolbar = new L.Toolbar2({
      actions: [OpacitiesBar100, OpacitiesBar80, OpacitiesBar60, OpacitiesBar40, OpacitiesBar20, OpacitiesBar0, Cancel],
    });

    // L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_toggleOpacity';

    // L.setOptions(this, options);
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    // const edit = this._overlay.editing;
    // const link = this._link;

    // L.IconUtil.toggleXlink(link, 'opacities', 'opacity_empty');
    // L.IconUtil.toggleTitle(link, 'Make Image Transparent', 'Make Image Opaque');
    // edit._toggleOpacity();
  },
});

var OpacitiesBar0 = L.EditAction.extend({
  options: {
    toolbarIcon: {
      html: '',
      tooltip: 'Opacity 0%',
      className: 'leaflet-toolbar-icon-vertical',
      style: 'background-color:#000; opacity:0.01;',
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    // OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar20 = L.EditAction.extend({
  options: {
    toolbarIcon: {
      html: '',
      tooltip: 'Opacity 20%',
      className: 'leaflet-toolbar-icon-vertical',
      style: 'background-color:#000; opacity:0.2;',
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    // OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar40 = L.EditAction.extend({
  options: {
    toolbarIcon: {
      html: '',
      tooltip: 'Opacity 40%',
      className: 'leaflet-toolbar-icon-vertical',
      style: 'background-color:#000; opacity:0.4;',
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    // OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar60 = L.EditAction.extend({
  options: {
    toolbarIcon: {
      html: '',
      tooltip: 'Opacity 60%',
      className: 'leaflet-toolbar-icon-vertical',
      style: 'background-color:#000; opacity:0.6;',
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    // OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar80 = L.EditAction.extend({
  options: {
    toolbarIcon: {
      html: '',
      tooltip: 'Opacity 80%',
      className: 'leaflet-toolbar-icon-vertical',
      style: 'background-color:#000; opacity:0.8;',
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    // OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar100 = L.EditAction.extend({
  options: {
    toolbarIcon: {
      html: '',
      tooltip: 'Opacity 100%',
      className: 'leaflet-toolbar-icon-vertical',
      style: 'background-color:#000; opacity:1;',
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    // OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var Cancel = L.EditAction.extend({
  initialize(map, overlay, options) {
    options = options || {};
    options.toolbarIcon = {
      svg: false,
      html: '&#10006;',
      tooltip: 'Cancel',
      className: 'leaflet-toolbar-icon-vertical',
    };

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks: () => {
    const overlay = this._overlay;
    console.warn(overlay);
    overlay.disable();
    this.disable();
  },
});
