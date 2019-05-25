L.tools = L.tools || {};

L.tools.EXIF = function getEXIFdata(ref, overlay) {
    var GPS = ref.exifdata,
        altitude, lat, lng;

    /* If the lat/lng is available. */
    if (
        typeof GPS.GPSLatitude !== "undefined" &&
        typeof GPS.GPSLongitude !== "undefined"
    ) {
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

        if (GPS.GPSLatitudeRef !== "N") {
            lat = lat * -1;
        }
        if (GPS.GPSLongitudeRef === "W") {
            lng = lng * -1;
        }
    }

    // Attempt to use GPS compass heading; will require
    // some trig to calculate corner points, which you can find below:

    var angle = 0;
    // "T" refers to "True north", so -90.
    if (GPS.GPSImgDirectionRef === "T") {
        angle =
            (Math.PI / 180) *
            (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    }
    // "M" refers to "Magnetic north"
    else if (GPS.GPSImgDirectionRef === "M") {
        angle =
            (Math.PI / 180) *
            (GPS.GPSImgDirection.numerator / GPS.GPSImgDirection.denominator - 90);
    } else {
        console.log("No compass data found");
    }

    console.log("Orientation:", GPS.Orientation);

    /* If there is orientation data -- i.e. landscape/portrait etc */
    if (GPS.Orientation === 6) {
        //CCW
        angle += (Math.PI / 180) * -90;
    } else if (GPS.Orientation === 8) {
        //CW
        angle += (Math.PI / 180) * 90;
    } else if (GPS.Orientation === 3) {
        //180
        angle += (Math.PI / 180) * 180;
    }

    /* If there is altitude data */
    if (
        typeof GPS.GPSAltitude !== "undefined" &&
        typeof GPS.GPSAltitudeRef !== "undefined"
    ) {
        // Attempt to use GPS altitude:
        // (may eventually need to find EXIF field of view for correction)
        if (
            typeof GPS.GPSAltitude !== "undefined" &&
            typeof GPS.GPSAltitudeRef !== "undefined"
        ) {
            altitude =
                GPS.GPSAltitude.numerator / GPS.GPSAltitude.denominator +
                GPS.GPSAltitudeRef;
        } else {
            altitude = 0; // none
        }
    }

    var panTo = new L.latLng(lat, lng);

    var x_diff = overlay._corners[0].lng - overlay._corners[1].lng; // width -- a
    var y_diff = overlay._corners[0].lat - overlay._corners[2].lat; // height -- b

    overlay._corners[0] = new L.latLng(lat + y_diff / 2, lng + x_diff / 2);
    overlay._corners[1] = new L.latLng(lat + y_diff / 2, lng - x_diff / 2);
    overlay._corners[2] = new L.latLng(lat - y_diff / 2, lng + x_diff / 2);
    overlay._corners[3] = new L.latLng(lat - y_diff / 2, lng - x_diff / 2);

    overlay.editing._rotateBy(angle);

    overlay._map.setView(panTo, 13);
};
