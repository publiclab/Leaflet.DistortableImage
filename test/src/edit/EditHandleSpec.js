describe('L.EditHandle', function() {
  let map; let overlay; let rotateHandle; let scaleHandle;

  beforeEach(function(done) {
    map = L.map(L.DomUtil.create('div', '', document.body))
        .setView([51.505, -0.09], 13);

    overlay = L.distortableImageOverlay('/examples/example.jpg', {
      corners: [
        L.latLng(51.52, -0.14),
        L.latLng(51.52, -0.1),
        L.latLng(51.5, -0.14),
        L.latLng(51.5, -0.1),
      ],
    }).addTo(map);

    L.DomEvent.on(overlay.getElement(), 'load', function() {
      rotateHandle = L.rotateHandle(overlay, 0);
      scaleHandle = L.scaleHandle(overlay, 0);
      done();
    });
  });

  describe('#calculateAngleDelta', function() {
    it('Should return 0 when given the same latlng twice.', function() {
      const latlng = overlay.getCorner(0);
      const angle = rotateHandle.calculateAngleDelta(latlng, latlng);
      expect(angle).to.equal(0);
    });
  });

  describe('#_calculateScalingFactor', function() {
    it('Should return 1 when given the same latlng twice.', function() {
      const latlng = overlay.getCorner(0);
      const scale = scaleHandle._calculateScalingFactor(latlng, latlng);
      expect(scale).to.equal(1);
    });

    it('Should return a smaller value as the 2nd latlng gets closer to the images original center.', function() {
      const latlng = overlay.getCorner(0);
      const latlng2 = L.latLng(51.51, -0.13);
      const latlng3 = L.latLng(51.51, -0.12);
      const scale = scaleHandle._calculateScalingFactor(latlng, latlng2);
      const scale2 = scaleHandle._calculateScalingFactor(latlng, latlng3);

      expect(scale).to.be.below(1);
      expect(scale2).to.be.below(scale);
    });
  });
});
