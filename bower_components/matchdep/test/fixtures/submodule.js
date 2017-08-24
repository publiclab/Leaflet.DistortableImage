var matchdep = require('../../lib/matchdep');

exports.defaultConfig = function() {
  return matchdep.filter('*');
};

exports.fileConfig = function() {
  return matchdep.filter('*', 'package.json');
};

exports.relativeConfig = function() {
  return matchdep.filter('*', './package.json');
};

exports.relativeConfig2 = function() {
  return matchdep.filter('*', '../../package.json');
};

exports.absoluteConfig = function() {
  return matchdep.filter('*', __dirname + '/package.json');
};
