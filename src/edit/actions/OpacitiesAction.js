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
      actions: [OpacitiesBar100, OpacitiesBar80, OpacitiesBar60, OpacitiesBar40, OpacitiesBar20, OpacitiesBar1, Cancel],
    });

    // L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_toggleOpacity';

    L.setOptions(this, options);
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


var OpacitiesSubAction = L.Toolbar2.Action.extend({
  initialize(map, myAction) {
    map = map;
    myAction = myAction;

    L.Toolbar2.Action.prototype.initialize.call(this);
  },
  addHooks() {
    this.myAction.disable();
  },
});

var OpacitiesBar1 = OpacitiesSubAction.extend({
  opacity: 1,
  options: {
    toolbarIcon: {
      html: () => this.opacity,
      tooltip: () => 'Opacity ' + this.opacity + '%',
      className: 'leaflet-toolbar-icon-vertical',
      style: () => 'background-color:#000; opacity:' + this.opacity/100,
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar20 = OpacitiesSubAction.extend({
  opacity: 20,
  options: {
    toolbarIcon: {
      html: () => this.opacity,
      tooltip: () => 'Opacity ' + this.opacity + '%',
      className: 'leaflet-toolbar-icon-vertical',
      style: () => 'background-color:#000; opacity:' + this.opacity/100,
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar40 = OpacitiesSubAction.extend({
  opacity: 40,
  options: {
    toolbarIcon: {
      html: () => this.opacity,
      tooltip: () => 'Opacity ' + this.opacity + '%',
      className: 'leaflet-toolbar-icon-vertical',
      style: () => 'background-color:#000; opacity:' + this.opacity/100,
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar60 = OpacitiesSubAction.extend({
  opacity: 60,
  options: {
    toolbarIcon: {
      html: () => this.opacity,
      tooltip: () => 'Opacity ' + this.opacity + '%',
      className: 'leaflet-toolbar-icon-vertical',
      style: () => 'background-color:#000; opacity:' + this.opacity/100,
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar80 = OpacitiesSubAction.extend({
  opacity: 80,
  options: {
    toolbarIcon: {
      html: () => this.opacity,
      tooltip: () => 'Opacity ' + this.opacity + '%',
      className: 'leaflet-toolbar-icon-vertical',
      style: () => 'background-color:#000; opacity:' + this.opacity/100,
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var OpacitiesBar100 = OpacitiesSubAction.extend({
  opacity: 100,
  options: {
    toolbarIcon: {
      html: () => this.opacity,
      tooltip: () => 'Opacity ' + this.opacity + '%',
      className: 'leaflet-toolbar-icon-vertical',
      style: () => 'background-color:#000; opacity:' + this.opacity/100,
    },
  },
  addHooks: () => {
    // this.map.setView([48.85815, 2.29420], 19);
    OpacitiesSubAction.prototype.addHooks.call(this);
  },
});

var Cancel = OpacitiesSubAction.extend({
  options: {
    toolbarIcon: {
      html: '<i class="fa fa-times"></i>',
      tooltip: 'Cancel',
    },
  },
});
