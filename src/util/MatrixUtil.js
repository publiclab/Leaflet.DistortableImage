L.MatrixUtil = {

	matrixArrayToCssMatrix: function (array) {
		var is3d = L.Browser.webkit3d || L.Browser.gecko3d || L.Browser.ie3d,
			str = is3d ? "matrix3d(" + array.join(',') + ")" : "";

		if (!is3d) {
		  console.log("Your browser must support 3D CSS transforms in order to use DistortableImageOverlay.");
        }

  		return str;
	},

	/* Since matrix3d takes a 4*4 matrix, we add in an empty row and column, which act as the identity on the z-axis. */
	from2dTo3dMatrix: function(m) {
	 return [
        m[0], m[3], 0, m[6],
        m[1], m[4], 0, m[7],
        0, 0, 1, 0,
        m[2], m[5], 0, m[8]
	  ];
  	},

	multiplyMatrices: function (a, b) {
  
		// TODO - Simplify for explanation
		// currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337
		
		var result = [];
		
		var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
			a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
			a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
			a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

		// Cache only the current line of the second matrix
		var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
		result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
		result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
		result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
		result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
		result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
		result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
		result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

		return result;
	},

	multiplyArrayOfMatrices: function (matrices) {
  
		var inputMatrix = matrices[0];
		
		for(var i=1; i < matrices.length; i++) {
			inputMatrix = L.MatrixUtil.multiplyMatrices(inputMatrix, matrices[i]);
		}
		
		return inputMatrix;
	},

	identityMatrix: function() {
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		];
	},


	translateMatrix: function (x, y, z) {
		return [
			1,    0,    0,   0,
			0,    1,    0,   0,
			0,    0,    1,   0,
			x,    y,    z,   1
		];
	},

	scaleMatrix: function(w, h, d) {
		return [
			w,    0,    0,   0,
			0,    h,    0,   0,
			0,    0,    d,   0,
			0,    0,    0,   1
		];
	},

	rotateAroundZAxisMatrix: function(a) {
  
		return [
			Math.cos(a), -Math.sin(a),    0,    0,
			Math.sin(a),  Math.cos(a),    0,    0,
				0,       0,    1,    0,
				0,       0,    0,    1
		];
	},

	// Compute the adjugate of m
	adj: function(m) { 
		return [
			m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
			m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
			m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3]
		];
	},

	// multiply two 3*3 matrices
	multmm: function(a, b) { 
		var c = [],
			i;

		for (i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				var cij = 0;
				for (var k = 0; k < 3; k++) {
					cij += a[3*i + k]*b[3*k + j];
				}
				c[3*i + j] = cij;
			}
		}
		return c;
	},

	// multiply a 3*3 matrix and a 3-vector
	multmv: function(m, v) { 
		return [
			m[0]*v[0] + m[1]*v[1] + m[2]*v[2],
			m[3]*v[0] + m[4]*v[1] + m[5]*v[2],
			m[6]*v[0] + m[7]*v[1] + m[8]*v[2]
		];
	},

	// multiply a scalar and a 3*3 matrix
	multsm: function(s, m) {
		var matrix = [];

		for (var i = 0, l = m.length; i < l; i++) {
			matrix.push(s*m[i]);
		}

		return matrix;
	},

	basisToPoints: function(x1, y1, x2, y2, x3, y3, x4, y4) {
		var m = [
				x1, x2, x3,
				y1, y2, y3,
				1,  1,  1
			],
			v = L.MatrixUtil.multmv(L.MatrixUtil.adj(m), [x4, y4, 1]);

		return L.MatrixUtil.multmm(m, [
			v[0], 0, 0,
			0, v[1], 0,
			0, 0, v[2]
		]);
	},


	project: function(m, x, y) {
		var v = L.MatrixUtil.multmv(m, [x, y, 1]);
		return [v[0]/v[2], v[1]/v[2]];
	},

	general2DProjection: function(
	x1s, y1s, x1d, y1d,
	x2s, y2s, x2d, y2d,
	x3s, y3s, x3d, y3d,
	x4s, y4s, x4d, y4d
	) {
		var s = L.MatrixUtil.basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s),
			d = L.MatrixUtil.basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d),
			m = L.MatrixUtil.multmm(d, L.MatrixUtil.adj(s));

		/* 
		 *	Normalize to the unique matrix with m[8] == 1. 
		 * 	See: http://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
		 */
		return L.MatrixUtil.multsm(1/m[8], m);
	}
};