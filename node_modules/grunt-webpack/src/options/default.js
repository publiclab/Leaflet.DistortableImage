"use strict";

const mergeWith = require("lodash/mergeWith");

const gruntOptions = {
  failOnError: (options) => {
    // if watch enabled default to failOnError false
    return Array.isArray(options)
      ? options.every((option) => !option.watch)
      : !options.watch;
  },
  progress: process.stdout.isTTY,
  storeStatsTo: null,
  keepalive: (options) => {
    // if watch enabled default to keepalive true
    return Array.isArray(options)
      ? options.some((option) => option.watch)
      : !!options.watch;
  },
  watch: null,
};

const webpackOptions = {
  stats: {
    cached: false,
    cachedAssets: false,
    colors: true,
  },
  cache: (options) => {
    // if watch enabled also default to cache true
    return Array.isArray(options)
      ? options.some((option) => option.watch)
      : !!options.watch;
  },
};

const webpackDevServerOptions = {
  devServer: {
    host: "localhost",
  },
  stats: {
    cached: false,
    cachedAssets: false,
    colors: true,
  },
};

// eslint-disable-next-line consistent-return
function mergeCustomize(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.concat(b);
  }
}

function mergeOptions(defaultOptions, options, targetOptions) {
  if (Array.isArray(targetOptions) && Array.isArray(options)) {
    if (targetOptions.length !== options.length) {
      throw new Error(
        "Cannot have both `options` and `target` be an array with different length. " +
          "If using arrays for both please ensure they are the same size.",
      );
    }
    return targetOptions.map((opt, index) =>
      mergeWith({}, defaultOptions, options[index], opt, mergeCustomize),
    );
  }

  if (Array.isArray(targetOptions)) {
    return targetOptions.map((opt) =>
      mergeWith({}, defaultOptions, options, opt, mergeCustomize),
    );
  } else if (Array.isArray(options)) {
    return options.map((opt) =>
      mergeWith({}, defaultOptions, opt, targetOptions, mergeCustomize),
    );
  }

  return mergeWith({}, defaultOptions, options, targetOptions, mergeCustomize);
}

exports.gruntOptions = gruntOptions;
exports.webpackOptions = webpackOptions;
exports.webpackDevServerOptions = webpackDevServerOptions;

exports.mergeOptions = mergeOptions;
