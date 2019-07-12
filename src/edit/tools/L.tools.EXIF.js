L.tools = L.tools || {};

L.tools.EXIF = function getEXIFdata(ref, overlay) {
  var GPS = ref.exifdata,
    lat,
    lng;
  
  if (
    typeof GPS.GPSLatitude !== "undefined" &&
    typeof GPS.GPSLongitude !== "undefined"
  ) {
    lat =
      GPS.GPSLatitude[0] + GPS.GPSLatitude[1] / 60 + GPS.GPSLatitude[2] / 3600;
    lng =
      GPS.GPSLongitude[0] +
      GPS.GPSLongitude[1] / 60 +
      GPS.GPSLongitude[2] / 3600;

    if (GPS.GPSLatitudeRef !== "N") {
      lat = lat * -1;
    }
    if (GPS.GPSLongitudeRef === "W") {
      lng = lng * -1;
    }
  }

  var angle = 0;

  if (GPS.GPSImgDirectionRef === "T" || GPS.GPSImgDirectionRef === "M") {
    angle =
      (Math.PI / 180) *
      (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
  }

  if (GPS.Orientation === 6) {
    angle += (Math.PI / 180) * -90;
  } else if (GPS.Orientation === 8) {
    angle += (Math.PI / 180) * 90;
  } else if (GPS.Orientation === 3) {
    angle += (Math.PI / 180) * 180;
  }

  var panTo = L.latLng(lat, lng);

  var x_diff = overlay.getCorner(0).lng - overlay.getCorner(1).lng; // width
  var y_diff = overlay.getCorner(0).lat - overlay.getCorner(2).lat; // height

    //  _corners: array element holding a <LatLng> object ([])
    //  changes made to _corners, unlike getCorners (value return only)
    // will actually mutate corners, which is what we need to do
  
  overlay._corners[0] = L.latLng(lat + y_diff / 2, lng + x_diff / 2);
  overlay._corners[1] = L.latLng(lat + y_diff / 2, lng - x_diff / 2);
  overlay._corners[2] = L.latLng(lat - y_diff / 2, lng + x_diff / 2);
  overlay._corners[3] = L.latLng(lat - y_diff / 2, lng - x_diff / 2);

  overlay.editing._rotateBy(angle);

  overlay._map.setView(panTo, 13);

  return GPS;
};
