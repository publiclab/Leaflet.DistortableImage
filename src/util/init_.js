function init_(paths) { // jshint ignore:line
    var map = L.map("map").setView([51.505, -0.09], 12);
    L.tileLayer(
      "https://{s}.tiles.mapbox.com/v3/anishshah101.ipm9j6em/{z}/{x}/{y}.png",
      {
        maxZoom: 18,
        id: "examples.map-i86knfo3"
      }
    ).addTo(map);
    
    var img1 = L.distortableImageOverlay(paths[0], {
      selected: true,
      corners: [
        L.latLng(51.52, -0.1),
        L.latLng(51.52, -0.14),
        L.latLng(51.5, -0.1),
        L.latLng(51.5, -0.14)
      ],
      fullResolutionSrc: "large.jpg"
    }).addTo(map);
    
    var img2 = L.distortableImageOverlay(paths[1], {
      selected: true,
      corners: [
        L.latLng(51.52, -0.14),
        L.latLng(51.52, -0.18),
        L.latLng(51.5, -0.14),
        L.latLng(51.5, -0.18)
      ],
      fullResolutionSrc: "large.jpg"
    }).addTo(map);
    // dyn!
    L.DomEvent.on(img1._image, "load", img1.editing.enable, img1.editing);
    L.DomEvent.on(img2._image, "load", img2.editing.enable, img2.editing);
    var L_img_array = [img1, img2];
    return {map: map, L_images: L_img_array};
  }
