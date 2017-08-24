describe("L.Toolbar.Control", function() {
	var map,
		toolbar;

	beforeEach(function() {
		map = new L.Map(L.DomUtil.create('div')).setView([41.7896,-87.5996], 15);
		toolbar = new L.Toolbar.Control([L.ToolbarAction]).addTo(map);
	});

	describe("#onAdd", function() {
		it("Adds the toolbar to the map.", function() {
			expect(map.hasLayer(toolbar)).to.equal(true);
		});
	});

	describe("#onRemove", function() {
		it("Removes the toolbar from the map", function() {
			map.removeLayer(toolbar);
			expect(map.hasLayer(toolbar)).to.equal(false);
		});
	});
});

describe("L.toolbar.control", function() {
    describe("class factory", function() {
        it("creates L.Toolbar.Control instance", function() {
            var options = {position: 'bottomleft'};
            expect(L.toolbar.control(options)).to.eql(new L.Toolbar.Control(options));
        });
    });
});
