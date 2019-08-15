describe('L.DistortableCollection', function () {
    var map,
        overlay,
        overlay2,
        imgGroup;

    beforeEach(function (done) {
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
                L.latLng(41.7934, -87.6050),
                L.latLng(41.7934, -87.5850),
                L.latLng(41.7834, -87.6050),
                L.latLng(41.7834, -87.5850)
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
        L.DomEvent.on(overlay3, 'load', function () { done(); });
    });

    afterEach(function () {
        imgGroup.removeLayer(overlay);
        imgGroup.removeLayer(overlay2);
        imgGroup.removeLayer(overlay3);
    });

    it.skip('Should keep selected images in sync with eachother during translation', function () {

    });

    it('Adds the layers to the map when they are added to the group', function () {
        expect(map.hasLayer(overlay)).to.be.true;
        expect(map.hasLayer(overlay2)).to.be.true;
        expect(map.hasLayer(overlay3)).to.be.true;
    });

    describe('#isSelected', function () {
        it('Should only return true if the image was selected using shift + mousedown', function() {
            var img = overlay.getElement(),
                img2 = overlay2.getElement();
            
            chai.simulateShiftMousedown(img);
            chai.simulateMousedown(img2);
        
            expect(imgGroup.isSelected(overlay)).to.be.true;
            expect(imgGroup.isSelected(overlay2)).to.be.false;
        });
    });

    describe('#anySelected', function () {
        it('Should return false if no selections were made with shift + mousedown', function() {
            var img = overlay.getElement(),
                img2 = overlay2.getElement();
            
            chai.simulateMousedown(img);
            chai.simulateMousedown(img2);
              
            expect(imgGroup.isSelected(overlay)).to.be.false;
            expect(imgGroup.isSelected(overlay2)).to.be.false;
        });
    });

    describe('#_toggleMultiSelect', function () {
        it('Should allow multiple image selection on shift + click', function() {
            var img = overlay.getElement(),
                img2 = overlay2.getElement();

            chai.simulateShiftMousedown(img);
            chai.simulateShiftMousedown(img2);

            expect(L.DomUtil.getClass(img)).to.include('selected');
            expect(L.DomUtil.getClass(img2)).to.include('selected');
        });

        it('It should allow a locked image to be part of multiple image selection', function() {
            var img = overlay.getElement();

            overlay.editing._toggleLock();
            chai.simulateShiftMousedown(img);

            expect(L.DomUtil.getClass(img)).to.include('selected');
        });
    });
});
