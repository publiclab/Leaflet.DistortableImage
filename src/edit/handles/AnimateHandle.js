L.DistortableImage = L.DistortableImage || {};

L.MutationAnim = L.Class.extend({
  options: {
    duration: 2500,
    fill: 'none',
    easing: 'linear',
    iterations: Infinity,
  },

  initialize: function(element, group, options) {
    this._element = element;
    this._group = group;
    L.setOptions(this, options);
    this.config = {attributes: true};
  },

  onAdd: function(element, group, options) {
    this._element = element;
    this._group = group;
    this.config = options.config;
  },

  //   _startObservering: function(el) {
  //     this._observer.observe(el, this.config);
  //   },

//   onRemove: function(group, element, options) {
//     this._observer.disconnect();
//   },
});

L.MutationAnim.addInitHook(function() {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  var group = this._group;

  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.group = group;
      var className = mutation.target.getAttribute('class');
      if (className.indexOf('collected') !== -1) {
        if (className.indexOf('lock') === -1) {
          mutation.target._animation.play();
          mutation.target._animation.startTime = mutation.group._otherSelected() || mutation.target._animation.currentTime / 3000;
        } else {
          mutation.target._animation.currentTime = 1500;
          mutation.target._animation.pause();
        }
      } else {
        mutation.target._animation.currentTime = 0;
        mutation.target._animation.pause();
      }
    }, this);
  }, this);

  this._element._animation = this._element.animate({
    filter: ['none', 'drop-shadow(0 0 1rem #ffea00)', 'drop-shadow(0 0 2.5rem #ffea00)', 'none']}, {
    duration: 2500,
    fill: 'none',
    easing: 'linear',
    iterations: Infinity,
  });

  this._element._animation.pause();

  observer.observe(this._element, {attributes: true});
});
