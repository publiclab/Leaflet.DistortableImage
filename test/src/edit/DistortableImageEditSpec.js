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
      actions: [
        L.ScaleAction,
        L.DistortAction,
        L.RotateAction,
        L.FreeRotateAction,
        L.LockAction,
        L.OpacityAction,
        L.BorderAction,
        L.ExportAction,
        L.DeleteAction,
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

    ov3 = L.distortableImageOverlay('/examples/example.png', {
      actions: [],
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(ov3._image, 'load', function() { done(); });

    afterEach(function() {
      L.DomUtil.remove(overlay);
      L.DomUtil.remove(ov2);
      L.DomUtil.remove(ov3);
    });
  });

  it('Should be initialized along with each instance of L.DistortableImageOverlay.', function() {
    expect(overlay.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
    expect(ov2.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
    expect(ov3.editing).to.be.an.instanceOf(L.DistortableImage.Edit);
  });

  it('Should keep handles on the map in sync with the corners of the image.', function() {
    var corners = overlay.getCorners();
    var edit = overlay.editing;

    edit.enable();
    // this test applies to a selected image
    chai.simulateEvent(overlay.getElement(), 'click');
    
    overlay.setCorner(0, L.latLng(41.7934, -87.6252));
    /* Warp handles are currently on the map; they should have been updated. */
    edit.currentHandle.eachLayer(function(handle) {
      expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
    });

    edit.setMode('freeRotate');
    /* After we toggle modes, the freeRotateHandles are on the map and should be synced. */
    edit.currentHandle.eachLayer(function(handle) {
      expect(handle.getLatLng()).to.be.closeToLatLng(corners[handle._corner]);
    });
  });

  describe('#_appendHandlesDraggable', function() {
    it('Allows an empty actions array w/out suppressToolbar', function() {
      expect(ov3.editing.enable).to.not.throw;
      expect(ov3.editing.getMode()).to.be.undefined;
      expect(ov3.editing.getModes()).to.be.empty;
    });
  });

  describe('#nextMode', function () {
    beforeEach(function() {
      overlay.editing.enable();
      overlay.select();
    });

    it('Should update image\'s mode to the next in its modes array', function() {
      var edit = overlay.editing;
      var modes = Object.keys(edit.getModes());

      edit.setMode('distort');
      var idx = modes.indexOf('distort');

      var newIdx = modes.indexOf(edit.nextMode()._mode);
      expect(newIdx).to.equal((idx + 1) % modes.length);
    });

    it('Will also select the image when triggerd by dblclick', function() {
      overlay.deselect();
      expect(overlay.isSelected()).to.be.false;

      chai.simulateEvent(overlay.getElement(), 'dblclick');
      setTimeout(function () {
        expect(overlay.isSelected()).to.be.true;
      }, 3000);
    });

    it('It prevents dblclick events from propagating to the map', function() {
      var mapListen = sinon.spy();
      map.on('dblcick', mapListen);
      chai.simulateEvent(overlay.getElement(), 'dblclick');
      expect(mapListen.called).not.to.be.ok;
    });

    it('Should call #setMode', function () {
      var edit = overlay.editing;
      var spy = sinon.spy(edit, 'setMode');
      chai.simulateEvent(overlay.getElement(), 'dblclick');
      expect(spy.called).to.be.ok;

      edit.setMode.restore();
    });

    it('Will still update the mode of an initialized image with suppressToolbar: true', function() {
      var edit = ov2.editing;
      ov2.select();
      expect(edit.toolbar).to.be.undefined;
      expect(edit.nextMode()).to.be.ok;
    })
  });

  describe('#setMode', function() {
    it('Will return false if the passed value is not in the image\'s modes array', function() {
      var edit = overlay.editing;
      overlay.select();
      expect(edit.setMode('lock')).to.be.ok;
      expect(edit.setMode('blah')).to.be.false;
    });

    it('Will return false if image editing is not enabled', function() {
      var edit = overlay.editing;
      edit.disable();
      expect(edit.setMode('lock')).to.be.false;
    });

    it('Will return false if the passed mode is already the images mode', function() {
      var edit = overlay.editing;
      overlay.select();
      edit.setMode('distort');
      expect(edit.setMode('lock')).to.be.ok;
      expect(edit.setMode('lock')).to.be.false;
    });

    it('Will still update the mode of an initialized image with suppressToolbar: true', function () {
      var edit = ov2.editing;
      ov2.select();
      expect(edit.toolbar).to.be.undefined;
      expect(edit.setMode('lock')).to.be.ok;
    })
  });

  describe('#addTool', function() {
    it('Adds the passed tool to the end of the toolbar array', function() {
      var edit = overlay.editing;
      var tool = L.StackAction;
      expect(edit.hasTool(tool)).to.be.false;
      edit.addTool(tool);
      expect(edit.hasTool(tool)).to.be.true;
    });

    it('Does not add a tool that is already present', function() {
      var edit = overlay.editing;
      var tool = L.StackAction;
      expect(edit.addTool(tool)).to.be.ok;
      expect(edit.addTool(tool)).to.be.false;
    });
  });

  describe('#removeTool', function() {
    it('Removes the passed tool from the toolbar', function() {
      var edit = overlay.editing;
      var tool = L.BorderAction;
      expect(edit.hasTool(tool)).to.be.true;
      edit.removeTool(tool);
      expect(edit.hasTool(tool)).to.be.false;
    });

    it('Updates the modes & handles object if the removed tool is also a mode', function () {
      var edit = overlay.editing;
      var tool = L.ScaleAction;
      expect(edit.hasMode('scale')).to.be.true;
      edit.removeTool(tool);
      expect(edit.hasMode('scale')).to.be.false;
    });

    it('If the mode removed was the last it sets mode to empty string', function () {
      var edit = overlay.editing;

      for (var mode in L.DistortableImage.Edit.MODES) {
        edit.removeTool(L.DistortableImage.Edit.MODES[mode]);
      }

      expect(edit.getModes()).to.be.empty;
      expect(edit.getMode()).to.eql('');
    });

    it('Returns false if the tool is not in the toolbar', function() {
      var tool = L.StackAction;
      var edit = overlay.editing;
      expect(edit.hasTool(tool)).to.be.false;
      expect(edit.removeTool(tool)).to.be.false;
    });
  });
});
