L.EXIF = function getEXIFdata(img, overlay) {
  var GPS;
  var lat;
  var lng;
  if (Object.keys(EXIF.getAllTags(img)).length !== 0) {
    console.log(EXIF.getAllTags(img));
    GPS = EXIF.getAllTags(img);
  } else {
    console.log('sorry no');
  }
  if (!GPS) {
    console.log('sorry no GPS');
    return;
  }

  if (typeof GPS.GPSLatitude !== 'undefined' && typeof GPS.GPSLongitude !== 'undefined') {
    // sadly, encoded in [degrees,minutes,seconds]
    // primitive value = GPS.GPSLatitude[x].numerator
    lat =
      GPS.GPSLatitude[0] +
      GPS.GPSLatitude[1] / 60 +
      GPS.GPSLatitude[2] / 3600;
    lng =
      GPS.GPSLongitude[0] +
      GPS.GPSLongitude[1] / 60 +
      GPS.GPSLongitude[2] / 3600;

    if (GPS.GPSLatitudeRef !== 'N') {
      lat = lat * -1;
    }
    if (GPS.GPSLongitudeRef === 'W') {
      lng = lng * -1;
    }
  }

  // Attempt to use GPS compass heading; will require
  // some trig to calc corner points, which you can find below:

  var angle = 0;
  // "T" refers to "True north", so -90, "M" refers to "Magnetic north"
  if (GPS.GPSImgDirectionRef === 'T' || GPS.GPSImgDirectionRef === 'M') {
    angle =
      (Math.PI / 180) *
      (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
  }

  /* If there is orientation data -- i.e. landscape/portrait etc */
  if (GPS.Orientation === 6) {
    // CCW
    angle += (Math.PI / 180) * -90;
  } else if (GPS.Orientation === 8) {
    // CW
    angle += (Math.PI / 180) * 90;
  } else if (GPS.Orientation === 3) {
    // 180
    angle += (Math.PI / 180) * 180;
  }

  if (lat && lng) {
    var panTo = L.latLng(lat, lng);
    console.log('lat:' + lat);
    console.log('lng:' + lng);

    var deltaX = overlay.getCorner(0).lng - overlay.getCorner(1).lng; // width
    var deltaY = overlay.getCorner(0).lat - overlay.getCorner(2).lat; // height

    //  _corners: array element holding a <LatLng> object ([])
    //  changes made to _corners, unlike getCorners (value return only)
    // will actually mutate corners, which is what we need to do

    overlay._corners[0] = L.latLng(lat + deltaY / 2, lng + deltaX / 2);
    overlay._corners[1] = L.latLng(lat + deltaY / 2, lng - deltaX / 2);
    overlay._corners[2] = L.latLng(lat - deltaY / 2, lng + deltaX / 2);
    overlay._corners[3] = L.latLng(lat - deltaY / 2, lng - deltaX / 2);

    overlay.rotateBy(angle);

    overlay._map.setView(panTo, 13);

    return GPS;
  }
};
