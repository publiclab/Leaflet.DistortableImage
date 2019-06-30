describe("L.DistortableImage.Edit", function() {
	var map,
		overlay;

	beforeEach(function(done) {
		map = L.map(L.DomUtil.create('div', '', document.body)).setView([41.7896,-87.5996], 15);

		overlay = L.distortableImageOverlay('/examples/example.png', {
			corners: [
				L.latLng(41.7934, -87.6052),
				L.latLng(41.7934, -87.5852),
				L.latLng(41.7834, -87.5852),
				L.latLng(41.7834, -87.6052)
			]
		}).addTo(map);

		/* Forces the image to load before any tests are run. */
		L.DomEvent.on(overlay._image, 'load', function() { done (); });

		afterEach(function () {
			L.DomUtil.remove(overlay);
		});
		
	});

	it("Should be initialized along with each instance of L.DistortableImageOverlay.", function() {
		expect(overlay.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
	});

	it("Should keep handles on the map in sync with the corners of the image.", function() {
		var corners = overlay.getCorners(),
			edit = overlay.editing,
			img = overlay.getElement();

		edit.enable();
		// this test applies to a selected image
		chai.simulateClick(img);

		overlay.setCorner(0, L.latLng(41.7934, -87.6252));
		overlay.fire('update');
		
		/* Warp handles are currently on the map; they should have been updated. */
		edit._distortHandles.eachLayer(function(handle) {
			expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
		});

		edit._toggleRotateScale();

		/* After we toggle modes, the rotateScaleHandles are on the map and should be synced. */
		edit._rotateScaleHandles.eachLayer(function(handle) {
			expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
		});
	});

	it.skip("Should keep image in sync with the map while dragging.", function() {
		var edit = overlay.editing,
			dragging;

		edit.enable();

		dragging = edit.dragging;

		/* _reset is not called by #onAdd, for some reason... */
		overlay._reset();

		/* Simulate a sequence of drag events. */
		dragging._onDown({ touches: [{ clientX: 0, clientY: 0 }], target: overlay._image });
		dragging._onMove({ touches: [{ clientX: 20, clientY: 30 }], target: overlay._image });
		dragging._onUp();

		map.setView([41.7896,-87.6996]);
	});

	describe("#_select", function () {
		it("It should initialize an image's individual toolbar instance", function () {
			var edit = overlay.editing,
				img = overlay.getElement();

			edit.enable();

			expect(edit.toolbar).to.not.exist

			// triggers _select
			chai.simulateClick(img);

			expect(edit.toolbar).to.exist
		});

		it("It should show an unlocked image's handles by updating their opacity", function () {
			var edit = overlay.editing,
				img = overlay.getElement();

			edit.enable();
			chai.simulateClick(img);

			var handleState = [];
			edit._handles["distort"].eachLayer(function (handle) {
				handleState.push(handle._icon.style.opacity)
			});

			expect(handleState).to.deep.equal(["1", "1", "1", "1"]); 
		});
	});

	describe("#_deselect", function () {
		it("It should hide an unlocked image's handles by updating their opacity", function () {
			var edit = overlay.editing;

			edit.enable();
			// then trigger _deselect
			map.fire('click');

			var handleState = [];
			edit._handles["distort"].eachLayer(function (handle) {
				handleState.push(handle._icon.style.opacity)
			});

			expect(handleState).to.deep.equal(["0", "0", "0", "0"]);
		});

		it("But it should not hide a locked image's handles", function () {
			var edit = overlay.editing;

			edit.enable();
			// switch to lock handles 
			edit._toggleLock();
			// then trigger _deselect
			map.fire('click');

			var lockHandleState = [];
			edit._handles["lock"].eachLayer(function (handle) {
				lockHandleState.push(handle._icon.style.opacity)
			});

			// opacity for lockHandles is unset because we never altered it to hide it as part of deselection
			expect(lockHandleState).to.deep.equal(["", "", "", ""]);
		});

		it("Should remove an image's individual toolbar instance regardless of lock handles", function () {
			var edit = overlay.editing,
				img = overlay.getElement();

			edit.enable();
			// switch to lock handles
			edit._toggleLock();
			// select the image to initially create its individual toolbar instance
			chai.simulateClick(img);

			expect(edit.toolbar).to.not.be.false

			// then trigger _deselect
			map.fire('click');

			expect(edit.toolbar).to.be.false
		});
	});
});
