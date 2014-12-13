describe("L.MatrixUtil", function() {
	var identity;

	beforeEach(function() {
		identity = [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1
		];
	});

	describe(".multmm", function() {
		it("Should act as the identity when the identity matrix is on the left.", function() {
			var test = [1, 2, 3, 4, 5, 6, 7, 8, 9],
				left = L.MatrixUtil.multmm(identity, test);

			expect(left).to.deep.equal(test);
		});

		it("Should act as the identity when the identity matrix is on the right.", function() {
			var test = [1, 2, 3, 4, 5, 6, 7, 8, 9],
				right = L.MatrixUtil.multmm(test, identity);

			expect(right).to.deep.equal(test);
		});
	});

	describe(".general2DProjection", function() {
		/* AssertionError: expected [ -1, 0, 0, 0, -1, 0, 0, 0, -1 ] to equal [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ] */
		it.skip("Should return the 3*3 identity matrix when each corner is mapped back to itself.", function() {
			var identityMap = [
					0, 0, 0, 0,
					1, 0, 1, 0,
					0, 1, 0, 1,
					1, 1, 1, 1
				],
				projected = L.MatrixUtil.general2DProjection.apply(undefined, identityMap);

			expect(projected).to.equal(identity);
		});

		/* AssertionError: expected [ -27, 0, 0, 0, -27, 0, 0, 0, -9 ] to deeply equal [ 3, 0, 0, 0, 3, 0, 0, 0, 3 ] */
		it.skip("Should return a scalar multiple of the 3*3 identity matrix when the image is scaled.", function() {
			var dilationMap = [
					0, 0, 0, 0,
					1, 0, 3, 0,
					0, 1, 0, 3,
					1, 1, 3, 3
				],
				projected = L.MatrixUtil.general2DProjection.apply(undefined, dilationMap);

			expect(projected).to.deep.equal([3, 0, 0, 0, 3, 0, 0, 0, 3]);
		});
	});
});