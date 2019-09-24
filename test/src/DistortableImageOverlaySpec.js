// describe('L.DistortableImageOverlay', function() {
//   var map, overlay;

//   beforeEach(function(done) {
//     var mapContainer = L.DomUtil.create('div', '', document.body);
//     var fullSize = [document.querySelector('html'), document.body, mapContainer];

//     map = L.map(mapContainer).setView([41.7896, -87.5996], 15);

//     /* Map and its containing elements need to have height and width set. */
//     for (var i = 0, l = fullSize.length; i < l; i++) {
//       fullSize[i].style.width = '100%';
//       fullSize[i].style.height = '100%';
//     }

//     overlay = L.distortableImageOverlay('/examples/example.png', {
//       corners: [
//         L.latLng(41.7934, -87.6052),
//         L.latLng(41.7934, -87.5852),
//         L.latLng(41.7834, -87.6052),
//         L.latLng(41.7834, -87.5852),
//       ],
//     }).addTo(map);

//     /* Forces the image to load before any tests are run. */
//     L.DomEvent.on(overlay._image, 'load', function() { done(); });

//     afterEach(function() {
//       L.DomUtil.remove(overlay);
//     });
//   });

//   describe('#_calculateProjectiveTransform', function() {
//     it.skip('Should', function() {
//       var matrix;

//       /* _map is set when #onAdd is called. */
//       overlay._map = map;
//       overlay._initImage();

//       matrix = overlay._calculateProjectiveTransform();
//       expect(matrix).to.equal([]);
//     });
//   });

//   describe('#select', function() {
//     it('Allows programmatically selecting a single image', function() {
//       expect(overlay._selected).to.be.false
//       expect(overlay.editing.toolbar).to.be.undefined
      
//       overlay.select();

//       setTimeout(function() {
//         expect(overlay._selected).to.be.true
//         expect(overlay.editing.toolbar).to.be.true
//       }, 3000);
//     });

//     it('Is also invoked on image click', function() {
//       overlay.getElement().click();
//       expect(overlay.select).to.have.been.called;
//     });

//     it('Locked images can be selected', function() {
//       overlay.editing._lock();
//       overlay.getElement().click();
//       setTimeout(function () {
//         expect(overlay.editing.getMode()).to.eql('lock');
//         expect(overlay._selected).to.be.true
//         expect(overlay.editing.toolbar).to.be.true
//       }, 3000);
//     });

//     it('Returns false if image editing is disabled', function() {
//       overlay.editing.disable();
//       expect(overlay.select()).to.be.false
//       expect(overlay._selected).to.be.false
//       expect(overlay.editing.toolbar).to.be.undefined
//     });
    
//     it('Returns false if the multiple image editing interface is on', function() {
//       L.DomUtil.addClass(overlay.getElement(), 'collected');
//       expect(overlay.select()).to.be.false
//       expect(overlay._selected).to.be.false
//       expect(overlay.editing.toolbar).to.be.false
//     });
//   });

//   describe('#deselect', function() {
//     beforeEach(function () { // select the image
//       overlay.select();
//       setTimeout(function() {
//         expect(overlay._selected).to.be.true
//       }, 3000);
//     });

//     it('Allows programmatically deselecting a single image', function() {
//       overlay.deselect();
//       expect(overlay._selected).to.be.false
//     });

//     it('Is invoked on map click', function() {
//       map.fire('click');
//       expect(overlay.deselect).to.have.been.called;
//     });

//     it('It should hide an unlocked image\'s handles by updating their opacity', function () {
//       var edit = overlay.editing;

//       // then trigger deselect
//       map.fire('click');

//       var handleState = [];
//       edit.currentHandle.eachLayer(function(handle) {
//         var icon = handle.getElement();
//         handleState.push(L.DomUtil.getStyle(icon, 'opacity'));
//       });

//       setTimeout(function() {
//         expect(handleState).to.deep.equal(['0', '0', '0', '0']);
//       }, 3000);
//     });

//     it('But it should not hide a locked image\'s handles', function () {
//       var edit = overlay.editing;

//       // switch to lock handles
//       edit._toggleLockMode();
//       // then trigger _deselect
//       map.fire('click');

//       var lockHandleState = [];
//       edit.currentHandle.eachLayer(function (handle) {
//         var icon = handle.getElement();
//         lockHandleState.push(L.DomUtil.getStyle(icon, 'opacity'));
//       });

//       expect(lockHandleState).to.deep.equal(['1', '1', '1', '1']);
//     });

//     it('Should remove an image\'s individual toolbar instance regardless of lock handles', function () {
//       var edit = overlay.editing;
//       var img = overlay.getElement();

//       edit.enable();
//       // switch to lock handles
//       edit._toggleLockMode();
//       // select the image to initially create its individual toolbar instance
//       chai.simulateEvent(img, chai.mouseEvents.Click);

//       expect(edit.toolbar).to.not.be.false;

//       // then trigger _deselect
//       map.fire('click');

//       // we deselect after 3ms to confirm the click wasn't a dblclick
//       setTimeout(function () {
//         expect(edit.toolbar).to.be.false;
//       }, 3000);
//     });

//     it('Returns false if image editing is disabled', function() {
//       overlay.editing.disable();
//       expect(overlay.deselect()).to.be.false
//       expect(overlay._selected).to.be.false
//     });

//     it('Returns false if image is not selected', function() {
//       expect(overlay.deselect()).to.be.ok
//       expect(overlay.deselect()).to.be.false
//     });
//   });

//   describe('#isSelected', function () {
//     it('Only returns true for a selected image', function () {
//       expect(overlay.isSelected()).to.be.false
//       overlay.select();
//       expect(overlay.isSelected()).to.be.true
//     });
//   });

//   describe('#getCenter', function() {
//     it('Should return the center when the outline of the image is a rectangle', function() {
//       var center = overlay.getCenter();
//       expect(center).to.be.closeToLatLng(L.latLng(41.7884, -87.5952));
//     });
//   });

//   describe('#scaleBy', function() {
//     it('Should not change image dimensions when passed a value of 1 or 0', function() {
//       var img = overlay.getElement();
//       var dims = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];

//       overlay.scaleBy(1);

//       var scaledDims = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];
//       expect(dims).to.eql(scaledDims);

//       overlay.scaleBy(0);

//       var scaledDims2 = [img.getBoundingClientRect().width, img.getBoundingClientRect().height];
//       expect(dims).to.eql(scaledDims2);
//     });

//     it('Should invert image dimensions when passed a negative value', function() {
//       var c2 = overlay.getCorner(2);
//       var c3 = overlay.getCorner(3);

//       overlay.scaleBy(-1);

//       var scaledC = overlay.getCorner(0);
//       var scaledC1 = overlay.getCorner(1);

//       expect(Math.round(scaledC.lat)).to.equal(Math.round(c3.lat));
//       expect(Math.round(scaledC.lng)).to.equal(Math.round(c3.lng));
//       expect(Math.round(scaledC1.lat)).to.equal(Math.round(c2.lat));
//       expect(Math.round(scaledC1.lng)).to.equal(Math.round(c2.lng));
//     });

//     it('Maintains image proportions when scaling', function() {
//       var center = overlay.getCenter();

//       expect(Math.round(overlay.getCenter().lat)).to.equal(Math.round(center.lat));
//       expect(Math.round(overlay.getCenter().lng)).to.equal(Math.round(center.lng));
//     });
//   });
// });
