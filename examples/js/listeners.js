let map;

(function() {
  map = L.map('map').setView([51.505, -0.09], 13);
  map.addGoogleMutant();

  map.whenReady(function() {
    img = L.distortableImageOverlay('example.jpg', {
      selected: true,
    }).addTo(map);

    // Wait until image is loaded before setting up DOM element listeners
    L.DomEvent.on(img.getElement(), 'load', function() {
      L.DomEvent.on(img, 'edit', function() { alert('edited'); });
      L.DomEvent.on(img.getElement(), 'mouseup touchend', function() { alert('edited'); });
    });
  });
})();
