# MERGE INTO SINGLE FILE PLUGIN FOR WEBPACK

Webpack plugin to merge your source files together into single file, to be included in index.html, and achieving same effect as you would by including them all separately through `<script>` or `<link>`.

### Getting Started

```bash
npm install --save-dev webpack-merge-and-include-globally
```

### Usage

Lets say you want to make libraries like `jquery`, `moment` (including 3 languages) and `toastr` available globally, and you're struggling to make them global with webpack or just importing them (in cases they aren't written well) because require() wraps the code into new scope and you want to execute it against a global scope, and you don't want to do this:
```html
  <script src="/node_modules/jquery/dist/jquery.min.js"></script>
  <script src="/node_modules/moment/moment.js"></script>
  <script src="/node_modules/moment/locale/cs.js"></script>
  <script src="/node_modules/moment/locale/de.js"></script>
  <script src="/node_modules/moment/locale/nl.js"></script>
  <script src="/node_modules/toastr/build/toastr.min.js"></script>
  
  <link rel="stylesheet" href="/node_modules/toastr/build/toastr.min.css">
```
because your `node_modules` is not available in production.
<br/>with this plugin you can achieve the desired effect this way:
```javascript

  const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
  
  module.exports = {
    ...
    plugins: [
        new MergeIntoSingleFilePlugin({
            files: {
                "vendor.js": [
                    'node_modules/jquery/dist/jquery.min.js',
                    //  will work too
                    //  'node_modules/jquery/**/*.min.js',
                    'node_modules/moment/moment.js',
                    'node_modules/moment/locale/cs.js',
                    'node_modules/moment/locale/de.js',
                    'node_modules/moment/locale/nl.js',
                    'node_modules/toastr/build/toastr.min.js'
                ],
                "vendor.css": [
                    'node_modules/toastr/build/toastr.min.css'
                ]
            }
        }),
    ]

```
this generates 2 files with merged js and css content, include them into your `index.html` to take effect:
``` html
  <script src="./vendor.js"></script>
  <link rel="stylesheet" href="./vendor.css">
```
now `jQuery`, `moment` and `toastr` are available globally throughout your application.

### Options

#### files (as object)

Object that maps file names to array of all files (can also be defined by wildcard path) that will be merged together and saved under each file name.
<br/>For example to merge `jquery`, `classnames` and `humps` into `vendor.js`, do:
```javascript
new MergeIntoSingle({
  files: {
    'vendor.js': [
      'node_modules/jquery/**/*.min.js',
      'node_modules/classnames/index.js',
      'node_modules/humps/humps.js'
    ],
    'style.css': [
      'example/test.css'
    ]
  }
})
```

#### transform

Object that maps resulting file names to tranform methods that will be applied on merged content before saving. Use to minify / uglify the result.
<br/>For example to minify the final merge result of `vendor.js`, do:
```javascript
new MergeIntoSingle({
  files: { 'vendor.js': [...] },
  transform: {
    'vendor.js': code => require("uglify-js").minify(code).code
  }
})
```

#### files (as array)

Alternative way to specify files as array of `src` & `dest`, for flexibility to transform and create multiple destination files for same source when you need to generate additional map file for example.
```javascript
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
        'vendor.js.map': min.map
      }
    },

    // also possible:
    //
    // dest: 'vendor.js'
  },{
    src: ['example/test.css'],
    dest: 'style.css'

    // also possible:
    //
    // dest: code => ({
    //   'style.css':new CleanCSS({}).minify(code).styles
    // })
  }]
})
```

#### hash
default: false

set `true` to append version hash before file extension.

you can get names of generated files mapped to original by passing callback function as second argument to plugin: 
```javascript
new MergeIntoSingle({ ... }, filesMap => { ... }),
```

#### transformFileName
default: undefined

also you can pass function for change output file name with hash
```javascript
new MergeIntoSingle({
  ...,
  transformFileName: (fileNameBase, extension, hash) => `${fileName}.[${hash}]${extension}`,
  // bundle.[somehash].js
}),

//or

new MergeIntoSingle({
  ...,
  transformFileName: (fileNameBase, extension, hash) => `${fileNameBase}${extension}?hash=${hash}`,
  // bundle.js?hash=somehash
}),

```

#### encoding

default: 'utf-8'

encoding of node.js reading

#### chunks

default: undefined

array of entry points (strings) for which this plugin should run only

#### separator

default: '\n'

string used between files when joining them together

### Working Example

working example already included in project.
<br/>to test first install `npm i`, then run `npm run start` to see it in action
<br/>and `npm run build` to build prod files with vendor file and `index.html`.
