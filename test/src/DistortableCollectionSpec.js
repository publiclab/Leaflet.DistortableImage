function simulateClick(el) {
  if (document.createEvent) {
    var e = document.createEvent('MouseEvents');
    e.initMouseEvent('mousedown', true, true, window,
      0, 0, 0, 0, 0, true, false, false, true, 0, null);
    return el.dispatchEvent(e);
  // } else if (el.fireEvent) {
  //   return el.fireEvent('mousedown');
  }
};

describe("L.DistortableCollection", function () {
  var map,
    overlay,
    overlay2,
    imageFeatureGroup;

  beforeEach(function (done) {
    map = new L.Map(L.DomUtil.create('div', '', document.body)).setView([41.7896, -87.5996], 15);

    overlay = new L.DistortableImageOverlay('/examples/example.png', {
      corners: [
        new L.LatLng(41.7934, -87.6052),
        new L.LatLng(41.7934, -87.5852),
        new L.LatLng(41.7834, -87.5852),
        new L.LatLng(41.7834, -87.6052)
      ]
    }).addTo(map);

    overlay2 = new L.DistortableImageOverlay('/examples/example.png', {
      corners: [
        new L.LatLng(41.7934, -87.6050),
        new L.LatLng(41.7934, -87.5850),
        new L.LatLng(41.7834, -87.5850),
        new L.LatLng(41.7834, -87.6050)
      ]
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    // L.DomEvent.on(overlay._image, 'load', function () {
    //   L.DomEvent.on(overlay2._image, 'load');
    //   done();
    // });

    L.DomEvent.on(overlay._image, 'load', function () { 
      overlay.editing.enable();
      overlay2.editing.enable();
      imageFeatureGroup = new L.DistortableCollection([overlay, overlay2]).addTo(map);
      done(); 
    });

    afterEach(function () {
      L.DomUtil.remove(overlay);
      L.DomUtil.remove(overlay2);
    });


    // overlay.editing.enable();
    // overlay2.editing.enable();

    // imageFeatureGroup = new L.DistortableCollection([overlay]).addTo(map);
  });
  it.skip("Should keep selected images in sync with eachother during translation", function () {
    L.DomUtil.addClass(overlay.getElement(), "selected");
    L.DomUtil.addClass(overlay2.getElement(), "selected");

    dragging = overlay.editing.dragging;
    dragging = overlay2.editing.dragging;

    overlay._reset();
    overlay2._reset();

    L.DomEvent.on(overlay, "dragstart", this._dragStartMultiple, this);
    L.DomEvent.on(overlay, "drag", this._dragMultiple, this);

    dragging._onDown({ touches: [{ clientX: 0, clientY: 0 }], target: overlay._image });
    dragging._onMove({ touches: [{ clientX: 20, clientY: 30 }], target: overlay._image });
    dragging._onUp();

    map.setView([41.7896, -87.6996]);


  });

  it("Should deselect all images on map click", function() {
    L.DomUtil.addClass(overlay.getElement(), "selected");
    L.DomUtil.addClass(overlay2.getElement(), "selected");

    map.fire('click');

    var classStr = L.DomUtil.getClass(overlay.getElement());
    var classStr2 = L.DomUtil.getClass(overlay2.getElement());

    expect(classStr).to.not.include("selected");
    expect(classStr2).to.not.include("selected");
  });

  it("Should allow selection of an image on command + click", function() {
   
    L.DomUtil.removeClass(overlay.getElement(), "selected");
    
    simulateClick(overlay.getElement());

    var classStr = L.DomUtil.getClass(overlay.getElement());

    expect(classStr).to.include("selected");
  });

  it("But it should now allow selection of a locked image", function() {
   
    L.DomUtil.removeClass(overlay.getElement(), "selected");
    overlay.editing._mode = "lock";

    simulateClick(overlay.getElement());

    var classStr = L.DomUtil.getClass(overlay.getElement());

    expect(classStr).to.not.include("selected");
  });


});
