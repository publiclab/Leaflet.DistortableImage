// Class syntax is a good test for the preprocessor because it is not supported
// by PhantomJS 1.9.
class Hello {
  constructor(name) {
    this.name = name;
  }

  say() {
    return `Hello, ${this.name}!`;
  }
}
