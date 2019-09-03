describe('L.DistortableImageOverlay', function() {
  var map, overlay;

  beforeEach(function(done) {
    var mapContainer = L.DomUtil.create('div', '', document.body),
        fullSize = [document.querySelector('html'), document.body, mapContainer];

    map = L.map(mapContainer).setView([41.7896, -87.5996], 15);

    /* Map and its containing elements need to have height and width set. */
    for (var i = 0, l = fullSize.length; i < l; i++) {
      fullSize[i].style.width = '100%';
      fullSize[i].style.height = '100%';
    }

    overlay = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.6052),
        L.latLng(41.7834, -87.5852)
      ]
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(overlay._image, 'load', function() { done(); });

    afterEach(function() {
      L.DomUtil.remove(overlay);
    });
  });

  describe('#_calculateProjectiveTransform', function() {
    it.skip('Should', function() {
      var matrix;

      /* _map is set when #onAdd is called. */
      overlay._map = map;
      overlay._initImage();

      matrix = overlay._calculateProjectiveTransform();
      expect(matrix).to.equal([]);
    });
  });

  describe('#getCenter', function() {
    it('Should return the center when the outline of the image is a rectangle', function() {
      var center = overlay.getCenter();

      expect(center).to.be.closeToLatLng(L.latLng(41.7884, -87.5952));
    });
  });

  // describe('#scaleBy', function() {
  //   it('Should not change image dimensions when passed a value of 1 or 0', function() {
  //     var img = overlay.getElement(),
  //         dims = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];

  //     overlay.scaleBy(1);

  //     var scaledDims = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];
  //     expect(dims).to.be.eql(scaledDims);

  //     overlay.scaleBy(0);

  //     var scaledDims2 = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];
  //     expect(dims).to.be.eql(scaledDims2);
  //   });

  //   it('Should invert image dimensions when passed a negative value', function() {
  //     var c2 = overlay.getCorner(2),
  //         c3 = overlay.getCorner(3);

  //     overlay.scaleBy(-1);

  //     var scaledC = overlay.getCorner(0),
  //         scaledC1 = overlay.getCorner(1);

  //     expect(Math.round(scaledC.lat)).to.equal(Math.round(c3.lat));
  //     expect(Math.round(scaledC.lng)).to.equal(Math.round(c3.lng));
  //     expect(Math.round(scaledC1.lat)).to.equal(Math.round(c2.lat));
  //     expect(Math.round(scaledC1.lng)).to.equal(Math.round(c2.lng));
  //   });

  //   it('Maintain image proportions when scaling', function() {
  //     var w = overlay.getElement().getBoundingClientRect().width,
  //         h = overlay.getElement().getBoundingClientRect().height;

  //     overlay.scaleBy(0.5);

  //     var w2 = overlay.getElement().getBoundingClientRect().width,
  //         h2 = overlay.getElement().getBoundingClientRect().height;

  //     expect(Math.round(w / 2)).to.be.equal(Math.round(w2));
  //     expect(Math.round(h / 2)).to.be.equal(Math.round(h2));
  //   });
  // });
});
