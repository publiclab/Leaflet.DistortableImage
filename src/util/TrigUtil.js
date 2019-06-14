L.TrigUtil = {

  calcAngleDegrees: function(x, y) {
    return Math.atan2(y, x) * 180 / Math.PI;
  },

  // Converts from degrees to radians.
 radians: function(degrees) {
  return degrees * Math.PI / 180;
}

};