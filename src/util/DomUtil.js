L.DomUtil = L.extend(L.DomUtil, {
  getMatrixString: function(m) {
    var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,
      /*
       * Since matrix3d takes a 4*4 matrix, we add in an empty row and column, which act as the identity on the z-axis.
       * See:
       *     http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
       *     https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function#M.C3.B6bius'_homogeneous_coordinates_in_projective_geometry
       */
      matrix = [
        m[0],
        m[3],
        0,
        m[6],
        m[1],
        m[4],
        0,
        m[7],
        0,
        0,
        1,
        0,
        m[2],
        m[5],
        0,
        m[8]
      ],
      str = is3d ? "matrix3d(" + matrix.join(",") + ")" : "";

    if (!is3d) {
      console.log(
        "Your browser must support 3D CSS transforms in order to use DistortableImageOverlay."
      );
    }

    return str;
  },

  getRotateString: function(angle, units) {
    var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,
      open = "rotate" + (is3d ? "3d" : "") + "(",
      rotateString = (is3d ? "0, 0, 1, " : "") + angle + units;

    return open + rotateString + ")";
  },

  /**
   * Copied from Leaflet v0.7 source code - https://github.com/Leaflet/Leaflet/blob/66282f14bcb180ec87d9818d9f3c9f75afd01b30/src/dom/DomUtil.js#L189-L199
   * L.DomUtil.getTranslateString was deprecated in Leaflet v1.0 in favor of L.DomUtil.setTransform -
   * does the same job - but instead of returning a string, it assigns it to the transform CSS property of the element, too.
   */
  getTranslateString: function(point) {
    // on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
    // makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
    // (same speed either way), Opera 12 doesn't support translate3d

    var is3d = L.Browser.webkit3d,
      open = "translate" + (is3d ? "3d" : "") + "(",
      close = (is3d ? ",0" : "") + ")";

    return open + point.x + "px," + point.y + "px" + close;
  },

  toggleClass: function(el, className) {
    var c = className;
    return this.hasClass(el, c) ? this.removeClass(el, c) : this.addClass(el, c);
  },

  confirmDelete: function() {
    return window.confirm("Are you sure? This image will be permanently deleted from the map.");
  },

  confirmDeletes: function(n) {
    var humanized = n === 1 ? "image" : "images";
    return window.confirm("Are you sure? " + n + " " + humanized + " will be permanently deleted from the map.");
  }
});
