"use strict";

let CachePlugin;
try {
  // webpack 5
  CachePlugin = require("webpack/lib/cache/MemoryCachePlugin");
} catch (e) {
  // webpack 4
  // eslint-disable-next-line import/no-unresolved,import/extensions
  CachePlugin = require("webpack/lib/CachePlugin");
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
