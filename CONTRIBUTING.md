Contributing to Leaflet.DistortableImage
==========================

We welcome community contributions to Leaflet.DistortableImage! There are [plenty of outstanding issues to resolve](https://github.com/publiclab/Leaflet.DistortableImage/issues). Please consider helping out.

We especially welcome contributions from people from groups underrepresented in free and open source software. Our community aspires to be a respectful place. Please read and abide by our [Code of Conduct](https://publiclab.org/conduct).

## First Timers Welcome!

This project is a part of Public Lab's OSS community, which welcomes and supports contributions from newcomers to open source/free software. See the Public Lab [WELCOME PAGE](https://code.publiclab.org/#r=all), including a selection of issues we've made especially for first-timers across all projects. We're here to help, so just ask if one looks interesting.

Thank you so much!

Learn more about contributing to Public Lab code projects on these pages:

* https://publiclab.org/developers
* https://publiclab.org/contributing-to-public-lab-software
* https://publiclab.org/soc
* https://publiclab.org/wiki/developers
* https://publiclab.org/wiki/gsoc-ideas

## Setup

1\. This project uses Webpack to bundle JavaScript. From the root directory, run:

```Bash
# installs dependencies and the latest version of leaflet as a peer dependency; builds dist files.
npm run setup
```

 * If you want to install a specific version of leaflet besides the latest, run `npm i leaflet@1.X.X --no-save`

2\. Server setup. **Choose one option below.**

  - a. You can run it with the webpack development server we have set up:

```Bash
# Opens examples/index.html in your default browser and watch live for changes
npm run serve:dev
```

* b. Or to run it with your own server, just ensure that webpack is watching for updates to the `src` files:

```Bash
npm run watch:dev
```

3\. Once you finish, commit your changes and a pre-commit hook automatically updates your `dist` files to a production build (via `npm run build`).

*To learn more about our Webpack configuration file, take a look at [this](WEBPACK.md).*

### Icons

We use SVG for our icon system. Please visit our wiki [SVG Icon System](https://github.com/publiclab/Leaflet.DistortableImage/wiki/SVG-Icon-System) if you are interested in making updates to them or just simply learning about our workflow.

### Testing

[Guide](TESTING.md) on testing LDI.


## Bug reports & troubleshooting

If you are submitting a bug, please go to https://github.com/publiclab/Leaflet.DistortableImage/issues/new/
