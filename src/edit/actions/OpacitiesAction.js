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
      actions: [OpacitiesBar, Cancel],
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


var ImmediateSubAction = L.Toolbar2.Action.extend({
  initialize(map, myAction) {
    map = map;
    myAction = myAction;

    L.Toolbar2.Action.prototype.initialize.call(this);
  },
  addHooks() {
    this.myAction.disable();
  },
});

var OpacitiesBar = ImmediateSubAction.extend({
  options: {
    toolbarIcon: {
      html: '<input type="range" orient="vertical" min="0" max="100" step="10"/>',
      tooltip: 'Go to the Eiffel Tower',
      className: 'leaflet-toolbar-icon-vertical leaflet-toolbar-icon-range',
    },
  },
  addHooks: function() {
    this.map.setView([48.85815, 2.29420], 19);
    ImmediateSubAction.prototype.addHooks.call(this);
  },
});

var Cancel = ImmediateSubAction.extend({
  options: {
    toolbarIcon: {
      html: '<i class="fa fa-times"></i>',
      tooltip: 'Cancel',
    },
  },
});
