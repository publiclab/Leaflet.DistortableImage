describe("L.DistortableCollection", function () {
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

    it.skip("Should keep selected images in sync with eachother during translation", function () {

    });

    it("Adds the layers to the map when they are added to the group", function () {
        expect(map.hasLayer(overlay)).to.be.true;
        expect(map.hasLayer(overlay2)).to.be.true;
        expect(map.hasLayer(overlay3)).to.be.true;
    });

    describe("#isSelected", function () {
        it("Should only return true if the image was selected using command + mousedown", function() {
            var img = overlay.getElement(),
                img2 = overlay2.getElement();
            
            chai.simulateCommandMousedown(img);
            chai.simulateMousedown(img2);
              
            var value = imgGroup.isSelected(overlay);
            expect(value).to.be.true;

            var value2 = imgGroup.isSelected(overlay2);
            expect(value2).to.be.false;
        });
    });

    describe("#anySelected", function () {
        it("Should return false if no selections were made with command + mousedown", function() {
            var img = overlay.getElement(),
                img2 = overlay2.getElement();
            
            chai.simulateMousedown(img);
            chai.simulateMousedown(img2);
              
            var value = imgGroup.isSelected(overlay);
            expect(value).to.be.false;

            var value2 = imgGroup.isSelected(overlay2);
            expect(value2).to.be.false;
        });
    });

    describe("#_deselectAll", function() {
        it("Should remove the 'selected' class from all images", function() {
            var img = overlay.getElement(),
                img2 = overlay2.getElement();

            L.DomUtil.addClass(img, "selected");
            L.DomUtil.addClass(img2, "selected");

            map.fire("click");

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
            map.fire("click");

            var distortHandleState = [];
            edit._handles["distort"].eachLayer(function(handle) {
              distortHandleState.push(handle._icon.style.opacity);
            });

            var lockHandleState = [];
            edit2._handles["lock"].eachLayer(function(handle) {
              lockHandleState.push(handle._icon.style.opacity);
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

            // select both images to initially create individual toolbar instances (single seleection interface)
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

        it("It should not allow a locked image to be part of multiple image selection", function() {
            var img = overlay.getElement();

            overlay.editing._toggleLock();
            chai.simulateCommandMousedown(img);

            var classStr = L.DomUtil.getClass(img);
            expect(classStr).to.not.include("selected");
        });
    });

    describe('#_removeFromGroup', function () {
        it('removes a collection of layers that are multi-selected', function () {
            var layers = imgGroup.getLayers();
            expect(layers).to.include.members([overlay, overlay2, overlay3]);
            expect(map.hasLayer(overlay)).to.be.true;

            chai.simulateCommandMousedown(overlay.getElement());
            chai.simulateCommandMousedown(overlay3.getElement());

            imgGroup._removeFromGroup();

            layers = imgGroup.getLayers();
            expect(layers).to.not.have.members([overlay, overlay3]);
            expect(layers).to.include.members([overlay2]);
        });

        it('removes the layers from the map on removal from group', function () {
            var id = imgGroup.getLayerId(overlay);
            var id2 = imgGroup.getLayerId(overlay2);
            var id3 = imgGroup.getLayerId(overlay3);

            var mapLayers = map._layers;
            expect(mapLayers).to.include.all.keys(id, id2, id3);

            chai.simulateCommandMousedown(overlay.getElement());
            chai.simulateCommandMousedown(overlay3.getElement());

            imgGroup._removeFromGroup();

            expect(mapLayers).to.not.have.all.keys(id, id3);
            expect(mapLayers).to.include.all.keys(id2);
        });
    });
});