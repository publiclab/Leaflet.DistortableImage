# Webpack configuration file

This file provides documentation for `webpack.config.js`

```javascript
// Include necessary modules
const glob = require('glob');
const path = require('path');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
  // "production" or "development", set by cross-env in NPM scripts
  // Determines which optimizations it needs to apply to our JavaScript files
  mode: process.env.NODE_ENV,
  // Files to bundle(in order from the top to bottom)
  entry: [
    /** glob.sync(folder) returns an array of file paths in the folder
     * ...(spread) operator spreads out an array
     * ["f1", "f2"] -> "f1", "f2"
     * entry only accepts an array of strings(files) to bundle or a single entry file
     */
    ...glob.sync('./src/util/*'),
    './src/DistortableImageOverlay.js',
    './src/DistortableCollection.js',
    './src/edit/getEXIFdata.js',
    './src/edit/handles/EditHandle.js',
    ...glob.sync('./src/edit/handles/*', {
      ignore: './src/edit/handles/EditHandle.js'
    }),
    './src/iconsets/IconSet.js',
    './src/iconsets/KeymapperIconSet.js',
    './src/iconsets/ToolbarIconSet.js',
    './src/edit/actions/EditAction.js',
    ...glob.sync('./src/edit/actions/*', {
      ignore: './src/edit/actions/EditAction.js'
    }),
    './src/edit/toolbars/DistortableImage.PopupBar.js',
    './src/edit/toolbars/DistortableImage.ControlBar.js',
    './src/edit/DistortableImage.Edit.js',
    './src/edit/DistortableCollection.Edit.js',
    './src/components/DistortableImage.Keymapper.js',
    './src/mapmixins/DoubleClickZoom.js',
    ...glob.sync('./src/mapmixins/*', {
      ignore: './src/mapmixins/DoubleClickZoom.js'
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'leaflet.distortableimage.js',

    /**
     * Webpack dev server regenerates new hot update files on changes in src code.
     * The 2 options below have it override the existing ones instead,
     */

    // Filename of hot update chunks
    hotUpdateChunkFilename: 'hot/hot-update.js',
    // The main hot update filename
    hotUpdateMainFilename: 'hot/hot-update.json'
  },
  module: {
    rules: [
      {
        // Apply Babel transformations to JavaScript files only
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          // Integrate Babel with Webpack
          loader: 'babel-loader',
          options: {
            /**
             * Presets are Babel plugins.
             * @babel/preset-env allows us to write next generation JavaScript.
             * (promises, arrow functions, spread & rest operator...)
             */
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devServer: {
    host: 'localhost',
    port: 8081,
    // Enable Hot Module Replacement (HMR), allowing
    // module updates without forcing a page reload.
    hot: true,
    // Make bundled files available on this location.
    publicPath: '/dist/',
    writeToDisk: true,
    // Make build messages appear in the browser console
    inline: true,
    // Open page in user's default browser
    open: true,
    openPage: 'examples/index.html',
    // Make less messages appeaar in browser console
    clientLogLevel: 'silent',
  },
  // Generate source maps
  devtool: 'source-map',
  // Minimize Webpack's output in terminal, only show errors
  stats: 'errors-only',
  plugins: []
};

/**
 * These plugins are only added in the production mode.
 * Constantly bundling 3rd party files on a change in src/ folder would drastically slow
 * down our Webpack development server.
 * Deleting dist/ folder on a change in src/ doesn't make sense either.
 */
if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new MergeIntoSingleFilePlugin({
      files: {
        // Bundle an array of 3rd party JavaScript files in dist/vendor.js
        'vendor.js': [
          './node_modules/leaflet-toolbar/dist/leaflet.toolbar.js',
          './node_modules/webgl-distort/dist/webgl-distort.js',
          './node_modules/glfx/glfx.js',
          './node_modules/exif-js/exif.js'
        ],
        // Bundle an array of 3rd party CSS files in dist/vendor.css
        'vendor.css': [
          './node_modules/leaflet-toolbar/dist/leaflet.toolbar.css'
        ]
      },
      // Apply optimizations to bundled files
      transform: {
        // Minify and optimize vendor.js
        'vendor.js': code => require('uglify-js').minify(code).code
      }
    })
  );
  config.plugins.push(
    // Before each build clean dist/ folder(except leaflet.distortableimage.css)
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!leaflet.distortableimage.css']
    })
  );
}

module.exports = config;
```
