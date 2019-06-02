L.DomUtil = L.DomUtil || {};
L.DistortableImage = L.DistortableImage || {};

L.DistortableImage.Keymapper = L.Control.extend({
    initialize: function(options) {
        L.Control.prototype.initialize.call(this, options);
    },
    
    onAdd: function() {
        var el_wrapper = L.DomUtil.create("div", "l-container");
        el_wrapper.innerHTML =
          "<table><tbody>" +
            "<tr><th>Keymappings</th></tr>" +
            "<tr><td><kbd>t</kbd>: <span>Transparency</span></td></tr>" +
            "<tr><td><kbd>o</kbd>: <span>Outline</span></td></tr>" +
            "<tr><td><kbd>l</kbd>: <span>Lock</span></td></tr>" +
            "<tr><td><kbd>caps</kbd>: <span>Rotate</span></td></tr>" +
            "<tr><td><kbd>s</kbd>: <span>Scale</span></td></tr>" +
            "<tr><td><kbd>d</kbd>: <span>Distort</span> </td></tr>" +
            "<tr><td><kbd>r</kbd>: <span>Rotate+Scale</span> </td></tr>" +
            "<tr><td><kbd>j</kbd>, <kbd>k</kbd>: <span>Stack up / down</span></td></tr>" +
            "<tr><td><kbd>esc</kbd>: <span>Deselect All</span></td></tr>" +
            "<tr><td><kbd>delete</kbd> , <kbd>backspace</kbd>: <span>Delete</span></td></tr>" +
          "</tbody></table>";
        return el_wrapper;
    }
});