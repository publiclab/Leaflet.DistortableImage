L.DomUtil = L.extend(L.DomUtil, {
	getMatrixString: function(m) {
		var is3d = L.Browser.webkit3d,
			/* Since matrix3d takes a 4*4 matrix, we add in an empty row and column, which act as the identity on the z-axis. */
			matrix = [
				m[0], m[3], 0, m[6],
				m[1], m[4], 0, m[7],
				   0,    0, 1,    0,
				m[2], m[5], 0, m[8]
			];

		if (!is3d) { throw 'Your browser must support 3D CSS transforms in order to use DistortableImageOverlay.'; }

		return 'matrix3d(' + matrix.join(',') + ')';
	},

	getRotateString: function(angle, units) {
		var is3d = L.Browser.webkit3d,
			open = 'rotate' + (is3d ? '3d' : '') + '(',
			rotateString = (is3d ? '0, 0, 1, ' : '') + angle + units;
			
		return open + rotateString + ')';
	}
});