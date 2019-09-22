describe('L.DistortableCollection', function() {
  var map, overlay, overlay2, imgGroup;

  beforeEach(function(done) {
    map = L.map(L.DomUtil.create('div', '', document.body)).setView([41.7896, -87.5996], 15);

    overlay = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.6052),
        L.latLng(41.7834, -87.5852)
      ]
    });

    overlay2 = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.605),
        L.latLng(41.7934, -87.585),
        L.latLng(41.7834, -87.605),
        L.latLng(41.7834, -87.585)
      ]
    });

    overlay3 = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.6054),
        L.latLng(41.7934, -87.5854),
        L.latLng(41.7834, -87.6054),
        L.latLng(41.7834, -87.5854)
      ]
    });

    imgGroup = L.distortableCollection().addTo(map);

    imgGroup.addLayer(overlay);
    imgGroup.addLayer(overlay2);
    imgGroup.addLayer(overlay3);

    /* Forces the images to load before any tests are run. */
    L.DomEvent.on(overlay3, 'load', function() { done(); });
  });

  afterEach(function() {
    imgGroup.removeLayer(overlay);
    imgGroup.removeLayer(overlay2);
    imgGroup.removeLayer(overlay3);
  });

  it.skip('Should keep selected images in sync with eachother during translation', function() {});

  it('Adds the layers to the map when they are added to the group', function() {
    expect(map.hasLayer(overlay)).to.be.true;
    expect(map.hasLayer(overlay2)).to.be.true;
    expect(map.hasLayer(overlay3)).to.be.true;
  });

  describe('#isCollected', function() {
    it('Should only return true if the image was selected using shift + mousedown', function() {
      var img = overlay.getElement();
      var img2 = overlay2.getElement();

      chai.simulateEvent(img, chai.mouseEvents.ShiftMouseDown);
      chai.simulateEvent(img2, chai.mouseEvents.MouseDown);

      expect(imgGroup.isCollected(overlay)).to.be.true;
      expect(imgGroup.isCollected(overlay2)).to.be.false;
    });
  });

  describe('#anyCollected', function() {
    it('Should return false if no selections were made with shift + mousedown', function() {
      var img = overlay.getElement();
      var img2 = overlay2.getElement();

      chai.simulateEvent(img, chai.mouseEvents.MouseDown);
      chai.simulateEvent(img2, chai.mouseEvents.MouseDown);

      expect(imgGroup.isCollected(overlay)).to.be.false;
      expect(imgGroup.isCollected(overlay2)).to.be.false;
    });
  });

  describe('#_toggleCollected', function() {
    it('Should allow multiple image selection on shift + click', function() {
      var img = overlay.getElement();
      var img2 = overlay2.getElement();

      chai.simulateEvent(img, chai.mouseEvents.ShiftMouseDown);
      chai.simulateEvent(img2, chai.mouseEvents.ShiftMouseDown);

      expect(L.DomUtil.getClass(img)).to.include('collected');
      expect(L.DomUtil.getClass(img2)).to.include('collected');
    });

    it('It should allow a locked image to be part of multiple image selection', function() {
      var img = overlay.getElement();

      overlay.editing._toggleLockMode();
      chai.simulateEvent(img, chai.mouseEvents.ShiftMouseDown);

      expect(L.DomUtil.getClass(img)).to.include('collected');
    });
  });
});
