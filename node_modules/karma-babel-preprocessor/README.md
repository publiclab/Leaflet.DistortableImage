[![build status](https://img.shields.io/travis/babel/karma-babel-preprocessor.svg)](https://travis-ci.org/babel/karma-babel-preprocessor)
[![npm version](https://img.shields.io/npm/v/karma-babel-preprocessor.svg)](https://www.npmjs.org/package/karma-babel-preprocessor)
[![npm downloads](https://img.shields.io/npm/dm/karma-babel-preprocessor.svg)](https://www.npmjs.org/package/karma-babel-preprocessor)

# karma-babel-preprocessor

> Preprocessor to compile ES6 on the fly with [babel](https://github.com/6to5/babel).

**babel and karma-babel-preprocessor only convert ES6 modules to CommonJS/AMD/SystemJS/UMD. If you choose CommonJS, you still need to resolve and concatenate CommonJS modules on your own. We recommend [karma-browserify](https://github.com/Nikku/karma-browserify) + [babelify](https://github.com/babel/babelify) or [webpack](https://github.com/webpack/karma-webpack) + [babel-loader](https://github.com/babel/babel-loader) in such cases.**

## Installation

With babel 7.x:

```bash
npm install karma-babel-preprocessor @babel/core @babel/preset-env --save-dev
```

With babel 6.x:

```bash
npm install karma-babel-preprocessor@7 babel-core babel-preset-env --save-dev
```

As of Babel 6.0, [you need to tell Babel which features to use](http://babeljs.io/docs/plugins/). [@babel/preset-env](http://babeljs.io/docs/plugins/preset-env/) would be the most common one.

## Configuration

See [babel options](https://babeljs.io/docs/usage/options) for more details.

Given `options` properties are passed to babel.

In addition to the `options` property, you can configure any babel options with function properties. This is useful when you want to give different babel options from file to file.

For example, inline sourcemap configuration would look like the following.

```js
module.exports = function (config) {
  config.set({
    preprocessors: {
      'src/**/*.js': ['babel'],
      'test/**/*.js': ['babel']
    },
    babelPreprocessor: {
      options: {
        presets: ['@babel/preset-env'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    }
  });
};
```

### Don't preprocess third-party libraries

Third-party libraries may not work properly if you apply `karma-babel-preprocessor` to them. It also introduces unnecessary overhead. Make sure to explicitly specify files that you want to preprocess.

OK:

```js
module.exports = function (config) {
  config.set({
    preprocessors: {
      'src/**/*.js': ['babel'],
      'test/**/*.js': ['babel']
    },
    // ...
  });
};
```

NG:

```js
module.exports = function (config) {
  config.set({
    preprocessors: {
      './**/*.js': ['babel']
    },
    // ...
  });
};
```

Because it preprocesses files in `node_modules` and may break third-party libraries like jasmine #18.

### Polyfill

If you need [polyfill](https://babeljs.io/docs/usage/polyfill/), make sure to include it in `files`.

```bash
npm install @babel/polyfill --save-dev
```

```js
module.exports = function (config) {
  config.set({
    files: [
      'node_modules/@babel/polyfill/dist/polyfill.js',
      // ...
    ],
    // ...
  });
});
```

### Karma's plugins option

In most cases, you don't need to explicitly specify `plugins` option. By default, Karma loads all sibling NPM modules which have a name starting with karma-*. If need to do so for some reason, make sure to include `'karma-babel-preprocessor'` in it.

```js
module.exports = function (config) {
  config.set({
    plugins: [
     'karma-jasmine',
     'karma-chrome-launcher',
     'karma-babel-preprocessor'
    ],
    // ...
  });
};
```

## Custom preprocessor

karma-babel-preprocessor supports custom preprocessor. Set `base: 'babel'` in addition to normal preprocessor config.

```js
module.exports = function (config) {
  config.set({
    preprocessors: {
      'src/**/*.js': ['babelSourceMap'],
      'test/**/*.js': ['babelSourceMap']
    },
    customPreprocessors: {
      babelSourceMap: {
        base: 'babel',
        options: {
          presets: ['@babel/preset-env'],
          sourceMap: 'inline'
        },
        filename: function (file) {
          return file.originalPath.replace(/\.js$/, '.es5.js');
        },
        sourceFileName: function (file) {
          return file.originalPath;
        }
      },
      // Other custom preprocessors...
    }
  });
};
```
