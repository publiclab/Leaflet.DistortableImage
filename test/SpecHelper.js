beforeEach(function() {
  /* Make expect function available in all tests. */
  window.expect = chai.expect;
});

/* Chain global testing utilites below to chai*/

chai.mouseEvents = {
  ShiftMouseDown: {
    type: 'mousedown',
    isShift: true,
  },
  MouseDown: {
    type: 'mousedown',
    isShift: false,
  },
  Click: {
    type: 'click',
    isShift: false,
  },
  Dblclick: {
    type: 'dblclick',
    isShift: false,
  }
}

/*
 * Mouse Events is a dictionary of "Events" and their properties. 
 * Other events include 'click', 'dblick', 'mouseup', 'mouseover', 'mouseout', 'mousemove'
 * Properties can take in properties of initMouseEvents().
 */
chai.simulateEvent = function simulateEventFn(el, event) {
  if (document.createEvent) {
    var e = document.createEvent('MouseEvents');
    e.initMouseEvent(event.type, true, true, window, 0, 0, 0, 0, 0, false, false, event.isShift, false, 0, null);
    return el.dispatchEvent(e);
  }
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
