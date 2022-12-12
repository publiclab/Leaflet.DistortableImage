const map;

(function () {

  var trd = [33, 0];

  map = L.map('map', {
    center: [33, 0],
    zoom: 2
  });

  var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>'
  }).addTo(map);

  img = L.distortableImageOverlay('../examples/example.jpg', {
    selected: true,
  });

  img2 = L.distortableImageOverlay('../examples/example.jpg', {
    selected: true,
  });

  imgGroup = L.distortableCollection().addTo(map);

  imgGroup.addLayer(img);
  imgGroup.addLayer(img2);

  const pane = map.getPane('overlayPane')

 const paneCorner = document.createElement('div');
  paneCorner.style.width = '12px';
  paneCorner.style.height = '12px';
  paneCorner.style.borderTop = '2px red solid';
  paneCorner.style.borderLeft = '2px red solid';

  pane.appendChild(paneCorner);

  const crsMarker = L.marker(map.unproject([0, 0]), {
    icon: L.divIcon({
      className: 'crsMarker',
      iconAnchor: [0, 0]
    })
  }).addTo(map);

 const imageOffsetLine = L.polyline([[0, 0], [0, 0]], { color: 'skyblue' }).addTo(map);

  function info() {
    var pixelOrigin = map.getPixelOrigin();
    var imagePixelCoords = map.project(trd, map.getZoom());
    var imageOffset = img._image._leaflet_pos;

    document.getElementById('info').innerHTML =
      '<div style="color: green">CRS origin: 0,0</div>' +
      '<div style="color: red">px origin: &Delta;' + pixelOrigin.x + ',' + pixelOrigin.y + '</div>' +
      '<div style="color: blue">image px coords:' + imagePixelCoords.x.toFixed(2) + ',' + imagePixelCoords.y.toFixed(2) + '</div>' +
      '<div style="color: skyblue">image pane offset: &Delta;' + imageOffset.x + ',' + imageOffset.y + '</div>';

    imageOffsetLine.setLatLngs([map.unproject(pixelOrigin), map.unproject(pixelOrigin.add(imageOffset))]);
  }

  L.DomEvent.on(img._image, 'load', function() {
    map.on('load move moveend zoomend viewreset', info)
    info();
  });
})();
