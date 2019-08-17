L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;
// L.DistortableImageOverlay.addInitHook(function () {
//   console.log(this.ACTIONS);
// });

L.DistortableImage.Keymapper = L.Handler.extend({

  options: {
    position: 'topright',
  },

  initialize: function(map, options) {
    this._map = map;
    this.action_map = L.DistortableImage.action_map;
    L.setOptions(this, options);
  },

  addHooks: function() {
    if (!this._keymapper) {
      this._container = this._buildContainer();
      this._scrollWrapper = this._wrap();
      this._toggler = this._createButton();
      this._setMapper(this._container, this._scrollWrapper, this._toggler);

      L.DomEvent.on(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomEvent.disableClickPropagation(this._container);
      L.DomEvent.disableScrollPropagation(this._container);
    }
  },

  removeHooks: function() {
    if (this._keymapper) {
      L.DomEvent.off(this._toggler, 'click', this._toggleKeymapper, this);

      L.DomUtil.remove(this._toggler);
      L.DomUtil.remove(this._scrollWrapper);
      L.DomUtil.remove(this._container);
      this._keymapper = false;
    }
  },

  _buildContainer: function() {
    var container = L.DomUtil.create('div', 'ldi-keymapper-hide');
    container.setAttribute('id', 'ldi-keymapper');

    var divider = L.DomUtil.create('br', 'divider');
    container.appendChild(divider);

    return container;
  },

  _createButton: function() {
    var toggler = L.DomUtil.create('a', '');
    toggler.innerHTML = L.IconUtil.create('keyboard_open');

    toggler.setAttribute('id', 'toggle-keymapper');
    toggler.setAttribute('href', '#');
    toggler.setAttribute('title', 'Show keymap');
    // Will force screen readers like VoiceOver to read this as "Show keymap - button"
    toggler.setAttribute('role', 'button');
    toggler.setAttribute('aria-label', 'Show keymap');

    return toggler;
  },

  _wrap: function() {
    var wrap = L.DomUtil.create('div', '');
    wrap.setAttribute('id', 'keymapper-wrapper');
    wrap.style.display = 'none';

    return wrap;
  },

  _setMapper: function(container, wrap, button) {
    this._keymapper = L.control({position: this.options.position});

    var actions = this.action_map;
    var action_map_str = '', buffer = '', val = '';
    for (var i = 0; i < Object.keys(actions).length; i++) {
      if (Object.values(actions)[i].slice(1, 4) === 'get') {
        val = 'Get' + Object.values(actions)[i].slice(4);
      }
      if (Object.values(actions)[i].slice(1, 7) === 'remove') {
        val = 'Remove' + Object.values(actions)[i].slice(7);
      }
      if (Object.values(actions)[i].slice(1, 7) === 'toggle') {
        val = 'Toggle' + Object.values(actions)[i].slice(7);
      }
      val = val.match(/[A-Z][a-z]+|[0-9]+/g).join(" ");
      if (Object.values(actions)[i] === Object.values(actions)[i + 1]) {
        buffer = '</kbd><kbd>' + Object.keys(actions)[i];
        continue;
      }
      action_map_str += '<tr><td><div class="left"><span>' +
        val + '</span></div><div class="right"><kbd>' +
        Object.keys(actions)[i] + buffer +
        '</kbd></div></td></tr>';
      buffer = '';
      val = '';
    }

    this._keymapper.onAdd = function() {
      container.appendChild(wrap);
      wrap.insertAdjacentHTML(
          'beforeend',
          '<table><tbody>' +
          '<hr id="keymapper-hr">' +
          /* eslint-disable */
          '<tr><td><div class="left"><span>Stack up / down</span></div><div class="right"><kbd>j</kbd>\xa0<kbd>k</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Lock Image</span></div><div class="right"><kbd>l</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Outline</span></div><div class="right"><kbd>o</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Scale</span></div><div class="right"><kbd>s</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Transparency</span></div><div class="right"><kbd>t</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>RotateScale</span></div><div class="right"><kbd>d</kbd>\xa0<kbd>r</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Deselect All</span></div><div class="right"><kbd>esc</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Delete Image</span></div><div class="right"><kbd>delete</kbd>\xa0<kbd>backspace</kbd></div></td></tr>' +
          '<tr><td><div class="left"><span>Rotate</span></div><div class="right"><kbd>caps</kbd></div></td></tr>' +
          '</tbody></table>'
      );
      /* eslint-enable */
      container.appendChild(button);
      return container;
    };

    this._keymapper.addTo(this._map);
  },

  _toggleKeymapper: function(e) {
    e.preventDefault();

    this._container.className = (
      this._container.className === 'ldi-keymapper leaflet-control' ?
        'ldi-keymapper-hide leaflet-control' :
        'ldi-keymapper leaflet-control'
    );

    this._scrollWrapper.style.display = (
      this._scrollWrapper.style.display === 'none' ? 'block' : 'none'
    );

    this._toggler.innerHTML = (
      this._toggler.innerHTML === 'close' ?
        L.IconUtil.create('keyboard_open') :
        'close'
    );

    L.IconUtil.toggleTitle(this._toggler, 'Show keymap', 'Hide keymap');
    L.DomUtil.toggleClass(this._toggler, 'close-icon');
  },

  _injectIconSet: function() {
    if (document.querySelector('#keymapper-iconset')) { return; }

    var el = L.DomUtil.create('div', '');
    el.id = 'keymapper-iconset';
    el.setAttribute('hidden', 'hidden');

    this._iconset = new L.KeymapperIconSet().render();
    el.innerHTML = this._iconset;

    document.querySelector('.leaflet-control-container').appendChild(el);
  },
});

L.DistortableImage.Keymapper.addInitHook(function() {
  L.DistortableImage.Keymapper.prototype._n = (
    L.DistortableImage.Keymapper.prototype._n ?
    L.DistortableImage.Keymapper.prototype._n + 1 :
    1
  );
  // dont enable keymapper for mobile
  if (L.DistortableImage.Keymapper.prototype._n === 1 && !L.Browser.mobile) {
    this.enable();
    this._injectIconSet();
  }
});

L.distortableImage.keymapper = function(map, options) {
  return new L.DistortableImage.Keymapper(map, options);
};
