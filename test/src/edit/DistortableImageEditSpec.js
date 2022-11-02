describe('L.DistortableImage.Edit', () => {
  let map; let ov;

  beforeEach((done) => {
    map = L.map(L.DomUtil.create('div', '', document.body)).setView([41.7896, -87.5996], 15);

    ov = L.distortableImageOverlay('/examples/example.jpg', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.5852),
        L.latLng(41.7834, -87.6052),
      ],
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(ov.getElement(), 'load', () => { done(); });

    afterEach(() => {
      L.DomUtil.remove(ov);
    });
  });

  it('Should be initialized along with each instance of L.DistortableImageOverlay.', () => {
    expect(ov.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
  });

  it('Should keep handles on the map in sync with the corners of the image.', () => {
    const corners = ov.getCorners();
    const edit = ov.editing;
    edit.enable();
    // this test applies to a selected image
    ov.getElement().click();

    ov.setCorner(0, L.latLng(41.7934, -87.6252));

    /* Warp handles are currently on the map; they should have been updated. */
    edit._distortHandles.eachLayer((handle) => {
      expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
    });

    edit._freeRotateMode();

    /* After we toggle modes, the freeRotateHandles are on the map and should be synced. */
    edit._freeRotateHandles.eachLayer((handle) => {
      expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
    });
  });

  describe('#replaceTool', () => {
    it('It should replace an existing action', () => {
      const old = ov.editing.editActions[0];
      const next = ov.editing.editActions[1];
      const edit = ov.editing;

      edit.removeTool(next);

      edit.replaceTool(old, next);

      expect(edit.hasTool(old)).to.be.false;
      expect(edit.hasTool(next)).to.be.true;
      expect(edit.editActions[0]).to.equal(next);
    });

    it('It should do nothing if the first parameter does not exist', () => {
      const old = ov.editing.editActions[0];
      const next = ov.editing.editActions[1];
      const edit = ov.editing;

      edit.removeTool(old);

      edit.replaceTool(old, next);

      expect(edit.hasTool(old)).to.be.false;
      expect(edit.hasTool(next)).to.be.true;
    });

    it('It should do nothing if the second parameter already exists', () => {
      const old = ov.editing.editActions[0];
      const next = ov.editing.editActions[1];
      const edit = ov.editing;

      edit.replaceTool(old, next);

      expect(edit.hasTool(old)).to.be.true;
      expect(edit.hasTool(next)).to.be.true;
    });

    it('Should add the new action to the image\'s `modes` if it is also a mode', (done) => {
      const old = L.ScaleAction;
      const next = L.DragAction;

      const ov3 = L.distortableImageOverlay('/examples/example.jpg', {
        actions: [old],
      }).addTo(map);

      L.DomEvent.on(ov3.getElement(), 'load', () => {
        const edit = ov3.editing;
        expect(edit.hasMode('scale')).to.be.true;
        expect(edit.hasMode('drag')).to.be.false;

        edit.replaceTool(old, next);

        expect(edit.hasMode('scale')).to.be.false;
        expect(edit.hasMode('drag')).to.be.true;

        done();
      });
    });
  });

  describe('#_deselect', () => {
    it('It should hide an unlocked image\'s handles by updating their opacity', () => {
      const edit = ov.editing;

      edit.enable();
      // then trigger _deselect
      map.getContainer().click();

      const handleState = [];
      edit._handles.distort.eachLayer((handle) => {
        const icon = handle.getElement();
        handleState.push(L.DomUtil.getStyle(icon, 'opacity'));
      });

      expect(handleState).to.deep.equal(['0', '0', '0', '0']);
    });

    it('But it should not hide a locked image\'s handles', () => {
      const edit = ov.editing;

      edit.enable();
      // switch to lock handles
      edit._toggleLockMode();
      // then trigger _deselect
      map.getContainer().click();

      const lockHandleState = [];
      edit._handles.lock.eachLayer((handle) => {
        const icon = handle.getElement();
        lockHandleState.push(L.DomUtil.getStyle(icon, 'opacity'));
      });

      expect(lockHandleState).to.deep.equal(['1', '1', '1', '1']);
    });

    it('Should remove an image\'s individual toolbar instance regardless of lock handles', () => {
      const edit = ov.editing;

      edit.enable();
      // switch to lock handles
      edit._toggleLockMode();
      // select the image to initially create its individual toolbar instance
      ov.getElement().click();

      expect(edit.toolbar).to.not.be.false;

      // then trigger _deselect
      map.getContainer().click();

      // we deselect after 3ms to confirm the click wasn't a dblclick
      setTimeout(() => {
        expect(edit.toolbar).to.be.false;
      }, 3000);
    });
  });

  describe('#nextMode', () => {
    it('Should update image\'s mode to the next in its modes array', () => {
      const edit = ov.editing;
      const modes = Object.keys(edit.getModes());

      edit.setMode('distort');
      const idx = modes.indexOf('distort');

      const newIdx = modes.indexOf(edit.nextMode()._mode);
      expect(newIdx).to.equal((idx + 1) % modes.length);
    });

    it('Will also select the image when triggerd by dblclick', () => {
      ov.deselect();
      expect(ov.isSelected()).to.be.false;

      chai.simulateEvent(ov.getElement(), 'dblclick');
      setTimeout(() => {
        expect(ov.isSelected()).to.be.true;
      }, 3000);
    });

    it('It prevents dblclick events from propagating to the map', () => {
      const overlaySpy = sinon.spy();
      const mapSpy = sinon.spy();

      ov.on('dblclick', overlaySpy);
      map.on('dblclick', mapSpy);

      chai.simulateEvent(ov.getElement(), 'dblclick');

      setTimeout(() => {
        expect(ov.editing.nextMode).to.have.been.called;
        expect(L.DomEvent.stop).to.have.been.called;

        expect(overlaySpy.called).to.be.true;
        expect(mapSpy.notCalled).to.be.true;
      }, 3000);
    });

    it('Should call #setMode', () => {
      const edit = ov.editing;
      const spy = sinon.spy(edit, 'setMode');
      chai.simulateEvent(ov.getElement(), 'dblclick');
      expect(spy.called).to.be.ok;
    });

    it('Will still update the mode of an initialized image with suppressToolbar: true', (done) => {
      const ov2 = L.distortableImageOverlay('/examples/example.jpg', {
        suppressToolbar: true,
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', () => {
        const edit = ov2.editing;
        const modes = Object.keys(edit.getModes());
        const mode = edit.getMode();
        const idx = modes.indexOf(mode);

        expect(edit.toolbar).to.be.undefined;

        const newIdx = modes.indexOf(edit.nextMode()._mode);
        expect(newIdx).to.equal((idx + 1) % modes.length);

        done();
      });
    });
  });

  describe('#setMode', () => {
    it('Will return undefined if the passed value is not in the image\'s modes array', () => {
      const edit = ov.editing;
      expect(edit.setMode('lock')).to.be.ok;
      expect(edit.setMode('blah')).to.be.undefined;
    });

    it('Will return undefined if image editing is not enabled', () => {
      const edit = ov.editing;
      edit.disable();
      expect(edit.setMode('lock')).to.be.undefined;
    });

    it('Will return undefined if the passed mode is already the image\'s mode', () => {
      const edit = ov.editing;
      edit.setMode('distort');
      expect(edit.setMode('lock')).to.be.ok;
      expect(edit.setMode('lock')).to.be.undefined;
    });

    it('Will still update the mode of an initialized image with suppressToolbar: true', (done) => {
      const ov2 = L.distortableImageOverlay('/examples/example.jpg', {
        suppressToolbar: true,
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', () => {
        const edit = ov2.editing;
        expect(edit.toolbar).to.be.undefined;
        expect(edit.getMode()).to.not.eql('lock');
        expect(edit.setMode('lock')).to.be.ok;
        expect(edit.getMode()).to.eql('lock');

        done();
      });
    });
  });
});
