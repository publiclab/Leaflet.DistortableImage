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
        tooltipText: options.tooltipText,
        corners: options.corners, 
      }).addTo(map);
    }
  });
};

// converts legacy json objects (from mapknitter.org) to working format
function updateLegacyJson(json) {
  let transformedImgObj = {};
  transformedImgObj.collection = [];

  json.map((json) => {    
    if (json.nodes.length) {
      let tempNodes = [];

      for(let i = 0; i < json.nodes.length; i++) {
        tempNodes.push({lat: json.nodes[i].lat, lon: json.nodes[i].lon});
      }
      json.nodes = tempNodes; // overwrites existing "nodes" key which points to a richer array. Read "imgObj.nodes" before this assignment to grab the richer array
    } 

    json.tooltipText = json.tooltipText || json.image_file_name.slice(0, (json.image_file_name.lastIndexOf('.')));
    transformedImgObj.collection.push(json);
  });

  return transformedImgObj;
}

function extractFileName(name) {
  const startIndex = name.lastIndexOf('.');
  const fileName = name.substring(0, startIndex);

  return fileName;
}

// aggregate coordinates of all images into an array
function getCornerBounds(imgCollection) {
  let cornerBounds = []; 

  // aggregate coordinates for multiple images into cornerBounds
  if (imgCollection.length > 1) { 
    imgCollection.forEach((imageObj) => {
      if (imageObj.nodes) {
        for(let i = 0; i < imageObj.nodes.length; i++) {
          let corner = [];
          corner[0] = imageObj.nodes[i].lat;
          corner[1] = imageObj.nodes[i].lon;
          cornerBounds.push(corner); // then we have array of arrays e.g., [ [lat, lon], [..], [..], [], [], [], [], [] ] for two images etc...
        }        
      }
    });
  } else { // aggregate coordinates for a single image into cornerBounds
    if (imgCollection[0].nodes) {
      for(let i = 0; i < imgCollection[0].nodes.length; i++) {
        let corner = [];
        corner[0] = imgCollection[0].nodes[i].lat;
        corner[1] = imgCollection[0].nodes[i].lon;
        cornerBounds.push(corner); // then we have [ [lat, long], [..], [..], [..] ] for just one image
      } 
    }
  }
  return cornerBounds;
}

// where imageSrc is in format: https://web.archive.org/web/20220803171120/https://s3.amazonaws.com/grassrootsmapping/warpables/48659/t82n_r09w_01-02_1985.jpg
// returns https://s3.amazonaws.com/grassrootsmapping/warpables/48659/t82n_r09w_01-02_1985.jpg or
// returns same url unchanged (no transformation required)
function extractImageSource(imageSrc) {
  if (imageSrc.startsWith('https://web.archive.org/web/')) {
    return imageSrc.substring(imageSrc.lastIndexOf('https'), imageSrc.length); 
  }
  return imageSrc;
}

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
      if (imgObj.collection.length > 1) {
        const cornerBounds = getCornerBounds(imgObj.collection); 
        map.fitBounds(cornerBounds); 

        imgObj.collection.forEach((imgObj) => {
          imgUrl = imgObj.src;
          options = {
            tooltipText: imgObj.tooltipText,
            corners: imgObj.nodes, 
          };
          placeImage(imgUrl, options);
        });
        return;
      }
      // for json file with only one image property set
      imgUrl = imgObj.collection[0].src;
      options = {
        tooltipText: imgObj.collection[0].tooltipText,
        corners: imgObj.nodes, 
      };
      const cornerBounds = getCornerBounds(imgObj.collection); 
      map.fitBounds(cornerBounds);
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
