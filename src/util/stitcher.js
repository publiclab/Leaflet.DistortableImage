function stitcher(processedPoints, overlay, map) { // jshint ignore:line
  var center, corners;
  var sectors = {s00: [], s01: [], s10: [], s11: [], population: []};
  for (var i in processedPoints.points) {
    sectors.s00[i] = [];
    sectors.s01[i] = [];
    sectors.s10[i] = [];
    sectors.s11[i] = [];
    center = processedPoints.images[i].getCenter();
    corners = processedPoints.images[i].getCorners();
    for (var j in processedPoints.points[i]) {
      if (
        processedPoints.points[i][j].lng > corners[1].lng &&
        processedPoints.points[i][j].lng < center.lng
      ) {
        if (
          processedPoints.points[i][j].lat > corners[3].lat &&
          processedPoints.points[i][j].lat < center.lat
        ) {
          sectors.s10[i].push(processedPoints.points[i][j]);
        } else {
          sectors.s00[i].push(processedPoints.points[i][j]);
        }
      } else {
        if (
          processedPoints.points[i][j].lat > corners[2].lat &&
          processedPoints.points[i][j].lat < center.lat
        ) {
          sectors.s11[i].push(processedPoints.points[i][j]);
        } else {
          sectors.s01[i].push(processedPoints.points[i][j]);
        }
      }
    }
  }
  for (i=0; i<processedPoints.points.length; i++) {
    sectors.population[i] = [];
    sectors.population[i].push([
      sectors.s00[i].length,
      sectors.s01[i].length,
      sectors.s10[i].length,
      sectors.s11[i].length
    ]);
  }
  var max = 0,
    min = 10,
    max_ = 0,
    max_idx;
  for (i in sectors.population[0][0]) {
    if (sectors.population[0][0][i] > max) {
      max = sectors.population[0][0][i];
      max_idx = i;
    }
    if (sectors.population[0][0][i] < min) {
      min = sectors.population[0][0][i];
    }
  }
  if (max !== min) {
    var coordinates = sectors[Object.keys(sectors)[max_idx]][0];
    for (var u in processedPoints.points[0]) {
      for (var v in coordinates) {
        if (processedPoints.points[0][u] === coordinates[v]) {
          if (processedPoints.confidences[0][u] > max_) {
            max_ = processedPoints.confidences[0][u];
          }
        }
      }
    }
    var best_point =
      processedPoints.points[0][processedPoints.confidences[0].indexOf(max_)]; //	alternate overlay
    var corresponding_best_point =
      processedPoints.points[1][processedPoints.confidences[0].indexOf(max_)];
    document.querySelector(
      "#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-marker-pane"
    ).innerHTML = "";
    if(document.querySelectorAll("#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path").length) {
      [].slice.call(document.querySelectorAll("#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-overlay-pane > svg > g > path")).slice(0,3).map(function(x) {
        x.parentNode.removeChild(x);
      });
    }
    var lat_offset = -best_point.lat + corresponding_best_point.lat;
    var lng_offset = -best_point.lng + corresponding_best_point.lng;
    // revert this effect completely
    overlay._corners[0] = [
      processedPoints.images[1].getCorner(0).lat - lat_offset,
      processedPoints.images[1].getCorner(0).lng - lng_offset
    ];
    overlay._corners[1] = [
      processedPoints.images[1].getCorner(1).lat - lat_offset,
      processedPoints.images[1].getCorner(1).lng - lng_offset
    ];
    overlay._corners[2] = [
      processedPoints.images[1].getCorner(2).lat - lat_offset,
      processedPoints.images[1].getCorner(2).lng - lng_offset
    ];
    overlay._corners[3] = [
      processedPoints.images[1].getCorner(3).lat - lat_offset,
      processedPoints.images[1].getCorner(3).lng - lng_offset
    ];
    var zoom_level = map.getZoom();
    window.alt = window.alt+1||1;
    map.setView(overlay.getCenter(), (zoom_level%2?zoom_level+1:zoom_level-1));
    // enable editing after image displacement
    L.DomEvent.on(overlay._image, 'mousedrag', overlay.editing.enable, overlay.editing);
  }
}
