import { Paginator } from './modules/paginator.js';

let map;
const welcomeModal = document.getElementById('welcomeModal');
const tileMap = document.getElementById('map');
const beginBtn = document.getElementById('beginBtn');
const restoreWelcomeModal = document.getElementById('restoreWelcomeModalBtn');
const sidebar = document.getElementById('offcanvasRight');
const form = document.getElementById('form');
const input = document.getElementById('input');
const responseText = document.getElementById('response');
const imageContainer = document.getElementById('imgContainer');
const mapToggle = document.getElementById('mapToggle');
let imageCount = 0;
let fetchedFrom;
let fetchedImages;
let currPagination; // currPagination is used to initiate the Paginator Class
let sidebarOpen = false;
let mapReconstructionMode = false; // map is reconstructed from json URL in this mode

const setupMap = () => {
  map = L.map('map').setView([51.505, -0.09], 13);
  window.map = map; // make map global for debugging

  map.attributionControl.setPosition('bottomleft');
  
  map.addGoogleMutant();
  map.whenReady(() => {
    const url = location.href;

    if (isWorkingUrlFormat(url)) { 
      new bootstrap.Modal(welcomeModal).hide();
      mapReconstructionMode = true;
      return;
    } else {
      console.log('Unrecognised query parameter or no query parameter'); // debug purposes only
    }
    new bootstrap.Modal(welcomeModal).show();
  });
};

const setupCollection = () => {
  map.imgGroup = L.distortableCollection().addTo(map);
};

setupMap();
L.Control.geocoder().addTo(map);
setupCollection();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  extractKey();
});

function extractKey() {
  let getUrl;
  if (
    !input.value.includes('archive.org/details/') &&
    !input.value.includes('https://')
  ) {
    getUrl = `https://archive.org/details/${input.value}/`;
    showImages(getUrl);
  } else if (
    !input.value.includes('https://') &&
    !input.value.includes('http://') &&
    input.value.includes('archive.org/details/')
  ) {
    getUrl = `https://${input.value}`;
    showImages(getUrl);
  } else if (input.value.includes('http://')) {
    getUrl = input.value.replace('http:', 'https:');
    input.value = getUrl;
    showImages(getUrl);
  } else {
    getUrl = input.value;
    showImages(getUrl);
  }
}

const renderImages = (fullResImages, url) => {
  fullResImages.forEach((file) => {
    const imageRow = document.createElement('div');
    const image = new Image(150, 150);
    const placeButton = document.createElement('a');
    // link back to the images' source URL
    fetchedFrom = document.createElement('p');
    const fetchedFromUrl = document.createElement('a');
    fetchedFromUrl.setAttribute('href', input.value);
    fetchedFromUrl.setAttribute('target', '_blank');
    fetchedFromUrl.innerHTML = 'this Internet Archive Collection';
    fetchedFrom.appendChild(fetchedFromUrl);

    placeButton.classList.add(
      'btn',
      'btn-sm',
      'btn-outline-secondary',
      'place-button'
    );
    placeButton.innerHTML = 'Place on map';
    // store the full-resolution image URL in a "data-original" attribute
    image.setAttribute(
      'data-original',
      `${url.replace('metadata', 'download')}/${file.name}`
    );
    image.src = `${url.replace('metadata', 'download')}/${file.name}`;
    imageRow.classList.add(
      'd-flex',
      'justify-content-between',
      'align-items-center',
      'mb-4',
      'pe-5'
    );
    imageRow.append(image, placeButton);
    imageContainer.appendChild(imageRow);
    imageCount++;
  });
};

// renders thumbnails or images in thumbnail size
const renderThumbnails = (thumbnails = [], url, fullResImgs) => {
  const imagesToRender = thumbnails || fullResImgs;
  const currentImages = currPagination.imagesForPage(imagesToRender);
  imageCount = imagesToRender.length;

  currentImages.forEach((file) => {
    const imageRow = document.createElement('div');
    const image = new Image(65, 65);
    const placeButton = document.createElement('a');
    // link back to the images' source URL
    fetchedFrom = document.createElement('p');
    const fetchedFromUrl = document.createElement('a');
    fetchedFromUrl.setAttribute('href', input.value);
    fetchedFromUrl.setAttribute('target', '_blank');
    fetchedFromUrl.innerHTML = 'this Internet Archive Collection';
    fetchedFrom.appendChild(fetchedFromUrl);
    const fileName = document.createElement('p');
    fileName.innerHTML = file.name;
    fileName.classList.add('m-0');
    fileName.style.fontSize = '12px';

    placeButton.classList.add(
      'btn',
      'btn-sm',
      'btn-outline-secondary',
      'place-button',
      'mt-1'
    );
    placeButton.innerHTML = 'Place';
    placeButton.setAttribute('title', 'Place image on map');

    // store the full-resolution image URL in a "data-original" attribute
    image.setAttribute(
      'data-original',
      `${url.replace('metadata', 'download')}/${
        thumbnails ? file.original : file.name
      }`
    );
    image.src = `${url.replace('metadata', 'download')}/${file.name}`;
    imageRow.classList.add(
      'col-4',
      'd-flex',
      'flex-column',
      'p-2',
      'align-items-center'
    );
    imageRow.append(image, placeButton, fileName);

    imageContainer.appendChild(imageRow);
    imageContainer.setAttribute('class', 'row');
  });
};

// finds json file and return its url (if available)
const findSavedMapsJson = (response) => {
  // filter for JSON files from mapknitter
  const jsonFiles = response.data.files.filter(
    (e) => e.format === 'JSON' && e.name.startsWith('mapknitter')
  );
  if (jsonFiles.length > 0) {
    const answer = confirm('Saved map state detected! Do you want to load it?');

    if (answer) {
      return `https://archive.org/download/${response.data.metadata.identifier}/${jsonFiles[0].name}`;
    }
  }
};

async function performFetch(url) {
  return await axios.get(url);
}

async function showImages(getUrl) {
  const url = getUrl.replace('details', 'metadata');

  try {
    const response = await performFetch(url);
    const savedMapsJsonUrl = findSavedMapsJson(response);
    if (savedMapsJsonUrl) {
      reconstructMapFromJson(savedMapsJsonUrl);
    }

    if (response.data.files && response.data.files.length != 0) {
      fetchedImages = response.data.files; // <---- all files fetched
      // runs a check to clear the sidebar, eventListeners and reset imageCount
      if (currPagination) currPagination.clear();
      imageContainer.textContent = '';
      imageCount = 0;
      currPagination = new Paginator(url, fetchedImages);
      currPagination.processImgs(renderThumbnails, renderImages);
      responseText.innerHTML = imageCount
        ? `${imageCount} image(s) fetched successfully from ${fetchedFrom.innerHTML}.`
        : 'No images found in the link provided...';
    } else {
      responseText.innerHTML = 'No images found in the link provided...';
    }
  } catch (error) {
    console.log(error);
    responseText.innerHTML =
      "Uh-oh! Something's not right with the link provided!";
  } finally {
    bootstrap.Modal.getInstance(welcomeModal).hide();
  }
}

beginBtn.addEventListener('click', (event) => {
  bootstrap.Modal.getInstance(welcomeModal).hide();
  new bootstrap.Offcanvas(sidebar).show();
  sidebarOpen = true;
});

restoreWelcomeModal.addEventListener('click', (event) => {
  bootstrap.Modal.getInstance(welcomeModal).show();
  input.value = '';
});

mapToggle.addEventListener('click', (event) => {
  new bootstrap.Offcanvas(sidebar).show();
  sidebarOpen = true;
});

tileMap.addEventListener('click', (event) => {
  if (sidebarOpen) {
    bootstrap.Offcanvas.getInstance(sidebar).hide();
  }
});

function getImageName(imageURL) {
  const startIndex = imageURL.lastIndexOf('/') + 1;
  const endIndex = imageURL.lastIndexOf('.');
  const imageName = imageURL.substring(startIndex, endIndex);

  return imageName;
}

function extractFileName(name) {
  const startIndex = name.lastIndexOf('.');
  const fileName = name.substring(0, startIndex);

  return fileName;
}

function extractJsonFromUrlParams(url) {
  const startIndex = url.lastIndexOf('=');
  const jsonDownloadURL = url.slice(startIndex + 1);

  return jsonDownloadURL;
}

// places image on tile
function placeImage(imageURL, options, newImage = false) {
  let image;

  if (newImage) {
    // construct new map
    image = L.distortableImageOverlay(imageURL, {
      tooltipText: options.tooltipText,
    });
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
    });
  }

  map.imgGroup.addLayer(image);
}

// Reconstruct Map from JSON URL (image objects without coordinates are ignored)
const reconstructMapFromJson = async (jsonDownloadURL = false, savedMapObj) => {
  if (jsonDownloadURL) {
    const imageCollectionObj = await map.imgGroup.recreateImagesFromJsonUrl(jsonDownloadURL);
    let imgObjCollection = imageCollectionObj.imgCollectionProps;
    // const avg_cm_per_pixel = imageCollectionObj.avg_cm_per_pixel; // this is made available here for future use. can't be used with legacy json files from mapknitter.org

    // for json file with single image object
    if (Array.isArray(imgObjCollection[0])) {
      imgObjCollection = updateLegacyJson(imgObjCollection[0]).collection;
    } else { // for json file with multiple image objects
      imgObjCollection = updateLegacyJson(imgObjCollection).collection;
    }

    // creates multiple images - this applies where multiple images are to be reconstructed
    if (imgObjCollection.length > 1) {
      let imageURL;
      let options;

      const cornerBounds = getCornerBounds(imgObjCollection);
      map.fitBounds(cornerBounds);

      imgObjCollection.forEach((imageObj) => {
        imageURL = extractImageSource(imageObj.src);
        if (imageObj.nodes.length > 0) {
          options = {
            tooltipText: imageObj.tooltipText,
            corners: imageObj.nodes,
          };
          placeImage(imageURL, options, false);
        }
      });

      return;
    }

    // creates single image - this applies where only one image is to be reconstructed
    const cornerBounds = getCornerBounds(imgObjCollection);
    map.fitBounds(cornerBounds);

    const imageObj = imgObjCollection[0][0];
    const imageURL = extractImageSource(imageObj.src);

    if (imageObj.nodes.length) {
      const options = {
        tooltipText: imageObj.tooltipText,
        corners: imageObj.nodes,
      };
      placeImage(imageURL, options, false);
    }

    return;
  }

  // creates multiple images - this applies where multiple images are to be reconstructed
  if (savedMapObj.length > 1) {
    let imageURL;
    let options;

    const cornerBounds = getCornerBounds(savedMapObj);
    map.fitBounds(cornerBounds);

    savedMapObj.forEach((imageObj) => {
      imageURL = imageObj.src;
      options = {
        tooltipText: imageObj.tooltipText,
        corners: imageObj.nodes,
      };
      placeImage(imageURL, options, false);
    });

    return;
  }

  // creates single image - this applies where only one image is to be reconstructed
  const imageObj = savedMapObj[0];
  const imageURL = imageObj.src;
  const options = {
    tooltipText: imageObj.tooltipText,
    corners: imageObj.nodes,
  };

  const cornerBounds = getCornerBounds(savedMapObj);
  map.fitBounds(cornerBounds);
  placeImage(imageURL, options, false);
};

// transforms url from format: https://localhost:8080/examples/archive.html?k=texas-barnraising-copy to: https://archive.org/details/texas-barnraising-copy
// OR from https://localhost:8080/examples/archive.html?kl=--10 to https://archive.org/download/mapknitter/--10.json
function convertToFetchUrl(url, legacyJson = false) {
  let fetchUrl;
  const queryParam = url.substring(url.lastIndexOf('=') + 1);

  if (!legacyJson) {
    fetchUrl = `https://archive.org/details/${queryParam}`;
  } else {
    fetchUrl = `https://archive.org/download/mapknitter/${queryParam}.json`; 
  }

  return fetchUrl;
}

function isJsonDetected(url) {
  if (url.includes('?json=')) {
    const startIndex = url.lastIndexOf('.');
    const fileExtension = url.slice(startIndex + 1);

    if (fileExtension === 'json') {
      console.log('JSON found in map shareable link'); // for debugging purposes only
      return true;
    }
  }

  return false;
}

function isWorkingUrlFormat(url) {
  if (url.includes('?k=')) {
    return {isWorkingFormat: true, legacyJson: false};
  }
  
  if (url.includes('?kl=')) {
    return {isWorkingFormat: true, legacyJson: true};
  }

  if (isJsonDetected(url)) {
    return {isWorkingFormat: true, isJsonKey: true};
  }
}

document.addEventListener('DOMContentLoaded', async (event) => {
  if (mapReconstructionMode) {
    const url = location.href;

    // supported working url formats: 
    // type 1 - http://localhost:8081/examples/archive.html?k=texas-barnraising-copy (for MK-Lite generated json files)
    // type 2 - http://localhost:8081/examples/archive.html?kl=--10 (legacy format - for json files from legacy mapknitter.org)
    // type 3 - http://localhost:8081/examples/archive.html?json=https://archive.org/download/mkl-2-2/mkl-2-2.json (for MK-Lite generated json files)
    // type 4 - http://localhost:8081/examples/archive.html?json=https://archive.org/download/mapknitter/--10.json (for json files from legacy mapknitter.org)
    const assessedUrl = isWorkingUrlFormat(url);

    if (assessedUrl.isWorkingFormat) {
      let jsonDownloadURL;

      if (assessedUrl.isJsonKey) {
        jsonDownloadURL = extractJsonFromUrlParams(url); // for type 3 & 4
        reconstructMapFromJson(jsonDownloadURL);
      } else if (!assessedUrl.legacyJson) { // checks if url points to MK-Lite generated json file(s), type 1
        const fetchUrl = convertToFetchUrl(url).replace('details', 'metadata');
        const response = await performFetch(fetchUrl);
  
        if (response) {
          jsonDownloadURL = findSavedMapsJson(response);
          reconstructMapFromJson(jsonDownloadURL);
        }
      } else { // for type 2
        jsonDownloadURL = convertToFetchUrl(url, assessedUrl.legacyJson); // jsonDownloadURL => https://archive.org/download/mapknitter/--10.json 
        reconstructMapFromJson(jsonDownloadURL);
      }
    } 
  }
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('place-button')) {
    const imageURL = event.target.previousElementSibling.dataset.original;
    const imageTooltipText = getImageName(imageURL);
    const options = { tooltipText: imageTooltipText };

    placeImage(imageURL, options, true);
    return;
  }
});

// download JSON
downloadJSON.addEventListener('click', () => {
  const jsonImages = map.imgGroup.generateExportJson(true);
  const date = new Date();
  // a check to prevent download of empty file
  if (jsonImages.images.length) {
    const modifiedJsonImages = {};
    const tempCollection = [];

    // restructure jsonImages
    modifiedJsonImages.avg_cm_per_pixel = jsonImages.avg_cm_per_pixel;
    jsonImages.images.map((image) => {
      tempCollection.push({
        id: image.id,
        src: image.src,
        tooltipText: image.tooltipText,
        image_file_name: image.image_file_name,
        nodes: image.nodes,
        cm_per_pixel: image.cm_per_pixel,
      });
    });
    modifiedJsonImages.collection = tempCollection;

    const encodedFile =
      'text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(modifiedJsonImages));
    const a = document.createElement('a');
    a.href = 'data:' + encodedFile;
    // date.getTime().toString() <---- use timestamp for a unique id
    a.download = `mapknitter-${date.getTime().toString()}.json`;
    a.click();
  }
});

// save JSON to localStorage
saveMapBtn.addEventListener('click', () => {
  const jsonImages = map.imgGroup.generateExportJson(true);
  const d = new Date();
  const datetime =
    d.getHours() +
    ':' +
    d.getMinutes() +
    ' ' +
    d.getDate() +
    '/' +
    (d.getMonth() + 1) +
    '/' +
    d.getFullYear();

  if (jsonImages.images.length) {
    const modifiedJsonImages = {};
    const tempCollection = [];

    // restructure jsonImages
    modifiedJsonImages.avg_cm_per_pixel = jsonImages.avg_cm_per_pixel;
    jsonImages.images.map((image) => {
      tempCollection.push({
        id: image.id,
        src: image.src,
        tooltipText: image.tooltipText,
        image_file_name: image.image_file_name,
        nodes: image.nodes,
        cm_per_pixel: image.cm_per_pixel,
      });
    });
    modifiedJsonImages.collection = tempCollection;
    let savedMaps = [];
    const newMap = {
      map: modifiedJsonImages,
      timeSaved: datetime,
      amountOfImages: modifiedJsonImages.collection.length,
    };

    // this is to check if are old maps saved, if true, update with new maps to be saved
    if (JSON.parse(localStorage.getItem('savedMaps'))) {
      const oldMaps = JSON.parse(localStorage.getItem('savedMaps'));
      savedMaps = [...oldMaps, newMap];
      localStorage.setItem('savedMaps', JSON.stringify(savedMaps));
    } else {
      savedMaps = [newMap];
      localStorage.setItem('savedMaps', JSON.stringify(savedMaps));
    }
    bootstrap.Modal.getInstance(savedMapsModal).hide();
    alert('Saved!');
  }
});

// share map modal
const shareModal = document.getElementById('shareModal');
const modality = new bootstrap.Modal(shareModal);
shareMapBtn.addEventListener('click', () => {
  bootstrap.Modal.getInstance(shareModal).show();
});

// this runs when the recover button is clicked in the saved maps modal
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('recover')) {
    const mapToRecoverIdx = event.target.dataset.mapIndex;
    const mapCollection = mapsToRecover[mapToRecoverIdx].map.collection;
    reconstructMapFromJson(false, mapCollection);
    bootstrap.Modal.getInstance(savedMapsModal).hide();
    bootstrap.Offcanvas.getInstance(sidebar).hide();
  }
});

// aggregate coordinates of all images into an array
function getCornerBounds(imgCollection) {
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

// converts legacy json objects (from mapknitter.org) to working format
function updateLegacyJson(json) {
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

// where imageSrc is in format: https://web.archive.org/web/20220803171120/https://s3.amazonaws.com/grassrootsmapping/warpables/48659/t82n_r09w_01-02_1985.jpg
// returns https://s3.amazonaws.com/grassrootsmapping/warpables/48659/t82n_r09w_01-02_1985.jpg or
// returns same url unchanged (no transformation required)
function extractImageSource(imageSrc) {
  if (imageSrc.startsWith('https://web.archive.org/web/')) {
    return imageSrc.substring(imageSrc.lastIndexOf('https'), imageSrc.length);
  }
  return imageSrc;
}

// Reconstruct map from JSON file or place images on tile layer
function handleDrop(e) {
  let options;
  const files = e.dataTransfer.files;
  const reader = new FileReader();

  // confirm file being dragged has json format
  if (files.length === 1 && files[0].type === 'application/json') {
    reader.addEventListener('load', () => {
      let imgUrl;
      let imgObj = JSON.parse(reader.result);

      // for json file with single image object
      if (Array.isArray(imgObj.collection)) { // check if it's array of array in which case it it's a single image object
        imgObj = updateLegacyJson(imgObj.collection);
      } else if (Array.isArray(imgObj)) { // for json file with multiple image objects
        imgObj = updateLegacyJson(imgObj);
      } else {
        console.log('Image file being dragged and dropped'); // for debugging purposes only
      }

      // for json file with multiple image property sets. Images without value for property "nodes" are ignored
      if (imgObj.collection.length > 1) {
        const cornerBounds = getCornerBounds(imgObj.collection);
        if (cornerBounds.length) {
          // checks if image has corners
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
          console.log(
            "None of the image objects has nodes and can't be loaded"
          ); // for debugging purposes only
        }
        return;
      }

      // for json file with only one image property set. Image object without corners are ignored
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

function uploadFiles() {
  const dropZone = document.getElementById('dropZone');
  const active = () => dropZone.classList.add('overlay');
  const inactive = () => dropZone.classList.remove('overlay');
  const prevents = (e) => e.preventDefault();

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
}

document.addEventListener('DOMContentLoaded', uploadFiles);
