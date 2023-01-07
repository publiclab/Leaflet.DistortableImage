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
const range = document.getElementById('range');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let currPage = 0;
let imageCount = 0;
let fetchedFrom;
let fetchedImages;
let userUrl;

const setupMap = () => {
  map = L.map('map').setView([51.505, -0.09], 13);

  map.attributionControl.setPosition('bottomleft');

  map.addGoogleMutant();
  map.whenReady(() => {
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
    console.log('input', input.value);
    showImages(getUrl);
  }
  else
  {
    getUrl = input.value;
    showImages(getUrl);
  }
}

// <---------- pagination start
const getTotalImageCount = () => {
  return fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG').length;
};

// pagination range
const getRange = () => {
  const cntPerPage = 100; // amount of images per page
  const pageRange = [];
  let initPage;
  let endPage;
  let pageCount;

  // total number of images returned from fetch operation
  const totalImgCnt = getTotalImageCount();

  // when images are 99 or less
  if (totalImgCnt < cntPerPage) {
    initPage = 1;
    endPage = totalImgCnt;
    pageRange[0] = `${initPage} - ${endPage} of ${totalImgCnt}`;
  } else {
    const diff = totalImgCnt % cntPerPage;
    endPage = cntPerPage;
    let counter = 1;

    // when images paginate into exactly 100 per page
    if (diff === 0) {
      pageCount = totalImgCnt / cntPerPage;
      const i = pageCount;
      while (pageCount >= 1) {
        endPage = cntPerPage * counter;
        initPage = (endPage - cntPerPage) + 1;
        pageRange[i - pageCount] = `${initPage} - ${endPage} of ${totalImgCnt}`;

        --pageCount;
        ++counter;
      };
    } else {
      // when the last page has less than 100 images
      if (diff >= 1) {
        pageCount = Math.trunc(totalImgCnt / cntPerPage);
        let endPage = cntPerPage;
        const i = pageCount;

        while (pageCount >= 1) {
          endPage = cntPerPage * counter;
          initPage = (endPage - cntPerPage) + 1;
          pageRange[i-pageCount] = `${initPage} - ${endPage} of ${totalImgCnt}`;
          --pageCount;
          ++counter;
        };
        --counter;
        endPage = (cntPerPage * counter) + diff;
        initPage = (endPage - diff) + 1;
        pageRange[i - pageCount] = `${initPage} - ${endPage} of ${totalImgCnt}`;
      };
    };
  };

  return pageRange;
};

// paginate function
const paginate = (imgs) => {
  const imgsPerPage = 100;
  const pages = Math.ceil(imgs.length / imgsPerPage);

  const paginatedImgs = Array.from({length: pages}, (_, index) => {
    const start = index * imgsPerPage;
    return imgs.slice(start, start + imgsPerPage);
  });
  return paginatedImgs;
};


// next btn
nextBtn.addEventListener('click', () => {
  const imgs = paginate(fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG'));
  if (currPage < imgs.length -1) {
    currPage = currPage + 1;
  } else {
    currPage = 0;
  }

  imageContainer.textContent = '';
  processImages(fetchedImages, userUrl, count);
});

// previous btn
prevBtn.addEventListener('click', () => {
  const imgs = paginate(fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG'));
  if (currPage) {
    currPage = currPage - 1;
  } else {
    currPage = imgs.length - 1;
  }

  imageContainer.textContent = '';
  processImages(fetchedImages, userUrl, count);
});
// <------------------ pagination end


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
  const paginatedImagess = paginate(imagesToRender);
  imageCount = imagesToRender.length;

  paginatedImagess[currPage].forEach((file) => {
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


const processImages = (fetchedImages, url, fileCount) => {
  const imageThumbnails = fetchedImages.filter(file => file.source === 'derivative');
  const fullResImages = fetchedImages.filter(file => file.format === 'PNG' || file.format === 'JPEG');
  range.innerHTML = getRange()[currPage]; // <--- update the range html with current page info

  if (fileCount > 100) {
    if (imageThumbnails.length === fullResImages.length) {
      renderThumbnails(imageThumbnails, url, fullResImages);
    } else {
      renderThumbnails(false, url, fullResImages);
    }
  } else {
    renderImages(fullResImages, url);
  }
};

function showImages(getUrl) {
  const url = getUrl.replace('details', 'metadata');

  axios.get(url)
      .then((response) => {
        if (response.data.files && response.data.files.length != 0) {
          // number of images (thumbnails and fullres files) in response data
          count = response.data.files.filter((file)=> {
            if (file.format === 'PNG' || file.format === 'JPEG' || file.format.includes('Thumb')) return file;
          }).length;
          userUrl = url;
          fetchedImages = response.data.files; // <---- all files fetched
          processImages(fetchedImages, url, count);
          responseText.innerHTML = imageCount ? `${imageCount} image(s) fetched successfully from ${fetchedFrom.innerHTML}.` : 'No images found in the link provided...';
        } else {
          responseText.innerHTML = 'No images found in the link provided...';
        }
      })
      .catch((error) => {
        responseText.innerHTML = 'Uh-oh! Something\'s not right with the link provided!';
      })
      .finally(() => {
        bootstrap.Modal.getInstance(welcomeModal).hide();
      });
}

welcomeModal.addEventListener('hidden.bs.modal', (event) => {
  new bootstrap.Offcanvas(sidebar).show();
});

restoreWelcomeModal.addEventListener('click', (event) => {
  bootstrap.Modal.getInstance(welcomeModal).show();
  input.value='';
});

mapToggle.addEventListener('click', (event) => {
  new bootstrap.Offcanvas(sidebar).show();
});

tileMap.addEventListener('click', (event) => {
  bootstrap.Offcanvas.getInstance(sidebar).hide();
});

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('place-button')) {
    const imageURL = event.target.previousElementSibling.dataset.original;
    const image = L.distortableImageOverlay(imageURL);
    map.imgGroup.addLayer(image);
  }
});
