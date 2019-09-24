describe('L.DistortableImage.Edit', function() {
  var map;
  var overlay;
  var ov2;

  beforeEach(function(done) {
    map = L.map(L.DomUtil.create('div', '', document.body)).setView([41.7896, -87.5996], 15);

    overlay = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.5852),
        L.latLng(41.7834, -87.6052),
      ],
    }).addTo(map);

    ov2 = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.5852),
        L.latLng(41.7834, -87.6052),
      ],
      suppressToolbar: true,
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(ov2._image, 'load', function() { done(); });

    afterEach(function() {
      L.DomUtil.remove(overlay);
      L.DomUtil.remove(ov2);
    });
  });

  it('Should be initialized along with each instance of L.DistortableImageOverlay.', function() {
    expect(overlay.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
    expect(ov2.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
  });

  it('Should keep handles on the map in sync with the corners of the image.', function() {
    var corners = overlay.getCorners();
    var edit = overlay.editing;
    var img = overlay.getElement();

    edit.enable();
    // this test applies to a selected image
    chai.simulateEvent(img, chai.mouseEvents.Click);

    overlay.setCorner(0, L.latLng(41.7934, -87.6252));

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

  describe('#_deselect', function() {
    it('It should hide an unlocked image\'s handles by updating their opacity', function() {
      var edit = overlay.editing;

      edit.enable();
      // then trigger _deselect
      map.fire('click');

      var handleState = [];
      edit._handles['distort'].eachLayer(function(handle) {
        var icon = handle.getElement();
        handleState.push(L.DomUtil.getStyle(icon, 'opacity'));
      });

      expect(handleState).to.deep.equal(['0', '0', '0', '0']);
    });

    it('But it should not hide a locked image\'s handles', function() {
      var edit = overlay.editing;

      edit.enable();
      // switch to lock handles
      edit._toggleLockMode();
      // then trigger _deselect
      map.fire('click');

      var lockHandleState = [];
      edit._handles['lock'].eachLayer(function(handle) {
        var icon = handle.getElement();
        lockHandleState.push(L.DomUtil.getStyle(icon, 'opacity'));
      });

      expect(lockHandleState).to.deep.equal(['1', '1', '1', '1']);
    });

    it('Should remove an image\'s individual toolbar instance regardless of lock handles', function() {
      var edit = overlay.editing;
      var img = overlay.getElement();

      edit.enable();
      // switch to lock handles
      edit._toggleLockMode();
      // select the image to initially create its individual toolbar instance
      chai.simulateEvent(img, chai.mouseEvents.Click);

      expect(edit.toolbar).to.not.be.false;

      // then trigger _deselect
      map.fire('click');

      // we deselect after 3ms to confirm the click wasn't a dblclick
      setTimeout(function() {
        expect(edit.toolbar).to.be.false;
      }, 3000);
    });
  });

  describe('#nextMode', function () {
    beforeEach(function() {
      overlay.editing.enable();
      overlay.select();
    });

    it('Should update image\'s mode to the next in its modes array', function() {
      var edit = overlay.editing;
      var modes = edit.getModes();

      edit._mode = 'distort'
      var idx = modes.indexOf('distort');

      var newIdx = modes.indexOf(edit.nextMode()._mode)
      expect(newIdx).to.equal((idx + 1) % modes.length)
    });

    it('Will only update if the image is selected, or nextMode was triggerd by dblclick', function() {
      var edit = overlay.editing;

      overlay.deselect();
      expect(edit.nextMode()).to.be.false

      chai.simulateEvent(overlay.getElement(), chai.mouseEvents.Dblclick);
      setTimeout(function () {
        expect(edit.nextMode()).to.be.ok
      }, 3000);
    });

    it('It prevents dblclick events from propagating to the map', function() {
      var overlaySpy = sinon.spy();
      var mapSpy = sinon.spy();

      overlay.on('dblclick', overlaySpy);
      map.on('dblclick', mapSpy);
      
      overlay.fire('dblclick');

      setTimeout(function () {
        expect(overlay.editing.nextMode).to.have.been.called;
        expect(L.DomEvent.stop).to.have.been.called;

        expect(overlaySpy.called).to.be.true;
        expect(mapSpy.notCalled).to.be.true;
      }, 3000);
    });

    it('Should call #setMode', function () {
      var overlaySpy = sinon.spy();
      overlay.on('dblclick', overlaySpy);

      overlay.fire('dblclick');
      expect(overlay.editing.setMode).to.have.been.called;
    });

    it('Will still update the mode of an initialized image with suppressToolbar: true', function() {
      ov2.select();
      expect(ov2.editing.toolbar).to.be.undefined
      expect(ov2.editing.nextMode()).to.be.ok
    })
  });

  describe('#setMode', function() {
    it('Will return false if the passed value is not in the image\'s modes array', function() {
      var edit = overlay.editing;
      overlay.select();
      expect(edit.setMode('lock')).to.be.ok
      expect(edit.setMode('blah')).to.be.false
    });

    it('Will return false if the image is not selected', function() {
      var edit = overlay.editing;
      expect(edit.setMode('lock')).to.be.false
    });

    it('Will return false if the passed mode is already the images mode', function() {
      var edit = overlay.editing;
      overlay.select();
      expect(edit.setMode('lock')).to.be.ok
      expect(edit.setMode('lock')).to.be.false
    });

    it('Will still update the mode of an initialized image with suppressToolbar: true', function () {
      ov2.select();
      expect(ov2.editing.toolbar).to.be.undefined
      expect(ov2.editing.setMode('lock')).to.be.ok
    })
  });
});
