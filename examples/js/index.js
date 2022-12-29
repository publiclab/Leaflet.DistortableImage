let map;

(function() {
  map = L.map('map').setView([51.505, -0.09], 13);
  map.addGoogleMutant();

  map.whenReady(function() {
    img = L.distortableImageOverlay('example.jpg', {
      selected: true,
      fullResolutionSrc: 'large.jpg',
      tooltipText: 'Aerial map of NY', // is it actually New York?? ...hardcoded into place since it's for example purposes only
    }).addTo(map);
  });
})();

L.Control.geocoder().addTo(map);
