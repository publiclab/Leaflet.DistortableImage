describe("L.DistortableImageOverlay", function() {
	var map,
		distortable;

	beforeEach(function() {
		map = new L.Map(L.DomUtil.create('div')).setView([41.7896,-87.5996], 15);

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