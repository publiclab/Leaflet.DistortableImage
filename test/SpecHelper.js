beforeEach(function() {
	/* Make expect function available in all tests. */
	window.expect = chai.expect;
});

	/* Chain global testing utilites below to chai*/

	chai.simulateCommandMousedown = function simulateCommandMousedownFn(el) {
  		if (document.createEvent) {
    		var e = document.createEvent('MouseEvents');
    		e.initMouseEvent('mousedown', true, true, window, 0, 0, 0, 0, 0, true, false, false, true, 0, null);
    		return el.dispatchEvent(e);
  		}
	};

	/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* 
 * Asserts that two latlngs are close. 
 * For example: 
 *     > expect(new L.LatLng(0, 0.00005)).to.be.closeToLatLng(new L.LatLng(0, 0))
 *     > true
 */
chai.use(function(chai, utils) {
	var Assertion = chai.Assertion;
	Assertion.addMethod('closeToLatLng', function(actual, delta, message) {
		var obj = utils.flag(this, 'object');

		delta = delta || 1e-4;	

		expect(obj).to.have.property('lat');
		expect(obj).to.have.property('lng');

		var lat = new Assertion(obj.lat),
			lng = new Assertion(obj.lng);

		utils.transferFlags(this, lat, false);
		utils.transferFlags(this, lng, false);

		lat.to.be.closeTo(actual.lat, delta, message);
		lng.to.be.closeTo(actual.lng, delta, message);
	});
});
