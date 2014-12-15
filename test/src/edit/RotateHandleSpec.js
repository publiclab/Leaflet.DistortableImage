describe("L.RotateHandle", function() {
	var map,
		distortable,
		rotateHandle;

	beforeEach(function(done) {
		map = new L.Map(L.DomUtil.create('div', '', document.body)).setView([41.7896,-87.5996], 15);
		distortable = new L.DistortableImageOverlay('/examples/example.jpg', {
			corners: [
				new L.LatLng(41.7934, -87.6052),
				new L.LatLng(41.7934, -87.5852),
				new L.LatLng(41.7834, -87.5852),
				new L.LatLng(41.7834, -87.6052)
			]
		}).addTo(map);

		L.DomEvent.on(distortable._image, 'load', function() {
			rotateHandle = new L.RotateHandle(distortable, 0);
			done();
		});
	});

	describe("_calculateRotation", function() {
		it("Should return 0 when given the same latlng twice.", function() {
			var latlng = distortable._corners[0],
				angle = rotateHandle._calculateAngle(latlng, latlng);

			expect(angle).to.equal(0);
		});
	});

	describe("_calculateScalingFactor", function() {
		it("Should return 1 when given the same latlng twice.", function() {
			var latlng = distortable._corners[0],
				scale = rotateHandle._calculateScalingFactor(latlng, latlng);

			expect(scale).to.equal(1);
		});
	});
});