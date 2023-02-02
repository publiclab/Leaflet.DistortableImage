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

// this function is a candidate from modularization. It's used in many other .js files
const placeImage = (imageUrl, options = {}) => {
  map.whenReady(function() {
    // constructs new map 
    const noOptions = Object.keys(options).length === 0 && options.constructor === Object
    if (noOptions) {
      img = L.distortableImageOverlay(imageUrl, {
        selected: true,
        fullResolutionSrc: 'large.jpg',
      }).addTo(map);
    } else {
      // reconstructs map into previous state
      image = L.distortableImageOverlay(imageUrl, {
        height: options.height,
        tooltipText: options.tooltipText,
        // corners: options.corners, <== uncomment this to see the effect of the corners
      }).addTo(map);
    }
  });
};

const handleDrop = (e) => {
  alert('You\'re editing a map with local images. You\'ll need to save images at archive.org if you\'d like to save your work online, or to export the map.');

  const form = new FormData();
  form.append('scale', prompt('Choose a scale to download image or use the default (cm per pixel):', 100) || mergedOpts.scale);

  const files = e.dataTransfer.files;
  const reader = new FileReader();
  
  // confirm file being dragged has json format
  if (files.length === 1 && files[0].type === 'application/json') { 
    reader.addEventListener('load', () => {
      imgObj = JSON.parse(reader.result);
      // for json file with multiple image property sets
      if (imgObj.images.length > 1) {
        imgObj.images.forEach((imgObj) => {
          imgUrl = imgObj.src;
          options = {
            height: imgObj.height,
            tooltipText: imgObj.tooltipText,
            // corners: imgObj.nodes, // uncomment to view the effect of corners
          };
          placeImage(imgUrl, options);
        });
        return;
      }
      // for json file with only one image property set
      imgUrl = imgObj.images[0].src;
      options = {
        height: imgObj.images[0].height,
        tooltipText: imgObj.images[0].tooltipText,
        // corners: imgObj.nodes, // uncomment to view the effect of corners
      };
      placeImage(imgUrl, options);
    }); 
    reader.readAsText(files[0]);
  } else {
    // non-json (i.e., images) files make it to this point
    // eslint-disable-next-line no-unused-vars
    for (let i = 0, f; (f = files[i]); i++) {
      reader.addEventListener('load', () => {
        placeImage(reader.result);
      });
      reader.readAsDataURL(files[i]); 
      // Read the File objects in this FileList.
    }
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
