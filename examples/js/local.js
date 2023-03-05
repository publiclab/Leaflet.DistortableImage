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

// aggregate coordinates of all images into an array
const getCornerBounds = (imgCollection) => {
  let cornerBounds = [];

  // aggregate coordinates for multiple images into cornerBounds
  if (imgCollection.length > 1) {
    imgCollection.forEach((imageObj) => {
      if (imageObj.nodes) {
        for (let i = 0; i < imageObj.nodes.length; i++) {
          let corner = [];
          corner[0] = imageObj.nodes[i].lat;
          corner[1] = imageObj.nodes[i].lon;
          cornerBounds.push(corner); // then we have array of arrays e.g., [ [lat, lon], [..], [..], [], [], [], [], [] ] for two images etc...
        }
      }
    });
  } else {
    // aggregate coordinates for a single image into cornerBounds
    const nodeCollection = imgCollection[0];

    if (nodeCollection.length) {
      for (let i = 0; i < nodeCollection[0].nodes.length; i++) {
        let corner = [];
        corner[0] = nodeCollection[0].nodes[i].lat;
        corner[1] = nodeCollection[0].nodes[i].lon;
        cornerBounds.push(corner); // then we have [ [lat, long], [..], [..], [..] ] for just one image
      }
    }
  }

  return cornerBounds;
}

// places image on tile
function placeImage(imageURL, options, newImage = false) {
  map.whenReady(function() {
    let image;

    if (newImage) {
      // construct new map
      image = L.distortableImageOverlay(imageURL, {
        selected: true,
        tooltipText: options.tooltipText,
        fullResolutionSrc: 'large.jpg',
      }).addTo(map);
    } else {
      // reconstruct map to previous saved state
      const zc = options.corners;
      const reOrderedCorners = [
        // coordinates passed in correct order NW, NE, SW, SE (i.e., 'Z' pattern)
        { lat: zc[0].lat, lon: zc[0].lon || zc[0].lng },
        { lat: zc[1].lat, lon: zc[1].lon || zc[1].lng },
        { lat: zc[3].lat, lon: zc[3].lon || zc[3].lng },
        { lat: zc[2].lat, lon: zc[2].lon || zc[2].lng },
      ];

      image = L.distortableImageOverlay(imageURL, {
        tooltipText: options.tooltipText,
        corners: reOrderedCorners,
      }).addTo(map);
    }
  });
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

// converts legacy json objects (from mapknitter.org) to working format
const updateLegacyJson = (json) => {
  let transformedImgObj = {};
  transformedImgObj.collection = [];

  // creates multiple images - applies to json file with multiple image objects
  if (json.length > 1) {
    json.map((json) => {
      if (json.nodes.length) {
        let tempNodes = [];
        for (let i = 0; i < json.nodes.length; i++) {
          tempNodes.push({ lat: json.nodes[i].lat, lon: json.nodes[i].lon });
        }
        json.nodes = tempNodes; // overwrites existing "nodes" key which points to a richer array. Read "imgObj.nodes" before this assignment to grab the richer array
      }
      json.tooltipText =
        json.tooltipText ||
        json.image_file_name.slice(0, json.image_file_name.lastIndexOf('.'));
      transformedImgObj.collection.push(json);
    });
  } else {
    // creates single image - applies to json file with only one image object
    if (json[0].nodes.length) {
      let tempNodes = [];
      for (let i = 0; i < json[0].nodes.length; i++) {
        tempNodes.push({
          lat: json[0].nodes[i].lat,
          lon: json[0].nodes[i].lon,
        });
      }

      json[0].nodes = tempNodes;
    }
    json[0].tooltipText =
      json[0].tooltipText ||
      json[0].image_file_name.slice(
        0,
        json[0].image_file_name.lastIndexOf('.')
      );
    transformedImgObj.collection.push(json);
  }

  return transformedImgObj;
}

extractFileName = (name) => {
  const startIndex = name.lastIndexOf('.');
  const fileName = name.substring(0, startIndex);

  return fileName;
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
      let imgUrl;
      let options;
      let imgObj = JSON.parse(reader.result);

      // for json file with single image object
      if (Array.isArray(imgObj.collection)) {  // check if it's array of array in which case it it's a single image object
        imgObj = updateLegacyJson(imgObj.collection);
      } else if (Array.isArray(imgObj)) { // for json file with multiple image objects
        imgObj = updateLegacyJson(imgObj);
      } else {
        console.log('Image file being dragged and dropped'); // for debugging purposes only
      }
      
      // for json file with multiple image property sets.
      // Images without value for property "nodes" are ignored unlike in archive.html
      if (imgObj.collection.length > 1) {
        const cornerBounds = getCornerBounds(imgObj.collection);

        if (cornerBounds.length) {
          map.fitBounds(cornerBounds);
          imgObj.collection.forEach((imgObj) => {
            imgUrl = extractImageSource(imgObj.src);
            if (imgObj.nodes.length > 0) {
              options = {
                tooltipText: imgObj.tooltipText,
                corners: imgObj.nodes, 
              };
              placeImage(imgUrl, options);
            }
          });
        } else {
          console.log("None of the image objects has nodes and can't be loaded"); // for debugging purposes only
        }
        return;
      }

      // for json file with only one image property set 
      const cornerBounds = getCornerBounds(imgObj.collection);

      if (cornerBounds.length) { // checks if the image has corners
        map.fitBounds(cornerBounds);

        const imgObjCollection = imgObj.collection[0][0];
        options = {
          tooltipText: imgObjCollection.tooltipText,
          corners: imgObjCollection.nodes, 
        };

        imgUrl = extractImageSource(imgObjCollection.src);
        placeImage(imgUrl, options);
      } else {
        console.log("Image object has no nodes and can't be loaded"); // for debugging purposes only
      }  
    }); 
    reader.readAsText(files[0]);
  } else {
    // for non-json files (e.g., png, jpeg)
    for (let i = 0; i < files.length; i++) {
      reader.addEventListener('load', () => {
        options = { tooltipText: extractFileName(files[i].name) };
        placeImage(reader.result, options, true);
      });
      reader.readAsDataURL(files[i]);
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
