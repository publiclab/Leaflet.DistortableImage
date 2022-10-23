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
      className: mode === 'lock' ? 'disabled' : 'subtoolbar-enabled',
    };

    this.subToolBar = options.subToolbar = new L.Toolbar2({
      actions: [OpacitiesBar100, OpacitiesBar80, OpacitiesBar60, OpacitiesBar40, OpacitiesBar20, OpacitiesBar0, Cancel],
    });
    // L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_toggleOpacity';

    // L.setOptions(this, options);
    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    console.log(this.subToolBar);
    console.log(this.subToolBar._ul.hidden);
    console.log(this._overlay.editing);
    (this.subToolBar._ul.hidden) ? this.subToolBar.disable() : this.subToolBar.enabled();
    (this.subToolBar._ul.hidden) ? this.subToolBar.hide() : this.subToolBar.show();

    // const edit = this._overlay.editing;
    // const link = this._link;

    // L.IconUtil.toggleXlink(link, 'opacities', 'opacity_empty');
    // L.IconUtil.toggleTitle(link, 'Make Image Transparent', 'Make Image Opaque');
    // edit._toggleOpacity();
  },
});

const OpacitiesBar0 = L.EditAction.extend({
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

const OpacitiesBar20 = L.EditAction.extend({
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

const OpacitiesBar40 = L.EditAction.extend({
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

const OpacitiesBar60 = L.EditAction.extend({
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

const OpacitiesBar80 = L.EditAction.extend({
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

const OpacitiesBar100 = L.EditAction.extend({
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

const Cancel = L.EditAction.extend({
  options: {
    toolbarIcon: {
      html: '&#10006;',
      tooltip: 'Cancel',
      className: 'leaflet-toolbar-icon-vertical',
      style: 'font-size:1.25rem;',
    },
  },

  addHooks() {
    this.disable();
    this.toolbar._hide();
  },
});
