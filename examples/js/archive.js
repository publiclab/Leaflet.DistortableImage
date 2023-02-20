import {Paginator} from './modules/paginator.js';

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

    imageContainer.appendChild(imageRow);
    imageContainer.setAttribute('class', 'row');
  });
};

const  findSavedMapsJson = (response) => {
  // filter for JSON files from mapknitter
  const jsonFiles = response.data.files.filter(e => e.format === 'JSON' && e.name.startsWith('mapknitter'))
  if (jsonFiles.length > 0) {
    const answer = confirm('Saved map state detected! Do you want to load it?')
    // construct JSON url for the first mapknitter JSON file if user confirms
    if (answer) {
      const jsonUrl = `https://archive.org/download/${response.data.metadata.identifier}/${jsonFiles[0].name}`
      reconstructMapFromJson(jsonUrl)
    }
  }
};

function showImages(getUrl) {
  const url = getUrl.replace('details', 'metadata');

  axios.get(url)
    .then((response) => {
         findSavedMapsJson(response)
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

beginBtn.addEventListener('click', (event) => {
    bootstrap.Modal.getInstance(welcomeModal).hide();
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

// aggregate coordinates of all images into an array
function getCornerBounds(imgCollection) {
  let cornerBounds = []; 

  // aggregate coordinates for multiple images int cornerBounds
  if (imgCollection.length > 1) { 
    imgCollection.forEach((imageObj) => {
      for(let i = 0; i < imageObj.nodes.length; i++) {
        let corner = [];
        corner[0] = imageObj.nodes[i].lat;
        corner[1] = imageObj.nodes[i].lon;
        cornerBounds.push(corner); // then we have array of arrays e.g., [ [..], [..], [..], [], [], [], [], [] ] for two images etc...
      }  
    });
  } else { // aggregate coordinates for a single image into cornerBounds
    let corner = [];
    for(let i = 0; i < imgCollection[0].nodes.length; i++) {
      let corner = [];
      corner[0] = imgCollection[0].nodes[i].lat;
      corner[1] = imgCollection[0].nodes[i].lon;
      cornerBounds.push(corner); // then we have [ [lat, long], [..], [..], [..] ] for just one image...
    }  
  }
  return cornerBounds;
}

function placeImage (imageURL, options, newImage = false) {
  let image;
  
  if (newImage) { // Construct new map
    image = L.distortableImageOverlay(
      imageURL,
      {tooltipText: options.tooltipText}
    );
  } else { // Reconstruct map to previous saved state
    image = L.distortableImageOverlay(
      imageURL,
      {
        tooltipText: options.tooltipText,
        corners: options.corners, 
      }
    );
  }
  map.imgGroup.addLayer(image);
};

// Reconstruct Map from JSON URL
const reconstructMapFromJson = async (jsonDownloadURL = false, savedMapObj) => {
  if (jsonDownloadURL) {
    const imageCollectionObj = await map.imgGroup.recreateImagesFromJsonUrl(jsonDownloadURL);
    console.log(imageCollectionObj)
    const imgObjCollection = imageCollectionObj.imgCollectionProps;
    const avg_cm_per_pixel = imageCollectionObj.avg_cm_per_pixel; // this is made available here for future use
        
    // creates multiple images - this applies where multiple images are to be reconstructed
    if (imgObjCollection.length > 1) {
      let imageURL;
      let options;

      const cornerBounds = getCornerBounds(imgObjCollection);
      map.fitBounds(cornerBounds);
      
      imgObjCollection.forEach((imageObj) => {
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
    const imageObj = imgObjCollection[0];
    const imageURL = imageObj[0].src;
    const options = {
      tooltipText: imageObj[0].tooltipText,
      corners: imageObj[0].nodes,
    }

    const cornerBounds = getCornerBounds(imgObjCollection[0]);
    console.log('cornerBounds: ', cornerBounds);
    map.fitBounds(cornerBounds);
    placeImage(imageURL, options, false);
  } else {
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
    }

    const cornerBounds = getCornerBounds(savedMapObj);
    console.log('cornerBounds: ', cornerBounds);
    map.fitBounds(cornerBounds);
    placeImage(imageURL, options, false);
  }
};
document.addEventListener('DOMContentLoaded', async (event) => {
  if (mapReconstructionMode) {
    // expected url format http://localhost:8081/examples/archive.html?json=https://archive.org/download/mkl-1/mkl-1.json
    const url = location.href;
    
    if (isJsonDetected(url)) {
      const jsonDownloadURL = extractJsonFromUrlParams(url);
      reconstructMapFromJson(jsonDownloadURL)  
    }
  }
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('place-button')) {
    const imageURL = event.target.previousElementSibling.dataset.original;
    const imageTooltipText = getImageName(imageURL);
    const options = {tooltipText: imageTooltipText};

    placeImage(imageURL, options, true);
    return;
  }
});

// download JSON
downloadJSON.addEventListener('click', () => {
  const jsonImages = map.imgGroup.generateExportJson(true);
  const date = new Date()
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

      const encodedFile = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(modifiedJsonImages));
      const a = document.createElement('a');
      a.href = 'data:' + encodedFile;
      // date.getTime().toString() <---- use timestamp for a unique id
      a.download = `mapknitter-${date.getTime().toString()}.json`
      a.click();
    }
});

// save JSON to localStorage
saveMapBtn.addEventListener('click', () => {
  const jsonImages = map.imgGroup.generateExportJson(true);
  const d = new Date();
  const datetime = d.getHours() + ":" + d.getMinutes() + ' ' + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

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
    let savedMaps = []
    const newMap = {
      map: modifiedJsonImages,
      timeSaved: datetime,
      amountOfImages: modifiedJsonImages.collection.length
    };

    // this is to check if are old maps saved, if true, update with new maps to be saved 
    if (JSON.parse(localStorage.getItem('savedMaps'))) {
      const oldMaps = JSON.parse(localStorage.getItem('savedMaps'));
      savedMaps = [...oldMaps, newMap]
      localStorage.setItem('savedMaps', JSON.stringify(savedMaps));
    } else {
      savedMaps = [newMap]
      localStorage.setItem('savedMaps', JSON.stringify(savedMaps));
    }
    console.log('savedMap', savedMaps)
    bootstrap.Modal.getInstance(savedMapsModal).hide();
    alert("Saved!")
   
  }
});

// share map modal
const shareModal = document.getElementById('shareModal')
const modality =  new bootstrap.Modal(shareModal)
shareMapBtn.addEventListener('click', () => {
  bootstrap.Modal.getInstance(shareModal).show()
});

// history map modal
const savedMapsModal = document.getElementById('savedMapsModal')
const savedMapsModalIntialization = new bootstrap.Modal(savedMapsModal)
let mapsToRecover 
saveMapModalBtn.addEventListener('click', () => {
  const savedMaps = JSON.parse(localStorage.getItem('savedMaps'));
  bootstrap.Modal.getInstance(savedMapsModal).show();
 
  if (savedMaps.length > 0) {
    mapsToRecover = savedMaps;
    savedMaps.forEach(((savedMap, index) => {
      const { map, amountOfImages, timeSaved } = savedMap
      const eachMap = document.createElement('div');
      const eachMapTextDiv = document.createElement('div');
      const eachMapAmountText = document.createElement('h6')
      const eachMapDate = document.createElement('p')
      const recoverBtn = document.createElement('a');
      const recoverBtnDiv = document.createElement('div')

      eachMap.classList.add('d-flex', 'justify-content-between', 'align-content-center')
      eachMapTextDiv.classList.add('d-flex', 'flex-column')
      eachMapAmountText.innerHTML = `${amountOfImages} image(s)`
      eachMapDate.innerHTML = `<b>Saved:</b> ${timeSaved}`
      eachMapTextDiv.append(eachMapAmountText, eachMapDate)

      recoverBtn.classList.add('btn', 'btn-primary', 'btn-md', 'rounded-pill', 'recover')
      recoverBtn.innerHTML = "Recover"
      recoverBtnDiv.appendChild(recoverBtn)
      recoverBtn.setAttribute('data-map-index',`${index}`)
      recoverBtn.setAttribute('title', 'Recover map')

      eachMap.append(eachMapTextDiv, recoverBtnDiv)  
    
      mapList.append(eachMap) 
    }))
  } else {
    mapList.innerHTML += "<h5> No Saved Maps </h5>"
  }
});

// this runs when the recover button is clicked in the saved maps modal
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('recover')) {
    const mapToRecoverIdx = event.target.dataset.mapIndex
    const mapCollection = mapsToRecover[mapToRecoverIdx].map.collection
    reconstructMapFromJson(false, mapCollection)
    bootstrap.Modal.getInstance(savedMapsModal).hide();
    bootstrap.Offcanvas.getInstance(sidebar).hide();
  }
})

// Reconstruct map from JSON file or place images on tile layer
function handleDrop (e) {
  const files = e.dataTransfer.files;
  const reader = new FileReader();
  
  // confirm file being dragged has json format
  if (files.length === 1 && files[0].type === 'application/json') { 
    reader.addEventListener('load', () => {
      let imgUrl;
      let options;
      const imgObj = JSON.parse(reader.result);

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
        corners: imgObj.collection[0].nodes, 
      };
      const cornerBounds = getCornerBounds(imgObj.collection); 
      map.fitBounds(cornerBounds);
      placeImage(imgUrl, options);
    }); 

    reader.readAsText(files[0]);
  } else {
    // non-json (i.e., .png) files make it to this point
    for (let i = 0; i < files.length; i++) {
      reader.addEventListener('load', () => {
        const options = {tooltipText: extractFileName(files[i].name)};
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