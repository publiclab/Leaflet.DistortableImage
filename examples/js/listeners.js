let map;

(function() {
  map = L.map('map').setView([51.505, -0.09], 13);
  map.addGoogleMutant();

  // Create the overlay instance
  const img = L.distortableImageOverlay('example.jpg', {
    selected: true,
  });

  // FIX: Listen for the 'add' event on the layer itself.
  // This ensures the DOM element exists before you try to bind to it.
  img.on('add', function() {
    const element = img.getElement();
    
    if (element) {
      // Use Leaflet's internal event system for 'edit'
      img.on('edit', function() { alert('edited'); });

      // Bind DOM events safely
      L.DomEvent.on(element, 'mouseup touchend', function() { 
        alert('mouseup/touchend'); 
      });
    }
  });

  img.addTo(map);
})();