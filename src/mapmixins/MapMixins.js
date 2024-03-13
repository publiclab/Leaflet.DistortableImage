/* eslint-disable max-len */
L.Map.include({

  _clicked: 0,

  addGoogleMutant(opts) {
    var url = 'http://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';

    opts = this.mutantOptions = L.extend({
      mutantOpacity: 0.8,
      maxZoom: 24,
      maxNativeZoom: 20,
      minZoom: 0,
      labels: true,
      labelOpacity: 1,
      doubleClickLabels: true,
    }, opts);

    if (!opts.labels) {
      this.mutantOptions = L.extend(this.mutantOptions, {
        labelOpacity: opts.labels ? 1 : undefined,
        doubleClickLabels: opts.labels ? true : undefined,
      });
    }

    this._googleMutant = L.tileLayer(url, {
      maxZoom: opts.maxZoom,
      maxNativeZoom: opts.maxNativeZoom,
      minZoom: opts.minZoom,
      opacity: opts.mutantOpacity,
    }).addTo(this);

    if (opts.labels) { this._addLabels(opts); }
    // shouldn't have this handler at all if there are no labels to toggle
    else {
      this.doubleClickLabels = undefined;
    }

    return this;
  },

  _addLabels(opts) {
    var url = 'https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}';

    if (opts.labelOpacity !== 0 && opts.labelOpacity !== 1) {
      opts.labelOpacity = 1;
    }

    this._labels = L.tileLayer(url, {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      interactive: false,
      opacity: opts.labelOpacity,
      maxZoom: opts.maxZoom,
      maxNativeZoom: opts.maxNativeZoom,
      minZoom: opts.minZoom,
      ext: 'png',
    }).addTo(this);

    if (this.mutantOptions.doubleClickLabels) {
      this.doubleClickLabels.enable();
    }

    return this;
  },
});
// start off with doubleClickZoom enabled, doubleClickLabels can later be enabled instead
// during initialization
L.Map.addInitHook(function() {
  this.doubleClickLabels.disable();
  this.doubleClickZoom.enable();
});
