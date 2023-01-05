let map;

(function() {
  map = L.map('map').setView([51.505, -0.09], 13);
  map.addGoogleMutant();

  map.whenReady(function() {
    img = L.distortableImageOverlay('example.jpg', {
      selected: true,
      tooltipText: 'Aerial map of NY', // hardcoded since it's for example purposes only
    }).addTo(map);

    // Wait until image is loaded before setting up DOM element listeners
    L.DomEvent.on(img.getElement(), 'load', function() {
      L.DomEvent.on(img, 'edit', function() { alert('edited'); });
      L.DomEvent.on(img.getElement(), 'mouseup touchend', function() { alert('edited'); });
    });
  });
})();
