describe('L.DistortableImage.Edit', function() {
  var map;
  var overlay;

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

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(overlay._image, 'load', function() { done(); });

    afterEach(function() {
      L.DomUtil.remove(overlay);
    });
  });

  it('Should be initialized along with each instance of L.DistortableImageOverlay.', function() {
    expect(overlay.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
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
        handleState.push(handle._icon.style.opacity);
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
        lockHandleState.push(handle._icon.style.opacity);
      });

      // opacity for lockHandles is unset because we never altered it to hide it as part of deselection
      expect(lockHandleState).to.deep.equal(['', '', '', '']);
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

  describe('#_nextMode', function () {
    beforeEach(function () {
      overlay.editing.enable();
    });

    it('Should update images mode to the "next" (depending on developer) mode on dblclick', function() {
      var edit = overlay.editing;
      var modes = edit._modes;

      edit._mode = 'distort'
      var idx = modes.indexOf('distort');

      var newIdx = modes.indexOf(edit._nextMode()._mode)
      setTimeout(function () {
        expect(newIdx).to.equal((idx + 1) % modes.length)
      }, 3000);
    });

    it('Will update to next mode even when current mode is \'lock\'', function() {
      var edit = overlay.editing;
      var img = overlay.getElement();

      edit._lock();
      expect(edit._mode).to.equal('lock');
      
      chai.simulateEvent(img, chai.mouseEvents.Dblclick);
      expect(edit._mode).to.not.equal('lock');
    });

    it('It prevents dblclick events from propagating to the map', function() {
      var overlaySpy = sinon.spy();
      var mapSpy = sinon.spy();

      overlay.on('dblclick', overlaySpy);
      map.on('dblclick', mapSpy);
      
      overlay.fire('dblclick');
      expect(overlay.editing._nextMode).to.have.been.called;
      expect(L.DomEvent.stop).to.have.been.called;

      expect(overlaySpy.called).to.be.true;
      expect(mapSpy.notCalled).to.be.true;
    });

    it('Will return false when the image is disabled or is multi-selected', function() {
      var edit = overlay.editing;
      var img = overlay.getElement();

      edit.disable();
      expect(edit._nextMode()).to.be.false

      edit.enable();

      chai.simulateEvent(img, chai.mouseEvents.ShiftMouseDown);
      setTimeout(function () {
        expect(L.DomUtil.getClass(img)).to.include('selected');
        expect(edit._nextMode()).to.be.false
      }, 3000);
    });
  });
});
