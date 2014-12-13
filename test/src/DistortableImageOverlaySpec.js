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

		distortable = new L.DistortableImageOverlay('../examples/example.jpg', [
			new L.LatLng(41.7934, -87.6052),
			new L.LatLng(41.7934, -87.5852),
			new L.LatLng(41.7834, -87.5852),
			new L.LatLng(41.7834, -87.6052)
		]);
	});

	describe("#onAdd", function() {
		it("", function() {
			distortable.onAdd(map);
		});
	});

	describe("#getCenter", function() {

	});
});