L.Utils = {
  initTranslation() {
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
      restoreImage: 'Restore Natural Image',
      rotateImage: 'Rotate Image',
      scaleImage: 'Scale Image',
      stackToFront: 'Stack to Front',
      stackToBack: 'Stack to Back',
      unlockImages: 'Unlock Images',
      confirmImageDelete:
        'Are you sure? This image will be permanently deleted from the map.',
      confirmImagesDeletes:
        'Are you sure? These images will be permanently deleted from the map.',
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

  getNestedVal(obj, key, nestedKey) {
    var dig = [key, nestedKey];
    return dig.reduce(function(obj, k) {
      return obj && obj[k];
    }, obj);
  },
};
