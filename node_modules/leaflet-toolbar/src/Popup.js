// A convenience class for built-in popup toolbars.

L.Toolbar2.Popup = L.Toolbar2.extend({
	statics: {
		baseClass: 'leaflet-popup-toolbar ' + L.Toolbar2.baseClass
	},

	options: {
		anchor: [0, 0]
	},

	initialize: function(latlng, options) {
		L.Toolbar2.prototype.initialize.call(this, options);

		/* 
		 * Developers can't pass a DivIcon in the options for L.Toolbar2.Popup
		 * (the use of DivIcons is an implementation detail which may change).
		 */
		this._marker = new L.Marker(latlng, {
			icon : new L.DivIcon({
				className: this.options.className,
				iconAnchor: [0, 0]
			})
		});
	},

	onAdd: function(map) {
		this._map = map;
		this._marker.addTo(map);

		L.Toolbar2.prototype.onAdd.call(this, map);

		this.appendToContainer(this._marker._icon);

		this._setStyles();
	},

	onRemove: function(map) {
		map.removeLayer(this._marker);

		L.Toolbar2.prototype.onRemove.call(this, map);

		delete this._map;
	},

	setLatLng: function(latlng) {
		this._marker.setLatLng(latlng);

		return this;
	},

	_setStyles: function() {
		var container = this._container,
			toolbar = this._ul,
			anchor = L.point(this.options.anchor),
			icons = toolbar.querySelectorAll('.leaflet-toolbar-icon'),
			buttonHeights = [],
			toolbarWidth = 0,
			toolbarHeight,
			tipSize,
			tipAnchor;
		/* Calculate the dimensions of the toolbar. */
		for (var i = 0, l = icons.length; i < l; i++) {
			if (icons[i].parentNode.parentNode === toolbar) {
				buttonHeights.push(parseInt(L.DomUtil.getStyle(icons[i], 'height'), 10));
				toolbarWidth += Math.ceil(parseFloat(L.DomUtil.getStyle(icons[i], 'width')));
				toolbarWidth += Math.ceil(parseFloat(L.DomUtil.getStyle(icons[i], 'border-right-width')));
			}
		}
		toolbar.style.width = toolbarWidth + 'px';

		/* Create and place the toolbar tip. */
		this._tipContainer = L.DomUtil.create('div', 'leaflet-toolbar-tip-container', container);
		this._tipContainer.style.width = toolbarWidth +
			Math.ceil(parseFloat(L.DomUtil.getStyle(toolbar, 'border-left-width'))) +
			'px';

		this._tip = L.DomUtil.create('div', 'leaflet-toolbar-tip', this._tipContainer);

		/* Set the tipAnchor point. */
		toolbarHeight = Math.max.apply(undefined, buttonHeights);
		// Ensure that the border completely surrounds its relative-positioned children.
		toolbar.style.height = toolbarHeight + 'px';
		tipSize = parseInt(L.DomUtil.getStyle(this._tip, 'width'), 10);
        // The tip should be anchored exactly where the click event was received.
		tipAnchor = new L.Point(toolbarWidth/2, toolbarHeight + 1.414*tipSize);

		/* The anchor option allows app developers to adjust the toolbar's position. */
		container.style.marginLeft = (anchor.x - tipAnchor.x) + 'px';
		container.style.marginTop = (anchor.y - tipAnchor.y) + 'px';
	},
});

L.toolbar.popup = function(options) {
    return new L.Toolbar2.Popup(options);
};
