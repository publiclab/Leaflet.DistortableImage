L.DistortableImage = L.DistortableImage || {};

var dom_string = 
"<table><tbody>" +
"<tr><th>Keymappings</th></tr>" +
"<tr><td><b>J/K: Order overlay</b></td></tr>" +
"<tr><td><b>L: Lock overlay</b></td></tr>" +
"<tr><td><b>O: Outline overlay</b></td></tr>" +
"<tr><td><b>S: Scale Overlay</b></td></tr>" +
"<tr><td><b>T: Toggle transparency</b></td></tr>" +
"<tr><td><b>RR: Distort overlay</b></td></tr>" +
"<tr><td><b>ESC: Deselect overlay</b></td></tr>" +
"<tr><td><b>DEL: Remove overlay</b></td></tr>" +
"<tr><td><b>CAPS: Rotate overlay</b></td></tr>" +
"</tbody></table>";

var guide_strings = [dom_string];

L.DistortableImage.Guides = guide_strings;
