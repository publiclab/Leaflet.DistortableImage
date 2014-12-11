L.ImageMarker = L.Marker.extend({
  options: {
    pane: 'markerPane',
    icon: new L.Icon({iconUrl:'../src/images/imarker.png'}),
    // title: '',
    // alt: '',
    clickable: true,
    draggable: true, // this causes an error. Why?
    keyboard: true,
    zIndexOffset: 0,
    opacity: 1,
    riseOnHover: true,
    riseOffset: 250
  }
});