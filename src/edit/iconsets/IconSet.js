/* this is the baseclass other IconSets inherit from,
* we don't use it directly */
L.IconSet = L.Class.extend({

  _svg: '<svg xmlns="http://www.w3.org/2000/svg">',

  _symbols: '',

  render() {
    this.addSymbols(this._symbols);
    return this._svg;
  },

  addSymbols(symbols) {
    this._svg += symbols;
  },
});
