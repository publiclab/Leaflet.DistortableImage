describe("L.Toolbar", function() {
	var map,
		container,
		toolbarTemplate,
		toolbar;

	beforeEach(function() {
		map = new L.Map(L.DomUtil.create('div')).setView([41.7896,-87.5996], 15);
		container = L.DomUtil.create('div');

		toolbarTemplate = [L.ToolbarAction];
		toolbar = new L.Toolbar({ actions: toolbarTemplate });
	});

	describe("#onAdd", function() {
		it.skip("Should replace the current toolbar when a duplicate is added to the map.", function() {
			var toolbar1 = new L.Toolbar().addTo(map);

			new L.Toolbar().addTo(map);
			expect(map.hasLayer(toolbar1)).to.equal(false);
		});

		it.skip("Should allow multiple toolbars of different types on the map.", function() {
			var Toolbar1 = L.Toolbar.extend({}),
				Toolbar2 = L.Toolbar.extend({}),
				toolbar1 = new Toolbar1().addTo(map);

			new Toolbar2().addTo(map);

			expect(map.hasLayer(toolbar1)).to.equal(true);
		});
	});

	describe("#addTo", function() {
		it("Should add a toolbar to the map.", function() {
			toolbar.addTo(map);
			expect(map.hasLayer(toolbar)).to.equal(true);
		});

		it("Should pass along its arguments to each toolbar action factory.", function(done) {
			var TestHandler = L.ToolbarAction.extend({
				initialize: function(arg1, arg2) {
					expect(arg1).to.equal(map);
					expect(arg2).to.equal(2);
					done();
				}
			});

			toolbar = new L.Toolbar({ actions: [TestHandler] });

			toolbar.addTo(map, 2);
			toolbar.appendToContainer(container);
		});
	});

	describe("#appendToContainer", function() {
		it("Should create an icon for each toolbar action.", function() {
			var icons;

			toolbar.appendToContainer(container);

			icons = container.querySelectorAll('.leaflet-toolbar-icon');

			expect(icons.length).to.equal(toolbarTemplate.length);
		});
	});

	describe("#_show", function() {
		it("Should set the display of the toolbar container to 'block'", function() {
			toolbar.addTo(map);
			toolbar.appendToContainer(container);

			toolbar._show();
			expect(toolbar._ul.style.display).to.equal('block');
		});
	});

	describe("#_hide", function() {
		it("Should set the display of the toolbar container to 'block'", function() {
			toolbar.addTo(map);
			toolbar.appendToContainer(container);

			toolbar._hide();
			expect(toolbar._ul.style.display).to.equal('none');
		});
	});

	describe("#_calculateToolbarDepth", function() {
		it("Should return 0 for a single toolbar", function() {
			toolbar.addTo(map);
			expect(toolbar._calculateDepth()).to.equal(0);
		});

		it("Should return 1 for a nested toolbar", function() {
			var subToolbar = new L.Toolbar(),
				TestHandler = L.ToolbarAction.extend({ options: { subToolbar: subToolbar } });

			toolbar = new L.Toolbar({ actions: [TestHandler] }).addTo(map);
			toolbar.appendToContainer(container);

			expect(subToolbar._calculateDepth()).to.equal(1);
		});
	});
});
