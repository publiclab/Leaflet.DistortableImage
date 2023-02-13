"use strict";

const deepForEach = require("deep-for-each");
const defaults = require("./default");

class OptionHelper {
  constructor(grunt, taskName, target) {
    this.grunt = grunt;
    this.taskName = taskName;
    this.target = target;
  }

  preloadOptions(done) {
    if (!this.options) {
      this.generateOptions()
        .then((options) => {
          this.options = options;
          done();
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
          done();
        });
    } else {
      process.nextTick(done);
    }
  }

  async generateOptions() {
    const baseOptions = await this.readRawConfig([this.taskName, "options"]);
    const targetOptions = await this.readRawConfig([
      this.taskName,
      this.target,
    ]);

    return defaults.mergeOptions(
      this.getDefaultOptions(),
      baseOptions,
      targetOptions,
    );
  }

  getOptions() {
    if (!this.options) {
      throw new Error("Options need to be preloaded with `preloadOptions()`");
    }

    return this.options;
  }

  get(name) {
    const options = this.getOptions();
    let option;

    if (Array.isArray(options)) {
      let value;
      options.some((opt) => {
        value = opt[name];
        return value != null;
      });

      option = value;
    } else {
      option = options[name];
    }

    return typeof option === "function" ? option(options) : option;
  }

  async readRawConfig(ns) {
    let obj = this.grunt.config.getRaw(ns) || {};

    if (typeof obj === "function") {
      obj = obj(this.grunt.config.get());
    }

    // Might be a Promise
    const options = await obj;

    deepForEach(options, (value, key, parent) => {
      if (typeof value === "string") {
        parent[key] = this.grunt.config.process(value);
      }
    });

    return options;
  }

  filterGruntOptions(options) {
    const result = Object.assign({}, options);
    Object.keys(defaults.gruntOptions).forEach((key) => delete result[key]);

    return result;
  }
}

module.exports = OptionHelper;
