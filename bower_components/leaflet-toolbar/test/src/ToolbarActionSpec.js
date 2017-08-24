describe("L.ToolbarAction", function() {
	var map,
		container,
		ul,
		toolbar,
		Action;

	beforeEach(function() {
		map = new L.Map(L.DomUtil.create('div')).setView([41.7896,-87.5996], 15);
		container = L.DomUtil.create('div', 'leaflet-toolbar-0', document.body);
		ul = L.DomUtil.create('ul');

		Action = L.ToolbarAction.extend({
			options: {
				toolbarIcon: {
					html: 'Test Icon',
					className: 'my-toolbar-icon'
				}
			}
		});
		toolbar = new L.Toolbar({ actions: [Action] });
	});

	describe("#_createIcon", function() {
		it("Sets the content of the icon to the html option passed to the ToolbarIcon.", function() {
			var iconText,
				action = new Action(map);

			action._createIcon(toolbar, ul, []);
			iconText = ul.querySelectorAll('.leaflet-toolbar-icon')[0].innerHTML;

			expect(iconText).to.equal('Test Icon');
		});

		it("Appends options.className to the base className", function() {
			var iconButton,
				action = new Action(map);

			action._createIcon(toolbar, ul, []);
			iconButton = ul.querySelectorAll('a')[0];

			expect(L.DomUtil.hasClass(iconButton, 'leaflet-toolbar-icon')).to.equal(true);
			expect(L.DomUtil.hasClass(iconButton, 'my-toolbar-icon')).to.equal(true);
		});
	});

	describe("#_addSubToolbar", function() {
		it("Should not add a <ul> element when the toolbar has no actions.", function() {
			var action = new Action(map),
				subToolbar = action.options.subToolbar,
				ul;
			
			action._addSubToolbar(toolbar, container, [map]);
			ul = container.querySelectorAll('ul');

			expect(ul.length).to.equal(0);
			expect(subToolbar._ul).to.be.an('undefined');
		});

		it("Should add a <ul> element when the toolbar has one action.", function() {
			var subToolbar = new L.Toolbar({ actions: [L.ToolbarAction] }),
				TestAction = Action.extend({ options: { subToolbar: subToolbar } }),
				ul;

			toolbar = new L.Toolbar({ actions: [TestAction] }).addTo(map);

			TestAction.prototype._addSubToolbar(toolbar, container, [map]);
			ul = container.querySelectorAll('ul');

			expect(ul.length).to.equal(1);
			expect(L.DomUtil.hasClass(subToolbar._ul, 'leaflet-toolbar-1')).to.equal(true);
		});
	});

	describe("#addHooks", function() {
		beforeEach(function() {
			var subToolbar = new L.Toolbar({ actions: [L.ToolbarAction] }),
				action = new L.ToolbarAction();

			L.setOptions(action, { subToolbar: subToolbar });
			toolbar = new L.Toolbar({ actions: [L.ToolbarAction] }).addTo(map);

			action._addSubToolbar(toolbar, container, [map]);
		});

		/* How to test this without access to the action itself? */
		it.skip("Should show the subToolbar when the action is enabled.", function() {
			var ul = container.querySelectorAll('ul')[0],
				action = new L.ToolbarAction();

			expect(getComputedStyle(ul).display).to.equal('none');

			action.enable();
			expect(ul.style.display).to.equal('block');
		});
	});

	describe("#removeHooks", function() {
		beforeEach(function() {
			var subToolbar = new L.Toolbar({ actions: [L.ToolbarAction] }),
				action = new L.ToolbarAction();

			L.setOptions(action, { subToolbar: subToolbar });
			toolbar = new L.Toolbar({ actions: [L.ToolbarAction] }).addTo(map);

			action._addSubToolbar(toolbar, container, [map]);
		});

		/* How to test this without access to the action itself? */
		it.skip("Should hide the subToolbar when the hndler is disabled.", function() {
			var ul = container.querySelectorAll('ul')[0],
				action = new L.ToolbarAction();

			expect(getComputedStyle(ul).display).to.equal('none');

			action.enable();
			action.disable();

			expect(ul.style.display).to.equal('none');
		});
	});

	describe("#enable", function() {
		it("Should enable the action.", function() {
			var action = new L.ToolbarAction();

			action.enable();
			expect(action.enabled()).to.equal(true);
		});

		it("Should re-enable the action after it is disabled.", function() {
			var action = new L.ToolbarAction();

			action.enable();
			action.disable();
			action.enable();

			/* Regression test: code written to maintain a single active action at a time 
			 * was inadvertently disabling actions.
			 */
			expect(action.enabled()).to.equal(true);
		});
	});

	describe("#disable", function() {
		it("Should disable the action.", function() {
			var action = new L.ToolbarAction();

			action.enable();
			action.disable();

			expect(action.enabled()).to.equal(false);
		});
	});

	describe(".extendOptions", function() {
		it("Should return a new constructor with parent options merged with those passed to .extendOptions", function() {
			var H = L.ToolbarAction.extendOptions({ color: '#d1bd0f' }),
				h = new H(map);

			/* New option should be passed to the new constructor. */
			expect(h.options.color).to.equal('#d1bd0f');

			/* Options of the parent constructor should be retained. */
			expect(h.options.toolbarIcon.html).to.equal('');
		});
	});
});

describe("L.toolbarAction", function() {
	describe("class factory", function() {
		it("Creates an L.ToolbarAction instance.", function() {
			var options = { toolbarIcon: { html: 'hello' } };

			expect(L.toolbarAction(options)).to.deep.equal(new L.ToolbarAction(options));
		});
	});
});