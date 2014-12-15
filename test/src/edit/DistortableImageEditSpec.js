describe("L.DistortableImage.Edit", function() {
	var map,
		overlay;

	beforeEach(function() {
		map = new L.Map(L.DomUtil.create('div', '', document.body)).setView([41.7896,-87.5996], 15);

		overlay = new L.DistortableImageOverlay('/examples/example.jpg', {
			corners: [
				new L.LatLng(41.7934, -87.6052),
				new L.LatLng(41.7934, -87.5852),
				new L.LatLng(41.7834, -87.5852),
				new L.LatLng(41.7834, -87.6052)
			]
		});
	});

	it("Should be initialized along with each instance of L.DistortableImageOverlay.", function() {
		expect(overlay.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
	});

	it.skip("Should cause all handles to fire when the image overlay is updated.", function() {
		var _updateRotateHandle = sinon.spy(L.RotateHandle.prototype.updateHandle),
			_updateWarpHandle = sinon.spy(L.WarpHandle.prototype.updateHandle);

		overlay = new L.DistortableImageOverlay('../../examples/example.jpg', [
			new L.LatLng(41.7934, -87.6052),
			new L.LatLng(41.7934, -87.5852),
			new L.LatLng(41.7834, -87.5852),
			new L.LatLng(41.7834, -87.6052)
		]);

		overlay.fire('update');
		
		expect(_updateWarpHandle.called).to.equal(true);
		expect(_updateRotateHandle.called).to.equal(true);	
	});
});