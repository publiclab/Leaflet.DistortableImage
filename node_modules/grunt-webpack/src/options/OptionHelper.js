"use strict";

const deepForEach = require("deep-for-each");
const defaults = require("./default");

class OptionHelper {
  constructor(grunt, taskName, target) {
    this.grunt = grunt;
    this.taskName = taskName;
    this.target = target;
  }

  generateOptions() {
    const baseOptions = this.getRawConfig([this.taskName, "options"]);
    if (Array.isArray(baseOptions)) {
      throw new Error(
        "webpack.options must be an object, but array was provided",
      );
    }

    return defaults.mergeOptions(
      this.getDefaultOptions(),
      baseOptions,
      this.getRawConfig([this.taskName, this.target]),
    );
  }

  getOptions() {
    if (!this.options) {
      this.options = this.generateOptions();
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

  getRawConfig(ns) {
    let obj = this.grunt.config.getRaw(ns) || {};

    if (typeof obj === "function") {
      obj = obj(this.grunt.config.get());
    }

    deepForEach(obj, (value, key, parent) => {
      if (typeof value === "string") {
        parent[key] = this.grunt.config.process(value);
      }
    });

    return obj;
  }

  filterGruntOptions(options) {
    const result = Object.assign({}, options);
    Object.keys(defaults.gruntOptions).forEach((key) => delete result[key]);

    return result;
  }
}

module.exports = OptionHelper;
