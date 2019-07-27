L.KeymapperIconSet = L.Class.extend({

  _svg: '<svg xmlns="http://www.w3.org/2000/svg">',

  render: function() { 
    this.addSymbols();
    return this._svg; 
  },

  addSymbols: function() {
    this._svg +=
      '<symbol viewBox="0 0 25 25" id="keyboard_open"><path d="M12 23l4-4H8l4 4zm7-15h-2V6h2v2zm0 3h-2V9h2v2zm-3-3h-2V6h2v2zm0 3h-2V9h2v2zm0 4H8v-2h8v2zM7 8H5V6h2v2zm0 3H5V9h2v2zm1-2h2v2H8V9zm0-3h2v2H8V6zm3 3h2v2h-2V9zm0-3h2v2h-2V6zm9-3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></symbol>' +
      '<symbol viewBox="0 0 20 20" id="arrow_collapse"><path d="M2.6 19l4.5-4.5v3.6h2v-7h-7v2h3.6l-4.5 4.5L2.6 19zm15.5-9.9v-2h-3.6L19 2.6l-1.4-1.4-4.5 4.5V2.1h-2v7h7z"/></symbol>'
    ;
  }
});
