# Testing

We use Mocha & Karma with the help of Grunt for testing.

To learn more about these tools, visit the official docs:

- [Mocha](https://mochajs.org/#getting-started)
- [Karma](https://karma-runner.github.io/4.0/config/configuration-file.html)
- [Grunt](https://gruntjs.com/getting-started)

`npm test` runs tests from the `test/` folder. It is just a wrapper around the `grunt test` task, which runs JSHint and Karma tasks.

[JSHint](https://jshint.com/docs/) is a JavaScript code quality tool and an alternative to [ESLint](https://eslint.org/).

[Karma](https://karma-runner.github.io/latest/index.html) is a test runner, it allows us to test our code in multiple browsers and devices.

## Pick a test browser

In `test/karma.conf.js`, you can find the available browser options we include:

```JavaScript
// start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - ChromeHeadless
browsers: ['ChromeHeadless'],
```

available browser launchers: https://npmjs.org/browse/keyword/karma-launcher

## Running a single test block

Attach a `.only()` function call to the `describe` or `it` test block you want to execute.

**EXAMPLE**:

```javascript
it('tests feature 1', function() {
    // I won't run :(
});

it.only('tests feature 2', function() {
    // I'll run :)
});

it('tests feature 3', function() {
    // I won't run :(
});
```

## Skipping tests

Attach `.skip()` function call. Works the same way as `.only()`.

### Note

To make your code production ready, remember to remove your `.only()` and `.skip()` calls. They are meant for development purposes only.
