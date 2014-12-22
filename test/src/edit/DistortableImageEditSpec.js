describe("L.DistortableImage.Edit", function() {
	var map,
		overlay;

	beforeEach(function(done) {
		map = new L.Map(L.DomUtil.create('div', '', document.body)).setView([41.7896,-87.5996], 15);

		overlay = new L.DistortableImageOverlay('/examples/example.jpg', {
			corners: [
				new L.LatLng(41.7934, -87.6052),
				new L.LatLng(41.7934, -87.5852),
				new L.LatLng(41.7834, -87.5852),
				new L.LatLng(41.7834, -87.6052)
			]
		}).addTo(map);

		/* Forces the image to load before any tests are run. */
		L.DomEvent.on(overlay._image, 'load', function() { done (); });
	});

	it("Should be initialized along with each instance of L.DistortableImageOverlay.", function() {
		expect(overlay.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
	});

	it("Should keep handles on the map in sync with the corners of the image.", function() {
		var corners = overlay._corners;

		overlay.editing.enable();

		overlay._updateCorner(0, new L.LatLng(41.7934, -87.6252));
		overlay.fire('update');
		
		/* Warp handles are currently on the map; they should have been updated. */
		overlay.editing._distortHandles.eachLayer(function(handle) {
			expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
		});

		overlay.editing._toggleRotateDistort();

		/* After we toggle modes, the rotateHandles are on the map and should be synced. */
		overlay.editing._rotateHandles.eachLayer(function(handle) {
			expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
		});
	});

	it.skip("Should keep image in sync with the map while dragging.", function() {
		var corners = overlay._corners,
			dragging;

		overlay.editing.enable();

		dragging = overlay.editing.dragging;

		/* _reset is not called by #onAdd, for some reason... */
		overlay._reset();

		/* Simulate a sequence of drag events. */
		dragging._onDown({ touches: [{ clientX: 0, clientY: 0 }], target: overlay._image });
		dragging._onMove({ touches: [{ clientX: 20, clientY: 30 }], target: overlay._image });
		dragging._onUp();

		map.setView([41.7896,-87.6996]);
	});
});