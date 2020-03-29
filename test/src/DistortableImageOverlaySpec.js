describe('L.DistortableImageOverlay', function() {
  var map, overlay;

  beforeEach(function(done) {
    var mapContainer = L.DomUtil.create('div', '', document.body);
    var fullSize = [document.querySelector('html'), document.body, mapContainer];

    map = L.map(mapContainer).setView([41.7896, -87.5996], 15);

    /* Map and its containing elements need to have height and width set. */
    for (var i = 0, l = fullSize.length; i < l; i++) {
      fullSize[i].style.width = '100%';
      fullSize[i].style.height = '100%';
    }

    overlay = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.6052),
        L.latLng(41.7834, -87.5852),
      ],
    }).addTo(map);

    overlay2 = L.distortableImageOverlay('/examples/example.png', {
      corners: [
        L.latLng(41.7934, -87.6052),
        L.latLng(41.7934, -87.5852),
        L.latLng(41.7834, -87.6052),
        L.latLng(41.7834, -87.5852),
      ],
    }).addTo(map);

    /* Forces the image to load before any tests are run. */
    L.DomEvent.on(overlay.getElement(), 'load', function() {
      expect(map.getMaxZoom()).to.equal(Infinity); // before adding any background layers
      done();
    });

    afterEach(function() {
      L.DomUtil.remove(overlay);
    });
  });

  describe('#basic initialization', function() {
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

  describe('#_calculateProjectiveTransform', function() {
    it.skip('Should', function() {
      var matrix;

      /* _map is set when #onAdd is called. */
      overlay._map = map;
      overlay._initImage();

      matrix = overlay._calculateProjectiveTransform();
      expect(matrix).to.equal([]);
    });
  });

  describe('#select', function() {
    it('Allows programmatically selecting a single image', function() {
      expect(overlay._selected).to.be.false
      expect(overlay.editing.toolbar).to.be.undefined;

      overlay.select();

      setTimeout(function() {
        expect(overlay._selected).to.be.true;
        expect(overlay.editing.toolbar).to.be.true;
      }, 3000);
    });

    it('Is also invoked on image click', function() {
      overlay.getElement().click();
      expect(overlay.select).to.have.been.called;
    });

    it('Locked images can be selected', function() {
      overlay.editing._lock();
      overlay.getElement().click();
      setTimeout(function() {
        expect(overlay.editing.getMode()).to.eql('lock');
        expect(overlay._selected).to.be.true
        expect(overlay.editing.toolbar).to.be.true
      }, 3000);
    });

    it('Returns false if image editing is disabled', function() {
      overlay.editing.disable();
      expect(overlay.select()).to.be.false;
      expect(overlay._selected).to.be.false;
      expect(overlay.editing.toolbar).to.be.undefined;
    });

    it('Returns false if the multiple image editing interface is on', function() {
      L.DomUtil.addClass(overlay.getElement(), 'collected');
      expect(overlay.select()).to.be.false;
      expect(overlay._selected).to.be.false;
      expect(overlay.editing.toolbar).to.be.false;
    });
  });

  describe('#deselect', function() {
    beforeEach(function() { // select the image
      overlay.select();
      setTimeout(function() {
        expect(overlay._selected).to.be.true;
      }, 3000);
    });

    it('Allows programmatically deselecting a single image', function() {
      overlay.deselect();
      expect(overlay._selected).to.be.false;
    });

    it('Is invoked on map click', function() {
      map.fire('click');
      expect(overlay.deselect).to.have.been.called;
    });

    it('Returns false if image editing is disabled', function() {
      overlay.editing.disable();
      expect(overlay.deselect()).to.be.false;
      expect(overlay._selected).to.be.false;
    });

    it('Returns false if image is not selected', function() {
      expect(overlay.deselect()).to.be.ok;
      expect(overlay.deselect()).to.be.false;
    });
  });

  describe('#isSelected', function () {
    it('Only returns true for a selected image', function() {
      expect(overlay.isSelected()).to.be.false;
      overlay.select();
      expect(overlay.isSelected()).to.be.true;
    });
  });

  describe('#getCenter', function() {
    it('Should return the center when the outline of the image is a rectangle', function() {
      var center = overlay.getCenter();
      expect(center).to.be.closeToLatLng(L.latLng(41.7884, -87.5952));
    });
  });

  describe('#scaleBy', function() {
    it('Should not change image dimensions when passed a value of 1 or 0', function() {
      var img = overlay.getElement();
      var dims = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];

      overlay.scaleBy(1);

      var scaledDims = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];
      expect(dims).to.eql(scaledDims);

      overlay.scaleBy(0);

      var scaledDims2 = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];
      expect(dims).to.eql(scaledDims2);
    });

    it('Should invert image dimensions when passed a negative value', function() {
      var c2 = overlay.getCorner(2);
      var c3 = overlay.getCorner(3);

      overlay.scaleBy(-1);

      var scaledC = overlay.getCorner(0);
      var scaledC1 = overlay.getCorner(1);

      expect(Math.round(scaledC.lat)).to.equal(Math.round(c3.lat));
      expect(Math.round(scaledC.lng)).to.equal(Math.round(c3.lng));
      expect(Math.round(scaledC1.lat)).to.equal(Math.round(c2.lat));
      expect(Math.round(scaledC1.lng)).to.equal(Math.round(c2.lng));
    });

    it('Maintains image proportions when scaling', function() {
      var center = overlay.getCenter();
      expect(Math.round(overlay.getCenter().lat)).to.equal(Math.round(center.lat));
      expect(Math.round(overlay.getCenter().lng)).to.equal(Math.round(center.lng));
    });
  });

  describe('#rotateBy', function() {
    it('Should not rotate the image when passed a value of 0 or 360', function() {
      var corners = overlay.getCorners();

      overlay.rotateBy(0);
      expect(corners).to.eql(overlay.getCorners());

      overlay.rotateBy(360);
      expect(corners).to.eql(overlay.getCorners());
    });

    it('Should rotate the image by the specified units, otherwise by degrees', function() {
      var c1 = overlay.getCorner(0);
      var c2 = overlay.getCorner(1);
      var c3 = overlay.getCorner(2);
      var c4 = overlay.getCorner(3);

      overlay.rotateBy(180);
      expect([overlay.getCorner(2), overlay.getCorner(3)].members).to.equal([c1, c2].members);

      overlay.rotateBy(180, 'deg');
      expect([overlay.getCorner(2), overlay.getCorner(3)].members).to.equal([c3, c4].members);

      overlay.rotateBy(Math.PI, 'rad');
      expect([overlay.getCorner(2), overlay.getCorner(3)].members).to.equal([c1, c2].members);
    });

    it('Rotates the image counter clockwise for negative values', function() {
      expect(overlay.getCorners().members).to.equal(overlay2.getCorners().members);

      overlay.rotateBy(-45);
      overlay2.getElement().style.transform += ' rotate(-45deg)';

      expect(overlay.getCorners().members).to.equal(overlay2.getCorners().members);
    });

    it('Rotates the image by the remainder for values higher than the degrees in a circle', function() {
      expect(overlay.getCorners().members).to.equal(overlay2.getCorners().members);
      overlay.rotateBy(380);
      overlay2.rotateBy(20);
      expect(overlay.getCorners().members).to.equal(overlay2.getCorners().members);
    });
  });

  describe('#getAngle', function() {
    it('Returns the image\'s rotation angle in the specified units, otherwise in degrees', function() {
      overlay.rotateBy(180);
      expect(overlay.getAngle()).to.equal(180);
      expect(overlay.getAngle('deg')).to.equal(180);
      expect(overlay.getAngle('rad')).to.equal(3.14);
    });

    it('Returns the correct angle even when the image is flipped', function() {
      var c1 = overlay.getCorner(0);
      var c2 = overlay.getCorner(1);
      var c3 = overlay.getCorner(2);
      var c4 = overlay.getCorner(3);

      expect(overlay.getAngle()).to.equal(0);
      overlay.setCorners({ 0: c3, 1: c4, 2: c1, 3: c2 });
      expect(overlay.getAngle()).to.equal(180);
    });

    it('Always returns a number greater than or equal to 0', function() {
      expect(overlay.getAngle()).to.equal(0);
      overlay.rotateBy(-45);
      expect(overlay.getAngle()).to.equal(315);
    });
  });

  describe('#setAngle', function() {
    it('Sets the image\'s rotation angle in the specified units, otherwise in degrees', function() {
      overlay.setAngle(45);
      expect(overlay.getAngle('deg')).to.equal(45);

      overlay.setAngle(90, 'deg');
      expect(overlay.getAngle('deg')).to.equal(90);
      expect(overlay.getAngle('rad')).to.equal(1.57);

      overlay.setAngle(3.14, 'rad');
      expect(overlay.getAngle('deg')).to.equal(180);
      expect(overlay.getAngle('rad')).to.equal(3.14);
    });

    it('Sets the image\'s rotation angle to the remainder for values higher than the degrees in a circle', function() {
      overlay.setAngle(380);
      expect(overlay.getAngle('deg')).to.equal(20);
    });

    it('Subtracts negative values from the total degrees in a circle', function() {
      overlay.setAngle(-340);
      expect(overlay.getAngle('deg')).to.equal(20);
    });

    it('Sets the correct angle even when the image is flipped', function() {
      var c1 = overlay.getCorner(0);
      var c2 = overlay.getCorner(1);
      var c3 = overlay.getCorner(2);
      var c4 = overlay.getCorner(3);

      expect(overlay.getAngle()).to.equal(0);
      overlay.setCorners({ 0: c3, 1: c4, 2: c1, 3: c2 });
      expect(overlay.getAngle()).to.equal(180);
      overlay.setAngle(0);
      expect(overlay.getAngle()).to.equal(0);
    });
  });
});
