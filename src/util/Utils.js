L.Utils = {
  initTranslation: function() {
    var translation = {
      deleteImage: 'Delete Image',
      deleteImages: 'Delete Images',
      distortImage: 'Distort Image',
      dragImage: 'Drag Image',
      exportImage: 'Export Image',
      exportImages: 'Export Images',
      removeBorder: 'Remove Border',
      addBorder: 'Add Border',
      freeRotateImage: 'Free rotate Image',
      geolocateImage: 'Geolocate Image',
      lockMode: 'Lock Mode',
      lockImages: 'Lock Images',
      makeImageOpaque: 'Make Image Opaque',
      makeImageTransparent: 'Make Image Transparent',
      restoreOriginalImageDimensions: 'Restore Original Image Dimension',
      rotateImage: 'Rotate Image',
      scaleImage: 'Scale Image',
      stackToFront: 'Stack to Front',
      stackToBack: 'Stack to Back',
      unlockImages: 'Unlock Images',
      confirmImageDelete:
        'Are you sure? This image will be permanently deleted from the map.',
      confirmImagesDeletes:
        'images will be permanently deleted from the map. Do you really want to do this?',
    };

    if (!this.options.translation) {
      this.options.translation = translation;
    } else {
      // If the translation for a word is not specified, fallback to English.
      for (var key in translation) {
        if (!this.options.translation.hasOwnProperty(key)) {
          this.options.translation[key] = translation[key];
        }
      }
    }

    L.DomUtil.initTranslation(this.options.translation);
  },

  mergeOptions: function(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname2 in obj2) { obj3[attrname] = obj2[attrname2]; }
    return obj3;
  },

  getNestedKey: function(obj, key, nestedKey) {
    var dig = [key, nestedKey];
    return dig.reduce(function(obj, k) {
      return obj && obj[k];
    }, obj);
  },
};
