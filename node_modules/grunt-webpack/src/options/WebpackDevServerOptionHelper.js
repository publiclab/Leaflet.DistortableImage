"use strict";

const defaults = require("./default");
const OptionHelper = require("./OptionHelper");

class WebpackOptionHelper extends OptionHelper {
  getDefaultOptions() {
    return Object.assign(
      {},
      defaults.gruntOptions,
      defaults.webpackDevServerOptions,
    );
  }

  getWebpackOptions() {
    const options = this.getOptions();

    if (Array.isArray(options)) {
      return options.map((opt) => this.filterGruntOptions(opt));
    }

    return this.filterGruntOptions(options);
  }

  getWebpackDevServerOptions() {
    const options = this.getOptions();

    if (Array.isArray(options)) {
      return options.reduce(
        (previous, current) => ({
          ...previous,
          ...current.devServer,
        }),
        {},
      );
    }

    return options.devServer;
  }
}

module.exports = WebpackOptionHelper;
