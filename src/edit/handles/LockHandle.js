L.LockHandle = L.EditHandle.extend({
  options: {
    TYPE: 'lock',
    interactive: false,
    icon: L.icon({
      // eslint-disable-next-line max-len
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAD8SURBVO3BPU7CYAAA0AdfjIcQlRCQBG7C3gk2uIPG2RC3Dk16Gz0FTO1WZs/gwGCMP/2+xsSl7+n1er1Iz9LtRQjaPeMeO+TinLDCJV78YqjdA04YodKuxhUaPGoRxMmxwRQZSt87Yo4KExGCeAUyLLFB4bMacxywEClIU2KDKXbInTUYo8JCgoFuGoxQO5uiwY1EA91VmDqrcKeDoX8WdNNgjApvmGGLXKIgXY0xGkxQYItrrFFIEKQ5Yo4KEx9yrDFDhlKkIF6NOQ5Y+KpAhiXWKEQI4pxwiwoLPyuxwQw75FoE7fZYocFEuwI7jHCBV39gL92TXq/Xi/AOcmczZmaIMScAAAAASUVORK5CYII=',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    }),
  },

  onRemove: function(map) {
    this.unbindTooltip();
    L.EditHandle.prototype.onRemove.call(this, map);
  },

  _bindListeners: function() {
    var icon = this.getElement();

    L.EditHandle.prototype._bindListeners.call(this);

    L.DomEvent.on(icon, {
      mousedown: this._tooltipOn,
      mouseup: this._tooltipOff,
    }, this);

    L.DomEvent.on(document, 'pointerleave', this._tooltipOff, this);
  },

  _unbindListeners: function() {
    var icon = this.getElement();

    L.EditHandle.prototype._bindListeners.call(this);

    L.DomEvent.off(icon, {
      mousedown: this._tooltipOn,
      mouseup: this._tooltipOff,
    }, this);

    L.DomEvent.off(document, 'pointerleave', this._tooltipOff, this);
  },

  /* cannot be dragged */
  _onHandleDrag: function() {
  },

  updateHandle: function() {
    this.setLatLng(this._handled.getCorner(this._corner));
  },

  _tooltipOn: function(e) {
    var eP = this._handled.parentGroup;
    var edit = eP ? eP.editing : this._handled.editing;

    if (e.shiftKey) { return; }
    if (!this._handled.isSelected() && (eP && !eP.isCollected(this._handled))) {
      return;
    }

    var handlesArr = edit._lockHandles;

    this._timer = setTimeout(L.bind(function() {
      if (this._timeout) { clearTimeout(this._timeout); }

      if (!this.getTooltip()) {
        this.bindTooltip('Locked!', {permanent: true});
      } else {
        handlesArr.eachLayer(function(handle) {
          if (this !== handle) { handle.closeTooltip(); }
        });
      }

      this.openTooltip();
    }, this), 500);
  },

  _tooltipOff: function(e) {
    var eP = this._handled.parentGroup;
    var edit = eP ? eP.editing : this._handled.editing;

    if (e.shiftKey) { return; }
    if (!this._handled.isSelected() && (eP && !eP.isCollected(this._handled))) {
      return;
    }

    var handlesArr = edit._lockHandles;

    if (e.currentTarget === document) {
      handlesArr.eachLayer(function(handle) {
        handle.closeTooltip();
      });
    }

    if (this._timer) { clearTimeout(this._timer); }

    this._timeout = setTimeout(L.bind(function() {
      this.closeTooltip();
    }, this), 400);
  },
});

L.lockHandle = function(overlay, idx, options) {
  return new L.LockHandle(overlay, idx, options);
};
