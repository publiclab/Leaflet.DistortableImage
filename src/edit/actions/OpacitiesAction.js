let opacities = [100, 80, 60, 40, 20, 0]; // Set numeric values from 0 to 100.

opacities = opacities.map((o) => {
  (isNaN(o) || o > 100) ? o = 100 : o;
  (o < 0) ? o = 0 : o;

  return L.EditAction.extend({
    options: {
      toolbarIcon: {
        html: '',
        tooltip: 'Opacity ' + o +'%',
        className: 'leaflet-toolbar-icon-vertical',
        style: 'color:#000; background-color:rgb(' + (100 - o) + '%,' + (100 - o) + '%,' + (100 - o) + '%); opacity:1;',
      },
    },
    addHooks() {
      this._overlay.editing._setOpacities(o/100);
    },
  });
});

console.log(opacities);

L.OpacitiesAction = L.EditAction.extend({
  initialize(map, overlay, options) {
    const edit = overlay.editing;
    const mode = edit._mode;

    options = options || {};
    options.toolbarIcon = {
      svg: true,
      html: 'opacities',
      tooltip: 'Set custom opacity',
      className: mode === 'lock' ? 'disabled' : '',
    };

    options.subToolbar = new L.Toolbar2({
      actions: opacities,
    });

    L.DistortableImage.action_map.o = mode === 'lock' ? '' : '_toggleOpacities';

    L.EditAction.prototype.initialize.call(this, map, overlay, options);
  },

  addHooks() {
    const link = this._link;
    if (L.DomUtil.hasClass(link, 'subtoolbar_enabled')) {
      L.DomUtil.removeClass(link, 'subtoolbar_enabled');
      setTimeout(() => {
        this.options.subToolbar._hide();
      }, 100);
    } else {
      L.DomUtil.addClass(link, 'subtoolbar_enabled');
    };

    L.IconUtil.toggleXlink(link, 'opacities', 'cancel');
    L.IconUtil.toggleTitle(link, 'Make Image Transparent', 'Cancel');
  },
});
