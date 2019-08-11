describe('L.EditHandle', function() {
    var map, overlay, rotateHandle, scaleHandle;

    beforeEach(function(done) {
        map = L.map(L.DomUtil.create('div', '', document.body))
               .setView([41.7896, -87.5996], 15);

        overlay = L.distortableImageOverlay('/examples/example.jpg', {
            corners: [
                L.latLng(41.7934, -87.6052),
                L.latLng(41.7934, -87.5852),
                L.latLng(41.7834, -87.5852),
                L.latLng(41.7834, -87.6052)
            ]
        }).addTo(map);

        L.DomEvent.on(overlay._image, 'load', function() {
            rotateHandle = new L.RotateHandle(overlay, 0);
            scaleHandle = new L.ScaleHandle(overlay, 0);
            done();
        });
    });

    describe('#calculateAngleDelta', function() {
        it('Should return 0 when given the same latlng twice.', function() {
            var latlng = overlay.getCorner(0),
                angle = rotateHandle.calculateAngleDelta(latlng, latlng);

            expect(angle).to.equal(0);
        });
    });

    describe('#_calculateScalingFactor', function() {
        it('Should return 1 when given the same latlng twice.', function() {
            var latlng = overlay.getCorner(0),
                scale = scaleHandle._calculateScalingFactor(latlng, latlng);

            expect(scale).to.equal(1);
        });
    });
});
