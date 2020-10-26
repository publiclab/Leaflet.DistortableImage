"use strict";

let CachePlugin;
try {
  // webpack 4
  CachePlugin = require("webpack/lib/CachePlugin");
} catch (e) {
  // webpack 5
  // eslint-disable-next-line import/no-unresolved
  CachePlugin = require("webpack/lib/cache/MemoryCachePlugin");
}

class CachePluginFactory {
  constructor() {
    this.plugins = {};
  }

  addPlugin(target, compiler) {
    if (!this.plugins[target]) {
      this.plugins[target] = new CachePlugin();
    }
    this.plugins[target].apply(compiler);
  }
}

module.exports = CachePluginFactory;
