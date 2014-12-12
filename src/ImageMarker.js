L.ImageMarker = L.Marker.extend({
  // icons generated from FontAwesome at: http://fa2png.io/
  icons: { grey: '../src/images/circle-o_444444_16.png',
            red: '../src/images/circle-o_cc4444_16.png',
         locked: '../src/images/close_444444_16.png'
  },
  options: {
    pane: 'markerPane',
    icon: false,
    // title: '',
    // alt: '',
    clickable: true,
    draggable: true, 
    keyboard: true,
    zIndexOffset: 0,
    opacity: 1,
    riseOnHover: true,
    riseOffset: 250
  },
  setFromIcons: function(name) {
    this.setIcon(new L.Icon({iconUrl:this.icons[name],iconSize:[16,16],iconAnchor:[8,8]}))
  }
  
});
