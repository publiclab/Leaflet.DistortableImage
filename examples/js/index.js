const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="top"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
let map;

(function() {
  map = L.map('map').setView([51.505, -0.09], 13);
  map.addGoogleMutant();

  map.whenReady(function() {
    img = L.distortableImageOverlay('example.jpg', {
      selected: true,
      fullResolutionSrc: 'large.jpg',
    }).addTo(map);
  });
})();

L.Control.geocoder().addTo(map);
