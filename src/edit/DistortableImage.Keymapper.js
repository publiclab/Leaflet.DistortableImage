L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Keymapper = L.Handler.extend({
    initialize: function(map, image, params) {
        this._map = map;
        this._image = image;
        this._params = params || {};
        this._position = this._params.position || 'topright';
    },
    addHooks: function() {
        L.DomEvent.on(this._image, "load", this._setMapper, this);
    },
    removeHooks: function() {
        L.DomEvent.off(this._image, "load", this._setMapper, this);
    },
    _setMapper: function() {
        var keymapper = L.control({position: this._position});
        keymapper.onAdd = function() {
            var el_wrapper = L.DomUtil.create("div", "l-container");
            el_wrapper.innerHTML = "<table><tbody>" +
            "<tr><th>Keymappings</th></tr>" +
            "<tr><td><kbd>j</kbd>, <kbd>k</kbd>: <span>Send up / down</span></td></tr>" +
            "<tr><td><kbd>l</kbd>: <span>Lock</span></td></tr>" +
            "<tr><td><kbd>o</kbd>: <span>Outline</span></td></tr>" +
            "<tr><td><kbd>s</kbd>: <span>Scale</span></td></tr>" +
            "<tr><td><kbd>t</kbd>: <span>Transparency</span></td></tr>" +
            "<tr><td><kbd>d</kbd> , <kbd>r</kbd>: <span>RotateScale</span> </td></tr>" +
            "<tr><td><kbd>esc</kbd>: <span>Deselect All</span></td></tr>" +
            "<tr><td><kbd>delete</kbd> , <kbd>backspace</kbd>: <span>Delete</span></td></tr>" +
            "<tr><td><kbd>caps</kbd>: <span>Rotate</span></td></tr>" +
            "</tbody></table>";
            return el_wrapper;
        };
        keymapper.addTo(this._map);
    }
});