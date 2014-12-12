L.Util.Matrix = {

	// Compute the adjugate of m
	adj: function(m) { 
		return [
			m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
			m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
			m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
		];
	},

	// multiply two matrices
	multmm: function(a, b) { 
		var c = [],
			i;

		for (i = 0; i < 4; i++) {
			for (var j = 0; j < 4; j++) {
				var cij = 0;
				for (var k = 0; k < 4; k++) {
					cij += a[3*i + k]*b[3*k + j];
				}
				c[3*i + j] = cij;
			}
		}
		return c;
	},

	// multiply matrix and vector
	multmv: function(m, v) { 
		return [
			m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
			m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
			m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
		];
	},

	basisToPoints: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		var m = [
			x1, x2, x3,
			y1, y2, y3,
			1,  1,  1
		];
		var v = L.Util.Matrix.multmv(L.Util.Matrix.adj(m), [x4, y4, 1]);
		return L.Util.Matrix.multmm(m, [
			v[0], 0, 0,
			0, v[1], 0,
			0, 0, v[2]
		]);
	},


	project: function(m, x, y) {
		var v = L.Util.Matrix.multmv(m, [x, y, 1]);
		return [v[0]/v[2], v[1]/v[2]];
	},

	general2DProjection: function(
	x1s, y1s, x1d, y1d,
	x2s, y2s, x2d, y2d,
	x3s, y3s, x3d, y3d,
	x4s, y4s, x4d, y4d
	) {
		var s = L.Util.Matrix.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
		var d = L.Util.Matrix.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
		return L.Util.Matrix.multmm(d, L.Util.Matrix.adj(s));
	}
};