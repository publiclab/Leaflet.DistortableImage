describe("L.DistortableImageOverlay", function() {
	var map,
		distortable;

	beforeEach(function() {
		var mapContainer = L.DomUtil.create('div', '', document.body),
			fullSize = [document.querySelector("html"), document.body, mapContainer];

		map = new L.Map(mapContainer).setView([41.7896,-87.5996], 15);

		/* Map and its containing elements need to have height and width set. */
		for (var i = 0, l = fullSize.length; i < l; i++) {
			fullSize[i].style.width = '100%';
			fullSize[i].style.height = '100%';
		}

		distortable = new L.DistortableImageOverlay('/examples/example.jpg', {
			corners: [
				new L.LatLng(41.7934, -87.6052),
				new L.LatLng(41.7934, -87.5852),
				new L.LatLng(41.7834, -87.5852),
				new L.LatLng(41.7834, -87.6052)
			]
		});
	});

	describe("#_calculateProjectiveTransform", function() {
		it.skip("Should", function() {
			var matrix;

			/* _map is set when #onAdd is called. */
			distortable._map = map;
			distortable._initImage();

			matrix = distortable._calculateProjectiveTransform();
			expect(matrix).to.equal([]);
		});
	});

	describe("getCenter", function() {
		it("Should return the center when the outline of the image is a rectangle.", function(done) {
			distortable.addTo(map);
			
			L.DomEvent.on(distortable._image, 'load', function() {
				var center = distortable.getCenter();

				expect(center).to.be.closeToLatLng(new L.LatLng(41.7884, -87.5952));
				done();
			});
		});
	});
});