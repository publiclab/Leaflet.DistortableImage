LeafletToolbar.ToolbarAction = L.Handler.extend({
	statics: {
		baseClass: 'leaflet-toolbar-icon'
	},

	options: {
		toolbarIcon: {
			html: '',
			className: '',
			tooltip: ''
		},
		subToolbar: new LeafletToolbar()
	},

	initialize: function(options) {
		var defaultIconOptions = LeafletToolbar.ToolbarAction.prototype.options.toolbarIcon;

		L.setOptions(this, options);
		this.options.toolbarIcon = L.extend({}, defaultIconOptions, this.options.toolbarIcon);
	},

	enable: function(e) {
		if (e) { L.DomEvent.preventDefault(e); }
		if (this._enabled) { return; }
		this._enabled = true;

		if (this.addHooks) { this.addHooks(); }
	},

	disable: function() {
		if (!this._enabled) { return; }
		this._enabled = false;

		if (this.removeHooks) { this.removeHooks(); }
	},

	_createIcon: function(toolbar, container, args) {
		var iconOptions = this.options.toolbarIcon;

		this.toolbar = toolbar;
		this._icon = L.DomUtil.create('li', '', container);
		this._link = L.DomUtil.create('a', '', this._icon);

		this._link.innerHTML = iconOptions.html;
		this._link.setAttribute('href', '#');
		this._link.setAttribute('title', iconOptions.tooltip);

		L.DomUtil.addClass(this._link, this.constructor.baseClass);
		if (iconOptions.className) {
			L.DomUtil.addClass(this._link, iconOptions.className);
		}

		L.DomEvent.on(this._link, 'click', this.enable, this);

		/* Add secondary toolbar */
		this._addSubToolbar(toolbar, this._icon, args);
	},

	_addSubToolbar: function(toolbar, container, args) {
		var subToolbar = this.options.subToolbar,
			addHooks = this.addHooks,
			removeHooks = this.removeHooks;

		/* For calculating the nesting depth. */
		subToolbar.parentToolbar = toolbar;

		if (subToolbar.options.actions.length > 0) {
			/* Make a copy of args so as not to pollute the args array used by other actions. */
			args = [].slice.call(args);
			args.push(this);

			subToolbar.addTo.apply(subToolbar, args);
			subToolbar.appendToContainer(container);

			this.addHooks = function(map) {
				if (typeof addHooks === 'function') { addHooks.call(this, map); }
				subToolbar._show();
			};

			this.removeHooks = function(map) {
				if (typeof removeHooks === 'function') { removeHooks.call(this, map); }
				subToolbar._hide();
			};
		}
	}
});

L.toolbarAction = function toolbarAction(options) {
	return new LeafletToolbar.ToolbarAction(options);
};

LeafletToolbar.ToolbarAction.extendOptions = function(options) {
	return this.extend({ options: options });
};
