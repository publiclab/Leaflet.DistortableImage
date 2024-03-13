/* eslint-disable no-unused-vars */
L.EXIF = function getEXIFdata(img) {
  if (Object.keys(EXIF.getAllTags(img)).length !== 0) {
    console.log(EXIF.getAllTags(img));
    var GPS = EXIF.getAllTags(img);
    var altitude;

    /* If the lat/lng is available. */
    if (
      typeof GPS.GPSLatitude !== 'undefined' &&
      typeof GPS.GPSLongitude !== 'undefined'
    ) {
      // sadly, encoded in [degrees,minutes,seconds]
      // primitive value = GPS.GPSLatitude[x].numerator
      var lat =
        GPS.GPSLatitude[0] +
        GPS.GPSLatitude[1] / 60 +
        GPS.GPSLatitude[2] / 3600;
      var lng =
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
    // "T" refers to "True north", so -90.
    if (GPS.GPSImgDirectionRef === 'T') {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
      // "M" refers to "Magnetic north"
    } else if (GPS.GPSImgDirectionRef === 'M') {
      angle =
        (Math.PI / 180) *
        (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    } else {
      console.log('No compass data found');
    }

    console.log('Orientation:', GPS.Orientation);

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

    /* If there is altitude data */
    if (
      typeof GPS.GPSAltitude !== 'undefined' &&
      typeof GPS.GPSAltitudeRef !== 'undefined'
    ) {
      // Attempt to use GPS altitude:
      // (may eventually need to find EXIF field of view for correction)
      if (
        typeof GPS.GPSAltitude !== 'undefined' &&
        typeof GPS.GPSAltitudeRef !== 'undefined'
      ) {
        altitude =
          GPS.GPSAltitude.numerator / GPS.GPSAltitude.denominator +
          GPS.GPSAltitudeRef;
      } else {
        altitude = 0; // none
      }
    }
  } else {
    alert('EXIF initialized. Press again to view data in console.');
  }
};
