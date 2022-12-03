let map;
let welcomeModal = document.getElementById('welcomeModal');
let sidebar = document.getElementById('offcanvasRight');
let form = document.getElementById('form');
let input = document.getElementById('input');
let responseText = document.getElementById('response');
let imageContainer = document.getElementById('imgContainer');
let modalToggle = document.getElementById('modalToggle')
let mapToggle = document.getElementById('mapToggle')

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
setupCollection();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  extractKey();
});

welcomeModal.addEventListener('hidden.bs.modal', (event) => {
  new bootstrap.Offcanvas(sidebar).show();
});

function extractKey() {
  let getUrl;
  if(!input.value.includes('archive.org/details/') && !input.value.includes('https://'))
  {
    getUrl = `https://archive.org/details/${input.value}/`;
    showImages(getUrl); 
  }
  else if(!input.value.includes('https://') && !input.value.includes('http://') && input.value.includes('archive.org/details/')) {
    getUrl = `https://${input.value}`;
    showImages(getUrl);   
  }
  else if(input.value.includes('http://')) {
    getUrl = input.value.replace('http:', 'https:');
    input.value = getUrl;
    console.log('input', input.value);
    showImages(getUrl);   
  }
  else
  {
    getUrl = input.value;
    showImages(getUrl)
  }
}

function showImages(getUrl) {
  const url = getUrl.replace('details', 'metadata');
  let fetchedFrom
  axios.get(url)
    .then((response) => {
      if (response.data.files && response.data.files.length != 0) {
        let imageCount = 0;
        response.data.files.forEach(file => {
          if (file.format === 'PNG' || file.format === 'JPEG'){
            let imageRow = document.createElement('div');
            let image = new Image(150, 150);
            let placeButton = document.createElement('a');
            fetchedFrom = document.createElement('p');
            fetchedFromUrl = document.createElement('a');
            fetchedFromUrl.setAttribute('href', input.value);
            fetchedFromUrl.setAttribute('target', '_blank');
            fetchedFromUrl.innerHTML = 'this Internet Archive Collection';
            fetchedFrom.appendChild(fetchedFromUrl)

            placeButton.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'place-button');
            placeButton.innerHTML = 'Place on map';

            image.src = `${url.replace('metadata', 'download')}/${file.name}`;

            imageRow.classList.add('d-flex', 'justify-content-between', 'align-items-center', 'mb-4', 'pe-5');
            imageRow.append(image, placeButton);

            imageContainer.appendChild(imageRow);
            imageCount++;
          }
        });
        responseText.innerHTML = imageCount ? `${imageCount} image(s) fetched successfully from ${fetchedFrom.innerHTML}.` : 'No images found in the link provided...'
      } else {
        responseText.innerHTML = 'No images found in the link provided...'
      }
    })
    .catch((error) => {
      responseText.innerHTML = 'Uh-oh! Something\'s not right with the link provided!'
    })
    .finally(() => {
      bootstrap.Modal.getInstance(welcomeModal).hide();
    });
}

welcomeModal.addEventListener('hidden.bs.modal', (event) => {
    new bootstrap.Offcanvas(sidebar).show();
});


map.addEventListener('click', (event)=>{
   sidebar.classList.remove('show')
})

mapToggle.addEventListener('click', (event)=>{
       new bootstrap.Offcanvas(sidebar).show();
})
modalToggle.addEventListener('click', (event)=>{
        if(sidebar.classList.contains('show')){
          sidebar.classList.remove('show')
        }
})

document.addEventListener("click", (event) => {
  if (event.target.classList.contains('place-button')) {
    let imageURL = event.target.previousElementSibling.src;
    let image = L.distortableImageOverlay(imageURL);
    map.imgGroup.addLayer(image);
  }
});