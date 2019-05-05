describe("L.DistortableCollection", function () {
  var map,
    overlay,
    overlay2,
    imageFeatureGroup;

  beforeEach(function (done) {
    map = L.map(L.DomUtil.create('div', '', document.body)).setView([41.7896, -87.5996], 15);

    overlay = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        new L.LatLng(41.7934, -87.6052),
        new L.LatLng(41.7934, -87.5852),
        new L.LatLng(41.7834, -87.5852),
        new L.LatLng(41.7834, -87.6052)
      ]
    }).addTo(map);

    overlay2 = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        new L.LatLng(41.7934, -87.6050),
        new L.LatLng(41.7934, -87.5850),
        new L.LatLng(41.7834, -87.5850),
        new L.LatLng(41.7834, -87.6050)
      ]
    }).addTo(map);

    /* Forces the images and feature group to load before any tests are run. */
    L.DomEvent.on(overlay._image, 'load', function () { 
      overlay.editing.enable();
      overlay2.editing.enable();
      imageFeatureGroup = L.distortableCollection([overlay, overlay2]).addTo(map);
      done(); 
    });

    afterEach(function () {
      L.DomUtil.remove(overlay);
      L.DomUtil.remove(overlay2);
    });

  });

  it.skip("Should keep selected images in sync with eachother during translation", function () {

  });

  describe("#_deselectAll", function () {
    it("Should deselect all images on map click", function() {
      L.DomUtil.addClass(overlay.getElement(), "selected");
      L.DomUtil.addClass(overlay2.getElement(), "selected");

      map.fire('click');

      var classStr = L.DomUtil.getClass(overlay.getElement());
      var classStr2 = L.DomUtil.getClass(overlay2.getElement());

      expect(classStr).to.not.include("selected");
      expect(classStr2).to.not.include("selected");
    });
  });

  describe("#_deselectAll", function () {
    it("Should hide all images' handles unless they're lock handles", function() {
      var edit1 = overlay.editing,
        edit2 = overlay2.editing;

      // turn on lock handles for one of the DistortableImages
      edit2._toggleLock();

      // then trigger _deselectAll
      map.fire('click');

      var distortHandleState = [];
      edit1._handles["distort"].eachLayer(function (handle) {
        distortHandleState.push(handle._icon.style.opacity)
      });

      var lockHandleState = [];
      edit2._handles["lock"].eachLayer(function (handle) {
        lockHandleState.push(handle._icon.style.opacity)
      });

      expect(distortHandleState).to.deep.equal(["0", "0", "0", "0"]);
      // opacity for lockHandles is unset because we never altered it to hide it as part of deselection
      expect(lockHandleState).to.deep.equal(["", "", "", ""]); 
    });
  });

  describe("#_toggleMultiSelect", function () {
    it("Should allow selection of multiple images on command + click", function() {
      chai.simulateCommandMousedown(overlay.getElement());
      chai.simulateCommandMousedown(overlay2.getElement());

      var classStr = L.DomUtil.getClass(overlay.getElement());
      var classStr2 = L.DomUtil.getClass(overlay2.getElement());

      expect(classStr).to.include("selected");
      expect(classStr2).to.include("selected");
    });

    it("But it should not allow selection of a locked image", function() {
      L.DomUtil.removeClass(overlay.getElement(), "selected");
      overlay.editing._mode = "lock";

      chai.simulateCommandMousedown(overlay.getElement());
      var classStr = L.DomUtil.getClass(overlay.getElement());

      expect(classStr).to.not.include("selected");
    });
  });

});
