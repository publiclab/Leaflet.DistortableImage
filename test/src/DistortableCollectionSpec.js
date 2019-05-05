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
    it("Should remove the 'selected' class from all images", function() {
      var img = overlay.getElement(),
        img2 = overlay2.getElement();

      L.DomUtil.addClass(img, "selected");
      L.DomUtil.addClass(img2, "selected");

      map.fire('click');

      var classStr = L.DomUtil.getClass(img);
      expect(classStr).to.not.include("selected");

      var classStr2 = L.DomUtil.getClass(img2);
      expect(classStr2).to.not.include("selected");
    });

    it("Should hide all images' handles unless they're lock handles", function() {
      var edit = overlay.editing,
        edit2 = overlay2.editing;

      // turn on lock handles for one of the DistortableImages
      edit2._toggleLock();

      // then trigger _deselectAll
      map.fire('click');

      var distortHandleState = [];
      edit._handles["distort"].eachLayer(function (handle) {
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

    it("Should remove all images' individual toolbar instances regardless of lock handles", function() {
      var edit = overlay.editing,
        edit2 = overlay2.editing,
        img = overlay.getElement(),
        img2 = overlay2.getElement();

      // turn on lock handles for one of the DistortableImages
      edit2._toggleLock();

      // select both images to initially create individual toolbar instances
      chai.simulateClick(img);
      chai.simulateClick(img2);

      expect(edit.toolbar).to.not.be.false
      expect(edit2.toolbar).to.not.be.false

      // then trigger _deselectAll
      map.fire('click');

      expect(edit.toolbar).to.be.false
      expect(edit2.toolbar).to.be.false
    });
  });

  describe("#_toggleMultiSelect", function () {
    it("Should allow multiple image selection on command + click", function() {
      var img = overlay.getElement(),
        img2 = overlay2.getElement();

      chai.simulateCommandMousedown(img);
      chai.simulateCommandMousedown(img2);

      var classStr = L.DomUtil.getClass(img);
      expect(classStr).to.include("selected");

      var classStr2 = L.DomUtil.getClass(img2);
      expect(classStr2).to.include("selected");
    });

    it("But it should not allow a locked image to be part of multiple image selection", function() {
        var img = overlay.getElement();

      overlay.editing._toggleLock();
      chai.simulateCommandMousedown(img);

      var classStr = L.DomUtil.getClass(img);
      expect(classStr).to.not.include("selected");
    });
  });

});
