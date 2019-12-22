L.TrigUtil = {

  calcAngle: function(x, y, unit = 'deg') {
    return unit === 'deg' ?
        this.radiansToDegrees(Math.atan2(y, x)) :
        Math.atan2(y, x);
  },

  radiansToDegrees: function(angle) {
    return (angle * 180) / Math.PI;
  },

  degreesToRadians: function(angle) {
    return (angle * Math.PI) / 180;
  },
};
