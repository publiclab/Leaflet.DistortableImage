import {Paginator} from './modules/paginator.js';

let map;
const welcomeModal = document.getElementById('welcomeModal');
const tileMap = document.getElementById('map');
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
let mapReconstructionMode = false;

const setupMap = () => {
  map = L.map('map').setView([51.505, -0.09], 13);

  map.attributionControl.setPosition('bottomleft');

  map.addGoogleMutant();
  map.whenReady(() => {
    if (isJsonDetected(location.href)) {
      new bootstrap.Modal(welcomeModal).hide(); 
      mapReconstructionMode = true;
      return;
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
  if (!input.value.includes('archive.org/details/') && !input.value.includes('https://'))
  {
    getUrl = `https://archive.org/details/${input.value}/`;
    showImages(getUrl);
  }
  else if (!input.value.includes('https://') && !input.value.includes('http://') && input.value.includes('archive.org/details/')) {
    getUrl = `https://${input.value}`;
    showImages(getUrl);
  }
  else if (input.value.includes('http://')) {
    getUrl = input.value.replace('http:', 'https:');
    input.value = getUrl;
    showImages(getUrl);
  }
  else
  {
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

    placeButton.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'place-button');
    placeButton.innerHTML = 'Place on map';
    // store the full-resolution image URL in a "data-original" attribute
    image.setAttribute('data-original', `${url.replace('metadata', 'download')}/${file.name}`);
    image.src = `${url.replace('metadata', 'download')}/${file.name}`;
    imageRow.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-4', 'pe-5');
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

    placeButton.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'place-button', 'mt-1');
    placeButton.innerHTML = 'Place';
    placeButton.setAttribute('title', 'Place image on map');

    // store the full-resolution image URL in a "data-original" attribute
    image.setAttribute('data-original', `${url.replace('metadata', 'download')}/${thumbnails ? file.original : file.name}`);
    image.src = `${url.replace('metadata', 'download')}/${file.name}`;
    imageRow.classList.add('col-4', 'd-flex', 'flex-column', 'p-2', 'align-items-center');
    imageRow.append(image, placeButton, fileName);
    // store the full-resolution image URL in a "data-original" attribute
    image.setAttribute('data-original', `${url.replace('metadata', 'download')}/${thumbnails ? file.original : file.name}`);
    image.src = `${url.replace('metadata', 'download')}/${file.name}`;
    imageRow.classList.add('col-4', 'd-flex', 'flex-column', 'p-2', 'align-items-center');
    imageRow.append(image, placeButton, fileName);
    imageContainer.appendChild(imageRow);
    imageContainer.setAttribute('class', 'row');
  });
};
 
const loadJSONfromResponse = async (response) => {
  //filter for JSON files
  const jsonFiles = response.data.files.filter(e => e.format === 'JSON')
 
  if (jsonFiles.length > 0) {
    let jsonFileToLoad;   
    if (jsonFiles.length > 1) { // check if there are multiple json files 
      const answer = prompt(`We found ${jsonFiles.length} saved Map state in your URL, input the filename of JSON file to load?`).toLowerCase()
      jsonFileToLoad = jsonFiles.filter(jsonFile => {
        const formatedAnswer = answer.includes('.json') ? answer : (answer + '.json')
        if (jsonFile.name === formatedAnswer) {
          return (jsonFile)
        }
      })
    } else {
      jsonFileToLoad = jsonFiles;
    }

    // construct JSON url
    if (jsonFileToLoad.length != 0) {
      const jsonUrl = `https://archive.org/download/${response.data.metadata.identifier}/${jsonFileToLoad[0].name}`
      reconstructMapFromJson(jsonUrl)
    }
  }
};

function showImages(getUrl) {
  const url = getUrl.replace('details', 'metadata');

  axios.get(url)
    .then((response) => {
        loadJSONfromResponse(response)
        if (response.data.files && response.data.files.length != 0) {
          fetchedImages = response.data.files; // <---- all files fetched
          // runs a check to clear the sidebar, eventListeners and reset imageCount
          if (currPagination) currPagination.clear(); imageContainer.textContent = ''; imageCount = 0;
          currPagination = new Paginator(url, fetchedImages);
          currPagination.processImgs(renderThumbnails, renderImages);
          responseText.innerHTML = imageCount ? `${imageCount} image(s) fetched successfully from ${fetchedFrom.innerHTML}.` : 'No images found in the link provided...';
        } else {
          responseText.innerHTML = 'No images found in the link provided...';
      }
      })
      .catch((error) => {
        console.log(error);
        responseText.innerHTML = 'Uh-oh! Something\'s not right with the link provided!';
      })
      .finally(() => {
        bootstrap.Modal.getInstance(welcomeModal).hide();
      });
}

welcomeModal.addEventListener('hidden.bs.modal', (event) => {
  new bootstrap.Offcanvas(sidebar).show();
  sidebarOpen = true;
});

restoreWelcomeModal.addEventListener('click', (event) => {
  bootstrap.Modal.getInstance(welcomeModal).show();
  input.value='';
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

function extractJsonFromUrlParams(url) { 
  const startIndex = url.lastIndexOf('=');
  const jsonDownloadURL = url.slice(startIndex + 1);

  return jsonDownloadURL;
}

function isJsonDetected(url) {
  if (url.includes('?json=')) {
    const startIndex = url.lastIndexOf('.');
    const fileExtension = url.slice(startIndex + 1);

    if (fileExtension === 'json') {
      console.log('JSON found in map shareable link'); // left here purposely
      return true;
    } 
  }

  return false;
}

function placeImage (imageURL, options, newImage = false) {
  let image;
  
  if (newImage) { 
    image = L.distortableImageOverlay(
      imageURL,
      {tooltipText: options.tooltipText}
    );
  } else {
    image = L.distortableImageOverlay(
      imageURL,
      {
        height: options.height,
        tooltipText: options.tooltipText,
        // corners: options.corners, <== uncomment this to see the effect of the corners
      }
    );
  }

  map.imgGroup.addLayer(image);
};

// Reconstruct Map from JSON
const reconstructMapFromJson =  async (jsonDownloadURL) => {
   if (jsonDownloadURL) {
        const imageCollectionObj = await map.imgGroup.recreateImagesFromJsonUrl(jsonDownloadURL); 
        const avg_cm_per_pixel = imageCollectionObj.avg_cm_per_pixel; // this is made available here for future use
        
        // creates multiple images - this applies where multiple images are to be reconstructed
        if (imageCollectionObj.imgCollectionProps.length > 1) {
          let imageURL;
          let options;
      
          imageCollectionObj.imgCollectionProps.forEach((imageObj) => {
            imageURL = imageObj.src;
            options = {
              height: imageObj.height,
              tooltipText: imageObj.tooltipText,
              corners: imageObj.nodes,
            };
            placeImage(imageURL, options, false);
          });
      
          return;
        }

        // creates single image - this applies where only one image is to be reconstructed
        const imageObj = imageCollectionObj.imgCollectionProps[0];
        const imageURL = imageObj[0].src;
        const options = {
          height: imageObj[0].height,
          tooltipText: imageObj[0].tooltipText,
          corners: imageObj[0].nodes,
        }
      
        placeImage(imageURL, options, false);
      }
}
document.addEventListener('DOMContentLoaded', (event) => {
  if (mapReconstructionMode) {
    const url = location.href;
    
    if (isJsonDetected(url)) {
      const jsonDownloadURL = extractJsonFromUrlParams(url); 
     reconstructMapFromJson(jsonDownloadURL)
    } 
  }
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('place-button')) {
    const imageURL = event.target.previousElementSibling.src;
    const imageTooltipText = getImageName(imageURL);
    const options = {tooltipText: imageTooltipText};

    placeImage(imageURL, options, true);
    return;
  }
});

// download JSON
saveMap.addEventListener('click', () => {
  const jsonImages = map.imgGroup.generateExportJson(true);
    // a check to prevent download of empty file
    if (jsonImages.images.length) {
      const encodedFile = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jsonImages));
      const a = document.createElement('a');
      a.href = 'data:' + encodedFile;
      const fileName = prompt('Use this file to recover your map’s saved state. Enter a unique filename:').toLowerCase()
      a.download = fileName ? fileName + '.json' : 'mapknitter-lite.json';
      a.click();
    }
})

// share map modal
const shareModal = document.getElementById('shareModal')
const modality =  new bootstrap.Modal(shareModal)
shareMapBtn.addEventListener('click', () => {
  bootstrap.Modal.getInstance(shareModal).show()
})