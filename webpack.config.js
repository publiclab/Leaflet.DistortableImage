const glob = require('glob');
const path = require('path');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
  mode: process.env.NODE_ENV,
  entry: [
    ...glob.sync('./src/util/*'),
    './src/DistortableImageOverlay.js',
    './src/DistortableCollection.js',
    './src/edit/getEXIFdata.js',
    './src/edit/handles/EditHandle.js',
    ...glob.sync('./src/edit/handles/*', {
      ignore: './src/edit/handles/EditHandle.js',
    }),
    './src/iconsets/IconSet.js',
    './src/iconsets/KeymapperIconSet.js',
    './src/iconsets/ToolbarIconSet.js',
    './src/edit/actions/EditAction.js',
    ...glob.sync('./src/edit/actions/*', {
      ignore: './src/edit/actions/EditAction.js',
    }),
    './src/edit/toolbars/DistortableImage.PopupBar.js',
    './src/edit/toolbars/DistortableImage.ControlBar.js',
    './src/edit/DistortableImage.Edit.js',
    './src/edit/DistortableCollection.Edit.js',
    './src/components/DistortableImage.Keymapper.js',
    './src/mapmixins/DoubleClickZoom.js',
    ...glob.sync('./src/mapmixins/*', {
      ignore: './src/mapmixins/DoubleClickZoom.js',
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'leaflet.distortableimage.js',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devServer: {
    host: 'localhost',
    port: 8081,
    hot: true,
    writeToDisk: true,
    inline: true,
    open: true,
    openPage: 'examples/index.html',
    publicPath: '/dist/',
    clientLogLevel: 'silent',
  },
  devtool: 'source-map',
  stats: 'errors-only',
  plugins: [],
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new MergeIntoSingleFilePlugin({
      files: {
        'vendor.js': [
          './node_modules/leaflet-toolbar/dist/leaflet.toolbar.js',
          './node_modules/webgl-distort/dist/webgl-distort.js',
          './node_modules/glfx/glfx.js',
          './node_modules/exif-js/exif.js',
        ],
        'vendor.css': [
          './node_modules/leaflet-toolbar/dist/leaflet.toolbar.css',
        ],
      },
      transform: {
        'vendor.js': code => require('uglify-js').minify(code).code
      }
    })
  );
  config.plugins.push(
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!leaflet.distortableimage.css']
    })
  );
}

module.exports = config;
