L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.action_map = {};

L.EditAction = L.Toolbar2.Action.extend({
  options: {
    toolbarIcon: {
      svg: false,
      html: '',
      className: '',
      tooltip: ''
    }
  },

  initialize: function(map, overlay, options) {
    this._overlay = overlay;
    this._map = map;

    L.setOptions(this, options);
    L.Toolbar2.Action.prototype.initialize.call(this, options);

    this._injectIconSet();
  },

  _createIcon: function(toolbar, container, args) {
    var iconOptions = this.options.toolbarIcon;

    this.toolbar = toolbar;
    this._icon = L.DomUtil.create('li', '', container);
    this._link = L.DomUtil.create('a', '', this._icon);

    if (iconOptions.svg) {
      this._link.innerHTML = L.IconUtil.create(iconOptions.html);
    } else {
      this._link.innerHTML = iconOptions.html;
    }

    this._link.setAttribute('href', '#');
    this._link.setAttribute('title', iconOptions.tooltip);
    this._link.setAttribute('role', 'button');

    L.DomUtil.addClass(this._link, this.constructor.baseClass);
    if (iconOptions.className) {
      L.DomUtil.addClass(this._link, iconOptions.className);
    }

    L.DomEvent.on(this._link, 'click', this.enable, this);

    /* Add secondary toolbar */
    this._addSubToolbar(toolbar, this._icon, args);
  },

  _injectIconSet: function() {
    if (document.querySelector('#iconset')) {
      return;
    }

    var el = document.createElement('div');
    el.id = 'iconset';
    el.setAttribute('hidden', 'hidden');
    el.innerHTML = new L.ToolbarIconSet().render();

    document.querySelector('.leaflet-marker-pane').appendChild(el);
  }
});

L.editAction = function(map, overlay, options) {
  return new L.EditAction(map, overlay, options);
};