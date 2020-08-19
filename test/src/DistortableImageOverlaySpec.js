/* jshint -W030 */
describe('L.DistortableImageOverlay', function() {
  var map, ov;

  beforeEach(function(done) {
    var mapContainer = L.DomUtil.create('div', '', document.body);
    var fullSize = [document.querySelector('html'), document.body, mapContainer];

    map = L.map(mapContainer).setView([41.7896, -87.5996], 15);

    /* Map and its containing elements need to have height and width set. */
    for (var i = 0, l = fullSize.length; i < l; i++) {
      fullSize[i].style.width = '100%';
      fullSize[i].style.height = '100%';
    }

    ov = L.distortableImageOverlay('/examples/example.jpg', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.6052),
        L.latLng(41.7834, -87.5852),
      ],
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(ov.getElement(), 'load', function() {
      expect(map.getMaxZoom()).to.equal(Infinity); // before adding any background layers
      done();
    });

    afterEach(function() {
      L.DomUtil.remove(ov);
    });
  });

  describe('initialization', function() {
    // we need a maxZoom of 24 so that images of very small areas may be distorted against
    // one another even if the background imagery is not good enough to be useful.
    it('should add Google tile base layer via Google Mutant library, with maxZoom of 24', function(done) {
      map.addGoogleMutant();

      map.whenReady(function() {
        expect(map.getMaxZoom()).to.equal(24);
        done();
      });
    });
  });

  describe('initialization: actions option', function() {
    it('The image will be initialized with a default set of actions if not passed', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.jpg', {}).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        expect(ov2.editing.editActions.length).to.eq(10);
        done();
      });
    });

    it('Will initialize the image with the passed array of actions', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.jpg', {
        actions: [L.ScaleAction, L.RestoreAction, L.RotateAction]
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        expect(ov2.editing.editActions.length).to.eq(3);
        done();
      });
    });

    it('Will initialize an image with no actions if passed an empty array', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.jpg', {
        actions: [],
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        expect(ov2.editing).to.be.ok;
        expect(ov2.editing.editActions.length).to.eq(0);
        done();
      });
    });
  });

  describe('initialization: mode option', function() {
    it('Will initialize the image with the passed mode, if available', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.jpg', {
        mode: 'rotate',
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        expect(ov2.editing.getMode()).to.eq('rotate');
        done();
      });
    });

    it('A mode is unavailable if it either does not exist or is restricted via the `actions` option', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.jpg', {
        mode: 'blah',
      }).addTo(map);

      var ov3 = L.distortableImageOverlay('/examples/example.jpg', {
        mode: 'rotate',
        actions: [L.ScaleAction, L.BorderAction],
      }).addTo(map);

      L.DomEvent.on(ov3.getElement(), 'load', function() {
        expect(ov2.editing.getMode()).to.not.eq('blah');
        expect(ov3.editing.getMode()).to.not.eq('rotate');
        done();
      });
    });

    it('If the mode is unavailable, the image\'s mode will be the 1st available one', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.jpg', {
        mode: 'blah',
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        expect(ov2.editing.editActions[0]).to.eq(L.DragAction);
        expect(ov2.editing.getMode()).to.eq('drag');
        done();
      });
    });

    it('If not passed, the image will have the default mode, `distort` if available', function(done) {
      var ov2 = L.distortableImageOverlay('/examples/example.jpg', {}).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        expect(ov2.editing.getMode()).to.eq('distort');
        done();
      });
    });
  });

  describe('#_calculateProjectiveTransform', function() {
    it.skip('Should', function() {
      var matrix;

      /* _map is set when #onAdd is called. */
      ov._map = map;
      ov._initImage();

      matrix = ov._calculateProjectiveTransform();
      expect(matrix).to.equal([]);
    });
  });

  describe('#select', function() {
    it('Allows programmatically selecting a single image', function() {
      expect(ov._selected).to.be.false;
      expect(ov.editing.toolbar).to.be.undefined;

      ov.select();

      setTimeout(function() {
        expect(ov._selected).to.be.true;
        expect(ov.editing.toolbar).to.be.true;
      }, 3000);
    });

    it('Is invoked on image click', function() {
      let ovSpy = sinon.spy();
      ov.on('select', ovSpy);
      ov.getElement().click();
      expect(ovSpy.called).to.be.true;
    });

    it('Locked images can be selected', function() {
      ov.editing._lock();
      ov.getElement().click();
      setTimeout(function() {
        expect(ov.editing.getMode()).to.eql('lock');
        expect(ov._selected).to.be.true;
        expect(ov.editing.toolbar).to.be.true;
      }, 3000);
    });

    it('Returns undefined if image editing is disabled', function() {
      ov.editing.disable();
      expect(ov.select()).to.be.undefined;
      expect(ov._selected).to.be.false;
      expect(ov.editing.toolbar).to.be.undefined;
    });

    it('Returns undefined if the multiple image editing interface is on', function() {
      ov.eP = {};
      ov.eP.anyCollected = function propFn() {
        var layerArr = this.getLayers();
        return layerArr.some(this.isCollected.bind(this));
      };

      sinon.stub(ov.eP, 'anyCollected').callsFake(function fakeFn() {
        return L.DomUtil.hasClass(ov.getElement(), 'collected');
      });

      L.DomUtil.addClass(ov.getElement(), 'collected');
      expect(ov.select()).to.be.undefined;
      expect(ov._selected).to.be.false;
      expect(ov.editing.toolbar).to.be.false;
    });
  });

  describe('#deselect', function() {
    beforeEach(function() {
      ov.select();
      setTimeout(function() {
        expect(ov._selected).to.be.true;
        expect(ov.editing.toolbar).to.be.true;
      }, 3000);
    });

    it('Allows programmatically deselecting a single image', function() {
      ov.deselect();
      expect(ov._selected).to.be.false;
    });

    it('Is invoked on map click', function() {
      let ovSpy = sinon.spy();
      ov.on('deselect', ovSpy);
      map.getContainer().click();
      setTimeout(function() {
        expect(ovSpy.called).to.be.true;
      }, 3000);
    });

    it('Returns undefined if image editing is disabled', function() {
      ov.editing.disable();
      expect(ov.deselect()).to.be.undefined;
    });
  });

  describe('#isSelected', function () {
    it('Only returns true for a selected image', function() {
      expect(ov.isSelected()).to.be.false;
      ov.select();
      expect(ov.isSelected()).to.be.true;
    });
  });

  describe('#getCenter', function() {
    it('Should return the center when the outline of the image is a rectangle', function() {
      var center = ov.getCenter();
      expect(center).to.be.closeToLatLng(L.latLng(41.7884, -87.5952));
    });
  });

  describe('#scaleBy', function() {
    it('Should not change image dimensions when passed a value of 1 or 0', function() {
      var img = ov.getElement();
      var dims = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];

      ov.scaleBy(1);

      var scaledDims = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];
      expect(dims).to.eql(scaledDims);

      ov.scaleBy(0);

      var scaledDims2 = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];
      expect(dims).to.eql(scaledDims2);
    });

    it('Should invert image dimensions when passed a negative value', function() {
      var c2 = ov.getCorner(2);
      var c3 = ov.getCorner(3);

      ov.scaleBy(-1);

      var scaledC = ov.getCorner(0);
      var scaledC1 = ov.getCorner(1);

      expect(Math.round(scaledC.lat)).to.equal(Math.round(c3.lat));
      expect(Math.round(scaledC.lng)).to.equal(Math.round(c3.lng));
      expect(Math.round(scaledC1.lat)).to.equal(Math.round(c2.lat));
      expect(Math.round(scaledC1.lng)).to.equal(Math.round(c2.lng));
    });

    it('Maintains image proportions when scaling', function() {
      var center = ov.getCenter();
      expect(Math.round(ov.getCenter().lat)).to.equal(Math.round(center.lat));
      expect(Math.round(ov.getCenter().lng)).to.equal(Math.round(center.lng));
    });
  });

  describe('#rotateBy', function() {
    var ov2;

    beforeEach(function(done) {
      ov2 = L.distortableImageOverlay('/examples/example.jpg', {
        corners: [
          L.latLng(41.7934, -87.6052),
          L.latLng(41.7934, -87.5852),
          L.latLng(41.7834, -87.6052),
          L.latLng(41.7834, -87.5852),
        ],
      }).addTo(map);

      L.DomEvent.on(ov2.getElement(), 'load', function() {
        done();
      });
    });

    afterEach(function() {
      L.DomUtil.remove(ov2);
    });

    it('Should not rotate the image when passed a value of 0 or 360', function() {
      var corners = ov.getCorners();

      ov.rotateBy(0);
      expect(corners).to.eql(ov.getCorners());

      ov.rotateBy(360);
      expect(corners).to.eql(ov.getCorners());
    });

    it('Should rotate the image by the specified units, otherwise by degrees', function() {
      var c1 = ov.getCorner(0);
      var c2 = ov.getCorner(1);
      var c3 = ov.getCorner(2);
      var c4 = ov.getCorner(3);

      ov.rotateBy(180);
      expect([ov.getCorner(2), ov.getCorner(3)].members).to.equal([c1, c2].members);

      ov.rotateBy(180, 'deg');
      expect([ov.getCorner(2), ov.getCorner(3)].members).to.equal([c3, c4].members);

      ov.rotateBy(Math.PI, 'rad');
      expect([ov.getCorner(2), ov.getCorner(3)].members).to.equal([c1, c2].members);
    });

    it('Rotates the image counter clockwise for negative values', function() {
      expect(ov.getCorners().members).to.equal(ov2.getCorners().members);

      ov.rotateBy(-45);
      ov2.getElement().style.transform += ' rotate(-45deg)';

      expect(ov.getCorners().members).to.equal(ov2.getCorners().members);
    });

    it('Rotates the image by the remainder for values higher than the degrees in a circle', function() {
      expect(ov.getCorners().members).to.equal(ov2.getCorners().members);
      ov.rotateBy(380);
      ov2.rotateBy(20);
      expect(ov.getCorners().members).to.equal(ov2.getCorners().members);
    });
  });

  describe('#getAngle', function() {
    it('Returns the image\'s rotation angle in the specified units, otherwise in degrees', function() {
      ov.rotateBy(180);
      expect(ov.getAngle()).to.equal(180);
      expect(ov.getAngle('deg')).to.equal(180);
      expect(ov.getAngle('rad')).to.equal(3.14);
    });

    it('Returns the correct angle even when the image is flipped', function() {
      var c1 = ov.getCorner(0);
      var c2 = ov.getCorner(1);
      var c3 = ov.getCorner(2);
      var c4 = ov.getCorner(3);

      expect(ov.getAngle()).to.equal(0);
      ov.setCorners({ 0: c3, 1: c4, 2: c1, 3: c2 });
      expect(ov.getAngle()).to.equal(180);
    });

    it('Always returns a number greater than or equal to 0', function() {
      expect(ov.getAngle()).to.equal(0);
      ov.rotateBy(-45);
      expect(ov.getAngle()).to.equal(315);
    });
  });

  describe('#setAngle', function() {
    it('Sets the image\'s rotation angle in the specified units, otherwise in degrees', function() {
      ov.setAngle(45);
      expect(ov.getAngle('deg')).to.equal(45);

      ov.setAngle(90, 'deg');
      expect(ov.getAngle('deg')).to.equal(90);
      expect(ov.getAngle('rad')).to.equal(1.57);

      ov.setAngle(3.14, 'rad');
      expect(ov.getAngle('deg')).to.equal(180);
      expect(ov.getAngle('rad')).to.equal(3.14);
    });

    it('Sets the image\'s rotation angle to the remainder for values higher than the degrees in a circle', function() {
      ov.setAngle(380);
      expect(ov.getAngle('deg')).to.equal(20);
    });

    it('Subtracts negative values from the total degrees in a circle', function() {
      ov.setAngle(-340);
      expect(ov.getAngle('deg')).to.equal(20);
    });

    it('Sets the correct angle even when the image is flipped', function() {
      var c1 = ov.getCorner(0);
      var c2 = ov.getCorner(1);
      var c3 = ov.getCorner(2);
      var c4 = ov.getCorner(3);

      expect(ov.getAngle()).to.equal(0);
      ov.setCorners({ 0: c3, 1: c4, 2: c1, 3: c2 });
      expect(ov.getAngle()).to.equal(180);
      ov.setAngle(0);
      expect(ov.getAngle()).to.equal(0);
    });
  });
});
