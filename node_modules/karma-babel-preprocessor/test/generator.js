// Generator is a good test for babel-polyfill because it requires
// regenerator runtime.
function *powers(n) {
  let i = 1;
  while (true) {
    yield Math.pow(i, n);
    i++;
  }
}
