"use strict";

const webpack = require("webpack");
const OptionHelper = require("../src/options/WebpackDevServerOptionHelper");
const ProgressPluginFactory = require("../src/plugins/ProgressPluginFactory");

module.exports = (grunt) => {
  let WebpackDevServer;
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    WebpackDevServer = require("webpack-dev-server");
  } catch (err) {
    grunt.registerTask(
      "webpack-dev-server",
      "webpack-dev-server not installed.",
      () => {
        grunt.fail.fatal(
          `webpack-dev-server is currently not installed, this task will do nothing.

To fix this problem install webpack-dev-server by doing either
yarn add webpack-dev-server --dev
or
npm install --save-dev webpack-dev-server
`,
        );
      },
    );
    return;
  }

  const processPluginFactory = new ProgressPluginFactory(grunt);

  grunt.registerTask(
    "webpack-dev-server",
    "Start a webpack-dev-server.",
    function webpackDevServerTask(cliTarget) {
      const done = this.async();

      let targets;
      if (cliTarget) {
        targets = [cliTarget];
      } else {
        const config = grunt.config.getRaw([this.name]);
        targets = config ? Object.keys(config) : [];
      }

      let runningTargetCount = targets.length;

      if (runningTargetCount === 0) {
        done(
          new Error(
            "No configuration was found for webpack-dev-server. For further assistance on how to create the config refer to https://github.com/webpack-contrib/grunt-webpack/blob/master/README.md#grunt-webpack",
          ),
        );
        return;
      }

      targets.forEach((target) => {
        if (target === "options") {
          runningTargetCount--;
          return;
        }

        const optionHelper = new OptionHelper(grunt, this.name, target);
        optionHelper.preloadOptions(() => {
          const opts = optionHelper.getOptions();
          const webpackOptions = optionHelper.getWebpackOptions();

          const compiler = webpack(webpackOptions);
          if (opts.progress) {
            processPluginFactory.addPlugin(compiler, webpackOptions);
          }

          const server = new WebpackDevServer(
            optionHelper.getWebpackDevServerOptions(),
            compiler,
          );

          server.startCallback(() => {});
        });
      });
    },
  );
};
