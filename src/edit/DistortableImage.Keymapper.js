L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};
L.distortableImage = L.DistortableImage;

L.DistortableImage.Keymapper = L.Handler.extend({
  initialize: function (map, params) {
    this._map = map;
    this._params = params || {};
    this._position = this._params.position || 'topright';
    this._setMapper();
    window.keymapper_instances = window.keymapper_instances ? window.keymapper_instances + 1 : 1;
    this._instancesCheck(window.keymapper_instances);
  },

  _instancesCheck: function (len) { 
    var instances_len = len; 
    if (instances_len > 1) { 
      this._disableAllButOne();
      console.warn("Only single keymapper instance declaration is allowed!");
    }
  },
  
  disable: function () {    
    var el = document.getElementById('l-container');
    el.parentNode.removeChild(el);
  },

  _disableAllButOne: function () { 
    var generated_instances_array = Array.from(document.querySelectorAll('#l-container'));
    for (var i = 0; i < generated_instances_array.length-1; i++) { 
      generated_instances_array[i].parentNode.removeChild(generated_instances_array[i]);
    }
  },
  
  _setMapper: function () {
    this._keymapper = L.control({ position: this._position });
    this._keymapper.onAdd = function () {
      var el_wrapper = L.DomUtil.create("div", "l-container-hide");
      el_wrapper.setAttribute('id', 'l-container');
      el_wrapper.innerHTML =
        "<button id='toggle-keymapper'>" +
        '<svg>' +
        '<use xlink:href="#keyboard-open"></use>' +
        '<symbol viewBox="0 0 25 25" id="keyboard-open" xmlns="http://www.w3.org/2000/svg"><path d="M12 23l4-4H8l4 4zm7-15h-2V6h2v2zm0 3h-2V9h2v2zm-3-3h-2V6h2v2zm0 3h-2V9h2v2zm0 4H8v-2h8v2zM7 8H5V6h2v2zm0 3H5V9h2v2zm1-2h2v2H8V9zm0-3h2v2H8V6zm3 3h2v2h-2V9zm0-3h2v2h-2V6zm9-3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></symbol>' +
        '<symbol viewBox="0 0 20 20" id="arrow-collapse" xmlns="http://www.w3.org/2000/svg"><path d="M2.6 19l4.5-4.5v3.6h2v-7h-7v2h3.6l-4.5 4.5L2.6 19zm15.5-9.9v-2h-3.6L19 2.6l-1.4-1.4-4.5 4.5V2.1h-2v7h7z"/></symbol>' +
        '</svg>' +
        '</button>' +
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
        '</tbody></table>';
      return el_wrapper;
    };
    this._keymapper.addTo(this._map);
  }
});

window.onload = function () {
  if (document.getElementById('l-container')) {
    document.getElementById('toggle-keymapper').addEventListener('click', function (e) {
      L.DomEvent.stop(e);
      var container = document.getElementById('l-container');
      var xlink = document.querySelector("#toggle-keymapper > svg > use:nth-child(1)");
      var keymapWrap = document.getElementById('keymapper-wrapper');

      var newClass = container.className === 'l-container leaflet-control' ? 'l-container-hide leaflet-control' : 'l-container leaflet-control';
      var newXlink = xlink.getAttribute('xlink:href') === "#arrow-collapse" ? "#keyboard-open" : "#arrow-collapse";
      var newStyle = keymapWrap.style.display === 'none' ? 'block' : 'none';

      container.className = newClass;
      xlink.setAttribute('xlink:href', newXlink);
      keymapWrap.style.display = newStyle;
    });
  }};

L.distortableImage.keymapper = function (options) {
  return new L.DistortableImage.Keymapper(options);
};
