beforeEach(function() {
  /* Make expect function available in all tests. */
  window.expect = chai.expect;
});

/* Chain global testing utilites below to chai*/
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/*
 * Mouse Events is a dictionary of "Events" and their properties.
 * Other events include 'click', 'dblick', 'mouseup', 'mouseover', 'mouseout', 'mousemove'
 * Properties can take in properties of MouseEvent.
 * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
 */
chai.simulateEvent = function simulateEventFn(el, type, params) {
  params = params || {
    bubbles: type != 'mouseleave' && type != 'mouseeenter',
    cancelable: type != 'mousemove' && type != 'mouseleave' && type != 'mouseeenter',
  };
  var e = new MouseEvent(type, params);
  return el.dispatchEvent(e);
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/*
 * Asserts that two latlngs are close.
 * For example:
 *     > expect(L.latLng(0, 0.00005)).to.be.closeToLatLng(L.latLng(0, 0))
 *     > true
 */
chai.use(function(chai, utils) {
  var Assertion = chai.Assertion;
  Assertion.addMethod('closeToLatLng', function(actual, delta, message) {
    var obj = utils.flag(this, 'object');

    delta = delta || 1e-4;

    expect(obj).to.have.property('lat');
    expect(obj).to.have.property('lng');

    var lat = new Assertion(obj.lat);
    var lng = new Assertion(obj.lng);

    utils.transferFlags(this, lat, false);
    utils.transferFlags(this, lng, false);

    lat.to.be.closeTo(actual.lat, delta, message);
    lng.to.be.closeTo(actual.lng, delta, message);
  });
});
