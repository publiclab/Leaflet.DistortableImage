/**
 * L.Map.DoubleClickZoom from leaflet 1.5.1, overrwritten so that it fires a
 * `singleclick` event to avoiding deselecting images on doubleclick.
 */
// L.Map.DoubleClickZoom.include({
//   addHooks: function() {
//     // this._singleClickTimeout = null;

//     // L.DomEvent.on(this._map, {
//     //   click: this._scheduleSingleClick,
//     //   dblclick: this._onDoubleClick,
//     // }, this);
//     this._map.on({
//       click: this._scheduleSingleClick,
//       dblclick: this._onDoubleClick,
//       dbltap: this._onDoubleClick,
//     }, this);
//   },

//   removeHooks: function() {
//     this._map.singleClickTimeout = null;

//     this._map.off({
//       click: this._scheduleSingleClick,
//       dblclick: this._onDoubleClick,
//       dbltap: this._onDoubleClick,
//     }, this);
//   },

//   enable: function() {
//     var map = this._map;

//     if (this._enabled) { return this; }

//     // don't enable 'doubleClickZoom' unless 'doubleClickLabels' is disabled first
//     if (map.doubleClickLabels) {
//       if (map.doubleClickLabels.enabled()) {
//         return false;
//       }
//     }

//     map.fire('singleclickon');

//     this._enabled = true;
//     this.addHooks();
//     return this;
//   },

//   disable: function() {
//     if (!this._enabled) { return this; }

//     // if L.Map.DoubleClickLabels is disabled as well, collection/instance classes
//     // will stop listening for `singleclick` and start just listening for `click`.
//     this._map.fire('singleclickoff');

//     this._enabled = false;
//     this.removeHooks();
//     return this;
//   },

//   _clearSingleClickTimeout: function() {
//     if (this._map._singleClickTimeout !== null) {
//       console.log('clearclicktimeout');
//       clearTimeout(this._map._singleClickTimeout);
//       this._map._singleClickTimeout = null;
//     }
//   },

//   _scheduleSingleClick: function(e) {
//     var oe = e.originalEvent;
//     var map = this._map;

//     // prevents deselection in case of box selector
//     if (oe && oe.shiftKey) { return; }

//     console.log('singleclick');
//     this._clearSingleClickTimeout();

//     // this._singleClickTimeout = (
//     // setTimeout(L.bind(this._fireSingleClick, e, this), 250)
//     // );
//     this._map._singleClickTimeout = setTimeout(function() {
//       // if (oe && !oe._stopped) {
//       map.fire('singleclick', L.extend(e, {type: 'singleclick'}));
//       // }
//     }, 250);
//   },

//   _cancelSingleClick: function() {
//     // This timeout is key to workaround an issue where double-click events
//     // are fired in this order on some touch browsers: ['click', 'dblclick', 'click']
//     // instead of ['click', 'click', 'dblclick']
//     setTimeout(L.bind(this._clearSingleClickTimeout, this), 0);
//   },

//   _onDoubleClick: function(e) {
//     var map = this._map;

//     console.log('doubleclick');

//     this._cancelSingleClick();

//     var oldZoom = map.getZoom();
//     var delta = map.options.zoomDelta;
//     var zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

//     if (map.options.doubleClickZoom === 'center') {
//       map.setZoom(zoom);
//     } else {
//       map.setZoomAround(e.containerPoint, zoom);
//     }
//   },
// });
