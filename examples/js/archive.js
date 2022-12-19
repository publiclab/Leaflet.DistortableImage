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

let imageCount = 0;
let fetchedFrom;
function renderImages(file, url) {
  if (file.format === 'PNG' || file.format === 'JPEG') {
    const imageRow = document.createElement('div');
    const image = new Image(150, 150);
    const placeButton = document.createElement('a');
    fetchedFrom = document.createElement('p');
    const fetchedFromUrl = document.createElement('a');
    fetchedFromUrl.setAttribute('href', input.value);
    fetchedFromUrl.setAttribute('target', '_blank');
    fetchedFromUrl.innerHTML = 'this Internet Archive Collection';
    fetchedFrom.appendChild(fetchedFromUrl);

    placeButton.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'place-button');
    placeButton.innerHTML = 'Place on map';

    image.src = `${url.replace('metadata', 'download')}/${file.name}`;
    imageRow.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-4', 'pe-5');
    imageRow.append(image, placeButton);

    imageContainer.appendChild(imageRow);
    imageCount++;
  }
}

function showImages(getUrl) {
  const url = getUrl.replace('details', 'metadata');

  axios.get(url)
      .then((response) => {
        if (response.data.files && response.data.files.length != 0) {
          response.data.files.forEach((file) => {
            renderImages(file, url);
          });
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
    const imageURL = event.target.previousElementSibling.src;
    const image = L.distortableImageOverlay(imageURL);
    map.imgGroup.addLayer(image);
  }
});
