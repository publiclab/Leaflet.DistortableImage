"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash.isplainobject"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function forEachObject(obj, fn, path) {
  for (const key in obj) {
    const deepPath = path ? `${path}.${key}` : key; // Note that we always use obj[key] because it might be mutated by forEach

    fn.call(obj, obj[key], key, obj, deepPath);
    forEach(obj[key], fn, deepPath);
  }
}

function forEachArray(array, fn, path) {
  array.forEach((value, index, arr) => {
    const deepPath = `${path}[${index}]`;
    fn.call(arr, value, index, arr, deepPath); // Note that we use arr[index] because it might be mutated by forEach

    forEach(arr[index], fn, deepPath);
  });
}

function forEach(value, fn, path) {
  path = path || '';

  if (Array.isArray(value)) {
    forEachArray(value, fn, path);
  } else if ((0, _lodash.default)(value)) {
    forEachObject(value, fn, path);
  }
}

var _default = forEach;
exports.default = _default;
module.exports = exports.default;