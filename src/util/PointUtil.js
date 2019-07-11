  
L.PointUtil = {

  calcCenterTopPoint: function(topLeft, topRight) {
    var centerPoint = { x: "", y: "" };

    centerPoint.x = topRight.x + (topLeft.x - topRight.x) / 2;
    centerPoint.y = topRight.y + (topLeft.y - topRight.y) / 2;

    return centerPoint;
  } 
};
