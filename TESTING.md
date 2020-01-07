## Testing

We use Mocha & Karma with the help of Grunt for testing.

To learn more about these tools, visit the official docs:

- [Mocha](https://mochajs.org/#getting-started)
- [Karma](https://karma-runner.github.io/4.0/config/configuration-file.html)
- [Grunt](https://gruntjs.com/getting-started)

`npm test` runs tests from the `test/` folder.



`npm test` is just a wrapper around `grunt test` task which runs JSHint and Karma tasks.

[JSHint](https://jshint.com/docs/) is a JavaScript code quality tool, an alternative to [ESLint](https://eslint.org/).

[Karma](https://karma-runner.github.io/latest/index.html) is a test runner, it allows us to test our code in multiple browsers and devices.



### Running just one test

For this, you need to install Mocha globally. Run `npm i -g mocha`

After you've successfully installed Mocha, you can run just one type of test by passing a test file to Mocha:

`mocha <filename>.js`



### Running a single test block within a test file

In order to do this, you don't need to install Mocha globally.

You can just attach a `.only()` function call to a test block that you want to execute.

It can be attached to both, `describe` and `it` test blocks.



**EXAMPLE**:

```javascript
it('tests feature 1', function(){
    // I won't run :(
});

it.only('tests feature 2', function(){
    // I'll run :)
});

it('tests feature 3', function(){
    // I won't run :(
});
```



### Skipping tests

Sometimes, we just want to write a boilerplate code for a test, but we don't want to implement it yet.

We can attach `.skip()` function call, which will skip our `it` or `describe` blocks, works just like `.only()`.



**NOTE**: After you finish writing a test, remember to remove your `.only()`or `.skip()` calls.

They are meant for development purposes, in the production we don't want to alter the actual code of our tests.