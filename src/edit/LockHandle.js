L.LockHandle = L.EditHandle.extend({
	options: {
		TYPE: 'lock',
		icon: L.icon({ 
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAklEQVR4AewaftIAAAD8SURBVO3BPU7CYAAA0AdfjIcQlRCQBG7C3gk2uIPG2RC3Dk16Gz0FTO1WZs/gwGCMP/2+xsSl7+n1er1Iz9LtRQjaPeMeO+TinLDCJV78YqjdA04YodKuxhUaPGoRxMmxwRQZSt87Yo4KExGCeAUyLLFB4bMacxywEClIU2KDKXbInTUYo8JCgoFuGoxQO5uiwY1EA91VmDqrcKeDoX8WdNNgjApvmGGLXKIgXY0xGkxQYItrrFFIEKQ5Yo4KEx9yrDFDhlKkIF6NOQ5Y+KpAhiXWKEQI4pxwiwoLPyuxwQw75FoE7fZYocFEuwI7jHCBV39gL92TXq/Xi/AOcmczZmaIMScAAAAASUVORK5CYII=',
			iconSize: [32, 32],
			iconAnchor: [16, 16]
		})
	},

	/* cannot be dragged */
	_onHandleDrag: function() {
	},

  _bindListeners: function() {
    this.on(
      {
        dragstart: this._onHandleDragStart,
        drag: this._onHandleDrag,
        dragend: this._onHandleDragEnd,
        mouseover: this._setTooltip
      },
      this
    );

    this._handled._map.on("zoomend", this.updateHandle, this);

    this._handled.on("update", this.updateHandle, this);
  },

  _setTooltip: function () {
    
	  var Icon = L.Icon.extend({
      options: {
        iconSize: [ 1, 1 ],
        iconAnchor: [ 1, 1 ]
      }
    });
   
	  var question = new Icon({
      iconUrl: '/'
    });
	  
	  this._questionMark = new L.marker(this._handled.getCorner(this._corner), { icon: question })
		  .bindTooltip("Locked!")
		  .addTo(this._handled._map)
		  .openTooltip();
	  
	  setTimeout(function () {
		  var el = [];
		  var marks = Array.from(document.querySelectorAll(".leaflet-interactive"));
		  for (var i = 0; i < marks.length; i++) { 
			  if (/question/.test(marks[ i ].currentSrc)) { 
				  el.push(marks[ i ]);
			  }
		  }
		  var tt = document.querySelector(".leaflet-tooltip");
		  if (tt) { 
		  tt.parentNode.removeChild(tt);
		  }
		  for (var j = 0; j < el.length; j++) { 
		  	el[j].parentNode.removeChild(el[j]);
		  }

	  }, 2000);
	},

	updateHandle: function() {
		this.setLatLng(this._handled.getCorner(this._corner));
		L.DomUtil.removeClass(this._handled.getElement(), 'selected');
	}

});
