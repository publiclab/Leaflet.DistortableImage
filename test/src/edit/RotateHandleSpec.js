describe("L.RotateHandle", function() {
	var map,
		distortable,
		rotateHandle;

	beforeEach(function(done) {
		map = L.map(L.DomUtil.create('div', '', document.body)).setView([41.7896,-87.5996], 15);
		distortable = L.distortableImageOverlay('/examples/example.jpg', {
			corners: [
				L.latLng(41.7934, -87.6052),
				L.latLng(41.7934, -87.5852),
				L.latLng(41.7834, -87.5852),
				L.latLng(41.7834, -87.6052)
			]
		}).addTo(map);

		L.DomEvent.on(distortable._image, 'load', function() {
			rotateHandle = new L.RotateHandle(distortable, 0);
			done();
		});
	});

	describe("_calculateRotation", function() {
		it("Should return 0 when given the same latlng twice.", function() {
			var latlng = distortable.getCorner(0),
				angle = rotateHandle.calculateAngleDelta(latlng, latlng);

			expect(angle).to.equal(0);
		});
	});
});
