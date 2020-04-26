<<<<<<< HEAD
/* jshint -W030 */
describe('L.DistortableImage.Edit', function() {
  var map;
  var ov;

  beforeEach(function(done) {
    map = L.map(L.DomUtil.create('div', '', document.body)).setView([41.7896, -87.5996], 15);

    ov = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.5852),
        L.latLng(41.7834, -87.6052),
      ],
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(ov.getElement(), 'load', function() { done(); });

    afterEach(function() {
      L.DomUtil.remove(ov);
    });
  });

  it('Should be initialized along with each instance of L.DistortableImageOverlay.', function() {
    expect(ov.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
  });

  it('Should keep handles on the map in sync with the corners of the image.', function() {
    var corners = ov.getCorners();
    var edit = ov.editing;
    edit.enable();
    // this test applies to a selected image
    chai.simulateEvent(ov.getElement(), 'click');

    ov.setCorner(0, L.latLng(41.7934, -87.6252));

    /* Warp handles are currently on the map; they should have been updated. */
    edit._distortHandles.eachLayer(function(handle) {
      expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
    });

    edit._freeRotateMode();

    /* After we toggle modes, the freeRotateHandles are on the map and should be synced. */
    edit._freeRotateHandles.eachLayer(function(handle) {
      expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
    });
  });

  describe('#replaceTool', function() {
    it('It should replace an existing action', function() {
      var old = ov.editing.editActions[0];
      var next = ov.editing.editActions[1];
      var edit = ov.editing;

      edit.removeTool(next);

      edit.replaceTool(old, next);

      expect(edit.hasTool(old)).to.be.false;
      expect(edit.hasTool(next)).to.be.true;
      expect(edit.editActions[0]).to.equal(next);
    });

    it('It should do nothing if the first parameter does not exist', function() {
      var old = ov.editing.editActions[0];
      var next = ov.editing.editActions[1];
      var edit = ov.editing;

      edit.removeTool(old);

      edit.replaceTool(old, next);

      expect(edit.hasTool(old)).to.be.false;
      expect(edit.hasTool(next)).to.be.true;
    });

    it('It should do nothing if the second parameter already exists', function() {
      var old = ov.editing.editActions[0];
      var next = ov.editing.editActions[1];
      var edit = ov.editing;

      edit.replaceTool(old, next);

      expect(edit.hasTool(old)).to.be.true;
      expect(edit.hasTool(next)).to.be.true;
    });

    it('Should add the new action to the image\'s `modes` if it is also a mode', function(done) {
      var ov3 = L.distortableImageOverlay('/examples/example.png', {
        actions: [L.ScaleAction]
      }).addTo(map);

      var old = L.ScaleAction;
      var next = L.DragAction;

      L.DomEvent.on(ov3.getElement(), 'load', function() {
        var edit = ov3.editing;
        expect(edit.hasMode('scale')).to.be.true;
        expect(edit.hasMode('drag')).to.be.false;

        edit.replaceTool(old, next);

        expect(edit.hasMode('scale')).to.be.false;
        expect(edit.hasMode('drag')).to.be.true;

        done();
      });
    });
  });

  describe('#_deselect', function() {
    it('It should hide an unlocked image\'s handles by updating their opacity', function() {
      var edit = ov.editing;

      edit.enable();
      // then trigger _deselect
      map.fire('click');

      var handleState = [];
      edit._handles.distort.eachLayer(function(handle) {
        var icon = handle.getElement();
        handleState.push(L.DomUtil.getStyle(icon, 'opacity'));
      });

      expect(handleState).to.deep.equal(['0', '0', '0', '0']);
    });

    it('But it should not hide a locked image\'s handles', function() {
      var edit = ov.editing;

      edit.enable();
      // switch to lock handles
      edit._toggleLockMode();
      // then trigger _deselect
      map.fire('click');

      var lockHandleState = [];
      edit._handles.lock.eachLayer(function(handle) {
        var icon = handle.getElement();
        lockHandleState.push(L.DomUtil.getStyle(icon, 'opacity'));
      });

      expect(lockHandleState).to.deep.equal(['1', '1', '1', '1']);
    });

    it('Should remove an image\'s individual toolbar instance regardless of lock handles', function() {
      var edit = ov.editing;

      edit.enable();
      // switch to lock handles
      edit._toggleLockMode();
      // select the image to initially create its individual toolbar instance
      chai.simulateEvent(ov.getElement(), 'click');

      expect(edit.toolbar).to.not.be.false;

      // then trigger _deselect
      map.fire('click');

      // we deselect after 3ms to confirm the click wasn't a dblclick
      setTimeout(function() {
        expect(edit.toolbar).to.be.false;
      }, 3000);
    });
  });

  describe('#nextMode', function() {
    it('Should update image\'s mode to the next in its modes array', function() {
      var edit = ov.editing;
      var modes = Object.keys(edit.getModes());

      edit.setMode('distort');
      var idx = modes.indexOf('distort');

      var newIdx = modes.indexOf(edit.nextMode()._mode);
      expect(newIdx).to.equal((idx + 1) % modes.length);
    });

    it('Will also select the image when triggerd by dblclick', function() {
      ov.deselect();
      expect(ov.isSelected()).to.be.false;

      chai.simulateEvent(ov.getElement(), 'dblclick');
      setTimeout(function() {
        expect(ov.isSelected()).to.be.true;
      }, 3000);
    });

    it('It prevents dblclick events from propagating to the map', function() {
      var overlaySpy = sinon.spy();
      var mapSpy = sinon.spy();

      ov.on('dblclick', overlaySpy);
      map.on('dblclick', mapSpy);

      ov.fire('dblclick');

      setTimeout(function() {
        expect(ov.editing.nextMode).to.have.been.called;
        expect(L.DomEvent.stop).to.have.been.called;

        expect(overlaySpy.called).to.be.true;
        expect(mapSpy.notCalled).to.be.true;
      }, 3000);
    });

    it('Should call #setMode', function() {
      var edit = ov.editing;
      var spy = sinon.spy(edit, 'setMode');
      chai.simulateEvent(ov.getElement(), 'dblclick');
      expect(spy.called).to.be.ok;
    });

    it('Will still update the mode of an initialized image with suppressToolbar: true', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.png', {
        suppressToolbar: true,
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        var edit = ov2.editing;
        var modes = Object.keys(edit.getModes());
        var mode = edit.getMode();
        var idx = modes.indexOf(mode);

        expect(edit.toolbar).to.be.undefined;

        var newIdx = modes.indexOf(edit.nextMode()._mode);
        expect(newIdx).to.equal((idx + 1) % modes.length);

        done();
      });
    });
  });

  describe('#setMode', function() {
    it('Will return undefined if the passed value is not in the image\'s modes array', function() {
      var edit = ov.editing;
      expect(edit.setMode('lock')).to.be.ok;
      expect(edit.setMode('blah')).to.be.undefined;
    });

    it('Will return undefined if image editing is not enabled', function() {
      var edit = ov.editing;
      edit.disable();
      expect(edit.setMode('lock')).to.be.undefined;
    });

    it('Will return undefined if the passed mode is already the image\'s mode', function() {
      var edit = ov.editing;
      edit.setMode('distort');
      expect(edit.setMode('lock')).to.be.ok;
      expect(edit.setMode('lock')).to.be.undefined;
    });

    it('Will still update the mode of an initialized image with suppressToolbar: true', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.png', {
        suppressToolbar: true,
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        var edit = ov2.editing;
        expect(edit.toolbar).to.be.undefined;
        expect(edit.getMode()).to.not.eql('lock');
        expect(edit.setMode('lock')).to.be.ok;
        expect(edit.getMode()).to.eql('lock');

        done();
      });
    });
  });
=======
describe("L.DistortableImage.Edit", function() {
	var map,
		overlay;

	beforeEach(function(done) {
		map = new L.Map(L.DomUtil.create('div', '', document.body)).setView([41.7896,-87.5996], 15);

		overlay = new L.DistortableImageOverlay('/examples/example.png', {
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
>>>>>>> dce63cf6d97329e4bcbd0b98c2f1399574610998
});
