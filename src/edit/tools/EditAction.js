L.EditAction = L.Toolbar2.Action.extend({

  options: {
    toolbarIcon: {
      svg: false,
      html: '',
      className: '',
      tooltip: ''
    },
  },

  initialize: function(map, overlay, options) {
    this._overlay = overlay;
    this._map = map;

    L.setOptions(this, options);
    L.Toolbar2.Action.prototype.initialize.call(this, options);
  },

  toggleXlink: function(ref1, ref2) {
    var href1 = "#" + ref1,
        href2 = "#" + ref2;

    if (this._link.querySelector('use')) {
      var xlink = this._link.querySelector('use:nth-child(1)');
      var newXlink = xlink.getAttribute('xlink:href') === href1 ?  href2 : href1;
      xlink.setAttribute('xlink:href', newXlink);
      return newXlink;
    }
    return false;
  },

  toggleTooltip: function(title1, title2) {
    var newTt = this._link.getAttribute('title') === title1 ? title2 : title1;
    this._link.setAttribute('title', newTt);
    return newTt;
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
    if (document.querySelector('#iconset')) { return; }

    var el = document.createElement('div');
    el.id = 'iconset';
    el.setAttribute('hidden', 'hidden');
    el.innerHTML = new L.ToolbarIconSet().render();

    document.querySelector('.leaflet-marker-pane').appendChild(el);
  }
});

L.EditAction.addInitHook(function() {
  this._injectIconSet();
});
