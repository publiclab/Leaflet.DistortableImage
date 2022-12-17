// handle info open and close
const infoBtn = document.getElementById('infoBtn');
const infoBar = document.getElementById('main');

infoBtn.addEventListener('click', () => {
  if (infoBar.classList.contains('close')) {
    infoBar.classList.remove('close');
  } else {
    infoBar.classList.add('close');
  }
});

const uploadFiles = () => {
  const dropZone = document.getElementById('dropZone');
  const active = () => dropZone.classList.add('overlay');
  const inactive = () => dropZone.classList.remove('overlay');
  const prevents = e => e.preventDefault();

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((e) => {
    dropZone.addEventListener(e, prevents);
  });

  ['dragenter', 'dragover'].forEach((e) => {
    dropZone.addEventListener(e, active);
  });

  ['dragleave', 'drop'].forEach((e) => {
    dropZone.addEventListener(e, inactive);
  });

  dropZone.addEventListener('drop', handleDrop);
};

document.addEventListener('DOMContentLoaded', uploadFiles);

// display uploaded image
const loadMap = (image) => {
  map.whenReady(function() {
    img = L.distortableImageOverlay(image, {
      selected: true,
      fullResolutionSrc: 'large.jpg',
    }).addTo(map);
  });
};

const handleDrop = (e) => {
  alert('You\'re editing a map with local images. You\'ll need to save images at archive.org if you\'d like to save your work online, or to export the map.');

  const form = new FormData();
  form.append('scale', prompt('Choose a scale to download image or use the default (cm per pixel):', 100) || mergedOpts.scale);

  var files = e.dataTransfer.files;
  // eslint-disable-next-line no-unused-vars
  for (var i = 0, f; (f = files[i]); i++) {
    const reader = new FileReader();
    // save file to local storage
    reader.addEventListener('load', () => {
      loadMap( reader.result);
    });
    reader.readAsDataURL(files[i]);
    // Read the File objects in this FileList.
  }
};

// notify user that they will lose all changes
window.addEventListener('beforeunload', (e) => {
  e.preventDefault();
  e.returnValue = '';
});


let map;
(function() {
  map = L.map('map').setView([51.505, -0.09], 13);
  map.addGoogleMutant();
})();


L.Control.geocoder().addTo(map);
