L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.Keymapper = L.Handler.extend({
  initialize: function (map, image, params) {
    this._map = map;
    this._image = image;
    this._params = params || {};
    this._position = this._params.position || 'topright';
    this._setMapper();
    window.keymapper_instances = window.keymapper_instances ? window.keymapper_instances + 1 : 1;
    this._instancesCheck(window.keymapper_instances);
    this._keymapper = L.control({ position: this._position });

    this._injectIconSet();
  },

  addHooks: function () {
    this.enable();
   },

  removeHooks: function () { 
    this.disable();
  },

  enable: function () {
    if (!this._keymapper) { this._setMapper(); }
  },

  disable: function () {  
    if (this._keymapper) {
     L.DomUtil.remove(this._keymapper._container);
     this._keymapper = false;
    } 
  },

  _createToggler: function () {
    this._toggler = L.DomUtil.create('button');
    this._toggler.setAttribute('id', 'toggle-keymapper');
    this._toggler.innerHTML = L.IconUtil.create("keyboard_open");
    L.DomEvent.on(this._toggler, 'click', this._toggleKeymapper, this);
    return this._toggler;
  },
  
  _setMapper: function () {
    var button = this._createToggler();
    this._keymapper = L.control({ position: this._position });
    this._container = this._keymapper.onAdd = function () {
      var el_wrapper = L.DomUtil.create("div", "ldi-keymapper-hide");
      el_wrapper.setAttribute('id', 'ldi-keymapper');
      el_wrapper.appendChild(button);
      el_wrapper.insertAdjacentHTML('beforeend', 
        '<div id="keymapper-wrapper" style="display:none">' +
        '<table><tbody>' +
        "<tr><td><center><span id='keymapper-heading'>Keymappings</span></center></td></tr>" +
        "<tr><td id='keymapper-hr'><hr></td></tr>" +
        '<tr><td><kbd>j</kbd>, <kbd>k</kbd>: <span>Stack up / down</span></td></tr>' +
        '<tr><td><kbd>l</kbd>: <span>Lock</span></td></tr>' +
        '<tr><td><kbd>o</kbd>: <span>Outline</span></td></tr>' +
        '<tr><td><kbd>s</kbd>: <span>Scale</span></td></tr>' +
        '<tr><td><kbd>t</kbd>: <span>Transparency</span></td></tr>' +
        '<tr><td><kbd>d</kbd> , <kbd>r</kbd>: <span>RotateScale</span> </td></tr>' +
        '<tr><td><kbd>esc</kbd>: <span>Deselect All</span></td></tr>' +
        '<tr><td><kbd>delete</kbd> , <kbd>backspace</kbd>: <span>Delete</span></td></tr>' +
        '<tr><td><kbd>caps</kbd>: <span>Rotate</span></td></tr>' +
        '</div>' +
        '</tbody></table>');
      return el_wrapper;
    };
    this._keymapper.addTo(this._map);
  },

  _toggleKeymapper: function (e) {
    L.DomEvent.stop(e);
      var container = document.getElementById('ldi-keymapper');
      var xlink = document.querySelector("#toggle-keymapper > svg > use:nth-child(1)");
      var keymapWrap = document.getElementById('keymapper-wrapper');

      var newClass = container.className === 'ldi-keymapper leaflet-control' ? 'ldi-keymapper-hide leaflet-control' : 'ldi-keymapper leaflet-control';
      var newXlink = xlink.getAttribute('xlink:href') === "#keyboard_open" ? "#arrow_collapse" : "#keyboard_open";
      var newStyle = keymapWrap.style.display === 'none' ? 'block' : 'none';

      container.className = newClass;
      xlink.setAttribute('xlink:href', newXlink);
      keymapWrap.style.display = newStyle;
  },

  _injectIconSet: function() {
    if (document.querySelector('#keymapper-iconset')) { return; }

    var el = document.createElement('div');
    el.id = 'keymapper-iconset';
    el.setAttribute('hidden', 'hidden');

    this._iconset = new L.KeymapperIconSet().render();
    el.innerHTML = this._iconset;

    document.querySelector('.leaflet-control-container').appendChild(el);
  }
});

L.distortableImage.keymapper = function (options) {
  return new L.DistortableImage.Keymapper(options);
};
