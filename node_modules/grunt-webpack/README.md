[![npm][npm]][npm-url]

<div align="center">
  <!-- replace with accurate logo e.g from https://worldvectorlogo.com/ -->
  <img width="200" height="200"
    src="https://cdn.worldvectorlogo.com/logos/grunt.svg">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" vspace="" hspace="25"
      src="https://cdn.rawgit.com/webpack/media/e7485eb2/logo/icon.svg">
  </a>
  <h1>Grunt Webpack</h1>
  <p>Use Webpack with Grunt.<p>
</div>

<h2 align="center">Requirements</h2>

- Version 5 of `grunt-webpack` supports webpack version 4 and 5 and (optional) `webpack-dev-server` version 4.

<h2 align="center">Install</h2>

Install this grunt plugin next to your project's [Gruntfile.js](http://gruntjs.com/getting-started). You also need to install webpack yourself, this grunt plugin does not install webpack itself.

```bash
yarn add webpack grunt-webpack --dev
// or
// npm i webpack grunt-webpack --save-dev
```

If you also want to use the webpack-dev-server task you also need to install `webpack-dev-server`

```bash
yarn add webpack-dev-server --dev
```

Then add this line to your project's `Gruntfile.js` gruntfile:

```javascript
const webpackConfig = require('./webpack.config.js');

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    ...,
    webpack: {
      myConfig: webpackConfig,
    },
    ...
  });

  grunt.loadNpmTasks('grunt-webpack');
};
```

<h2 align="center">Configuration</h2>

`webpack-grunt` offers two different tasks `webpack` and `webpack-dev-server`. Both support all webpack options as
can be seen in the [webpack documentation][webpack-config]. For exceptions and additions see this list.

### Both Tasks

#### progress

Type: `bool`
Default: `true` (`false` if no TTY present)

Activates or deactivates the progress output of webpack.

### Webpack Task

#### failOnError

Type: `bool`
Default: `true` (`false` if watch mode is used)

Will terminate the grunt process when an error happens if set to `true`. If set to `false` the grunt process will not be immediately terminated on error and instead continue to run.

#### keepalive

Type: `bool`
Default: `false` (`true` if watch mode is used and for `webpack-dev-server` task)

When set to true the grunt process/task will be kept alive after webpack task is finished. This is especially useful for `watch` and `webpack-dev-server` as these usually need to run as long as not manually killed.

#### storeStatsTo

Type: `string`
Default: `null`

When set the stats from webpack will be written to a variable with the name provided in this option. The variable can later be used inside of other grunt tasks with template tags `<%= %>`.

```js
...
storeStatsTo: "webpackStats"

...

<%= webpackStats.hash %>
...
```

> For more information about grunt template tags have a look at the [grunt docs][grunt-template].

#### watch

Type: `bool`
Default: `undefined`

> Turn on watch mode. This means that after the initial build, webpack will continue to watch for changes in any of the resolved files.

Turning on watch mode also sets the following defaults:

- Default `cache` to `true`
- Default `keepalive` to `true`
- Default `failOnError` to `false`

### Webpack-dev-server Task

There are no special options for this task. Some changed defaults for WebpackDevServer options are:

| Name           | default value |
| -------------- | ------------- |
| devServer.host | localhost     |

<h2 align="center">Examples</h2>

### Webpack

#### imported config

This is a simple example that requires the webpack config from the config file.
It also disables stats in non 'development' environments and enables watch in development.

```javascript
const webpackConfig = require("./webpack.config.js");

module.exports = function (grunt) {
  grunt.initConfig({
    webpack: {
      options: {
        stats: !process.env.NODE_ENV || process.env.NODE_ENV === "development",
      },
      prod: webpackConfig,
      dev: Object.assign({ watch: true }, webpackConfig),
    },
  });

  grunt.loadNpmTasks("grunt-webpack");
};
```

> The webpack task in this example has two targets called `prod` and `dev`. They can be renamed to everything besides `options`. See the [grunt docs][grunt-targets] for more information about targets.

On the command line you can then do the following.

```bash
# Run webpack with the `prod` target
> NODE_ENV='production' grunt webpack:prod

# Run webpack with the `dev` target
> grunt webpack:dev

# Run webpack for all targets
> grunt webpack
```

> For more examples and information have a look at the [webpack documentation][webpack-start] which mostly also applies here besides the noted differences above.

#### Lazy config loading

In some cases you might want to load the webpack config lazy. This can be done by specifying a function as the config value. The first paramter to this function will be the complete grunt config, which can be used in cases where grunt templates do not work (see below).

```js
module.exports = function (grunt) {
  grunt.initConfig({
    webpack: {
      myconfig: () => ({
        entry: path.join(__dirname, "entry"),
        output: {
          path: __dirname,
          filename: "output.js",
        },
      }),
    },
  });

  grunt.loadNpmTasks("grunt-webpack");
};
```

You could also use a promise

```js
const webpackConfig = require("./webpack.config.js");

module.exports = function (grunt) {
  grunt.initConfig({
    webpack: {
      myconfig: Promise.resolve(webpackConfig),
    },
  });

  grunt.loadNpmTasks("grunt-webpack");
};
```

#### Grunt templates

grunt-webpack supports grunt templates in all string values in it's configuration.

In the next example we use a template for `output.filename`.

```js
module.exports = function (grunt) {
  grunt.initConfig({
    outputFileName: "output.js",
    webpack: {
      myconfig: {
        entry: path.join(__dirname, "entry"),
        output: {
          path: __dirname,
          filename: "<%= outputFileName %>",
        },
      },
    },
  });

  grunt.loadNpmTasks("grunt-webpack");
};
```

For plugins we cannot support grunt template interpolation, as plugins are class instances which we cannot modify during runtime without breaking them. If you need to use template in a string option to a plugin, you can use lazy config loading and use the supplied config. You can also use grunt inside directly to access utility methods:

```js
module.exports = function (grunt) {
  grunt.initConfig({
    name: "Webpack",
    pkg: {
      copyright: "<%= name %>",
      version: "6.55.345",
    },
    webpack: {
      myconfig: (config) => ({
        entry: path.join(__dirname, "entry"),
        output: {
          path: __dirname,
          filename: "output.js",
        },
        plugins: [
          new webpack.BannerPlugin({
            banner: `/*! ${config.pkg.copyright} - Version ${
              config.pkg.version
            } dated ${grunt.template.today()} */`,
            raw: true,
          }),
        ],
      }),
    },
  });

  grunt.loadNpmTasks("grunt-webpack");
};
```

### Webpack-dev-server

#### imported config

This is a simple example that requires the webpack config from the config file. Read how to configure webpack-dev-server in the [webpack-dev-server documentation][webpack-dev-server-config].

```javascript
const webpackConfig = require("./webpack.config.js");

module.exports = function (grunt) {
  grunt.initConfig({
    "webpack-dev-server": {
      dev: webpackConfig,
    },
  });

  grunt.loadNpmTasks("grunt-webpack");
};
```

> The webpack-dev-server task in this example has one target called `dev`. They can be renamed to everything besides `options`. See the [grunt docs][grunt-targets] for more information about targets.

On the command line you can then do the following.

```bash

# Run webpack-dev-server with the `dev` target
> grunt webpack-dev-server:dev

# Run webpack for all possible targets
> grunt webpack-dev-server
```

> For more examples and information have a look at the [webpack documentation]5] which mostly also applies here besides the noted differences above.

<h2 align="center">Troubleshooting</h2>

### Circular reference detected (.plugins)

If you encounter this message it means that one of the plugins which are present in your config have circular references.
This is not a bug in the plugin and is totally fine for webpack, but sadly grunt cannot handle these.

To workaround this problem use lazy config loading, by wrapping your config inside a function.

```js
const webpackConfig = require("./webpack.config.js");

module.exports = function (grunt) {
  grunt.initConfig({
    webpack: {
      myconfig: () => webpackConfig,
    },
  });

  grunt.loadNpmTasks("grunt-webpack");
};
```

<h2 align="center">Maintainers</h2>

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars1.githubusercontent.com/u/231804?v=3&s=150">
        </br>
        <a href="https://github.com/danez">Daniel Tschinder</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/166921?v=3&s=150">
        </br>
        <a href="https://github.com/bebraw">Juho Vepsäläinen</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars2.githubusercontent.com/u/8420490?v=3&s=150">
        </br>
        <a href="https://github.com/d3viant0ne">Joshua Wiens</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/533616?v=3&s=150">
        </br>
        <a href="https://github.com/SpaceK33z">Kees Kluskens</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/3408176?v=3&s=150">
        </br>
        <a href="https://github.com/TheLarkInn">Sean Larkin</a>
      </td>
    </tr>
  <tbody>
</table>

[grunt-template]: http://gruntjs.com/api/grunt.template
[webpack-config]: https://webpack.js.org/configuration/
[webpack-dev-server-config]: https://webpack.js.org/configuration/dev-server/
[grunt-targets]: https://gruntjs.com/configuring-tasks#task-configuration-and-targets
[webpack-start]: https://webpack.js.org/guides/get-started/
[npm]: https://img.shields.io/npm/v/grunt-webpack.svg
[npm-url]: https://npmjs.com/package/grunt-webpack
