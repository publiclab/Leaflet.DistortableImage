L.TrigUtil = {
  calcAngleDegrees: function(x, y) {
    return (Math.atan2(y, x) * 180) / Math.PI;
  },

  radiansToDegrees: function(angle) {
    return (angle * 180) / Math.PI;
  },

  degreesToRadians: function(angle) {
    return (angle * Math.PI) / 180;
  }
};