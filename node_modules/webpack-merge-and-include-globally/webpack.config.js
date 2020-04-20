
const MergeIntoSingle = require('./index.node6-compatible.js');
// const MergeIntoSingle = require('./index.js');

const webpack = require('webpack');
const path = require('path');

const uglifyJS = require("uglify-js");
const CleanCSS = require('clean-css');

// Webpack Config
const webpackConfig = {
  entry: ['./example/main.js'],
  devtool: 'cheap-module-source-map',
  output: {
    filename:'bundle.js',
    path: './dist',
  },
  resolve: {
    extensions: ['', '.js', '.css']
  },
  plugins: [

    new MergeIntoSingle({
      files: [{
        src:[
          'node_modules/jquery/**/*.min.js',
          'node_modules/classnames/index.js',
          'node_modules/humps/humps.js'
        ],
        dest: code => {
          const min = uglifyJS.minify(code, {sourceMap: {
              filename: 'vendor.js',
              url: 'vendor.js.map'
            }});
          return {
            'vendor.js':min.code,
            'vendor.js.map': min.map,
          }
        },
      },{
        src: ['example/test.css'],
        dest: code => ({
          'style.css':new CleanCSS({}).minify(code).styles,
        })
      }],


      //also possible:

      // files:{
      //   'vendor.js':[
      //     'node_modules/jquery/**/*.min.js',
      //     'node_modules/classnames/index.js',
      //     'node_modules/humps/humps.js',
      //   ],
      //     'style.css':[
      //     'example/test.css',
      //   ]
      // },
      // transform:{
      //   'vendor.js': code => uglifyJS.minify(code).code,
      //   'style.css': code => new CleanCSS({}).minify(code).styles,
      // },

      hash: false,
    }, filesMap =>{
      console.log("generated files: ",filesMap)
    }),
  ],
  module: {
    loaders: [
      { test: /\.html$/, loader: 'raw-loader' },
    ]
  }
};

module.exports = webpackConfig;
