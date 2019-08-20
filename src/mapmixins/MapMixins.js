L.Map.include({
  addGoogleMutant: function(opts) {
    opts = this._mutantOptions = L.Util.extend({
      labels: true,
      labelOpacity: 0,
      mutantOpacity: 0.8,
      maxZoom: 18,
      minZoom: 0
    }, opts);

    if (opts.maxZoom > 21) { opts.maxZoom = 18; }

    this._googleMutant = L.tileLayer('http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: opts.maxZoom,
      minZoom: opts.minZoom,
      opacity: opts.mutantOpacity
    }).addTo(this);

    if (opts.labels) { this._addLabels(opts); }

    return this;
  },

  _addLabels: function(opts) {
    if (opts.labelOpacity !== 0 && opts.labelOpacity !== 1) {
      opts.labelOpacity = 0;
    }

    this._labels = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      interactive: false,
      opacity: opts.labelOpacity,
      maxZoom: opts.maxZoom,
      minZoom: opts.minZoom,
      ext: 'png'
    }).addTo(this);

    this.doubleClickLabels.enable();

    return this;
  }
});