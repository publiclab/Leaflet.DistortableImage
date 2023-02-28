// saved maps modal
const savedMapsModal = document.getElementById('savedMapsModal');
const savedMapsModalIntialization = new bootstrap.Modal(savedMapsModal);
let mapsToRecover;
saveMapModalBtn.addEventListener('click', () => {
  mapList.innerHTML = '';
  const savedMaps = JSON.parse(localStorage.getItem('savedMaps'));
  bootstrap.Modal.getInstance(savedMapsModal).show();

  if (savedMaps !== null) {
    mapsToRecover = savedMaps;
    savedMaps.forEach((savedMap, index) => {
      const { amountOfImages, timeSaved } = savedMap;
      const eachMap = document.createElement('div');
      const eachMapTextDiv = document.createElement('div');
      const eachMapAmountText = document.createElement('h6');
      const eachMapDate = document.createElement('p');
      const recoverBtn = document.createElement('a');
      const recoverBtnDiv = document.createElement('div');

      eachMap.classList.add(
        'd-flex',
        'justify-content-between',
        'align-content-center'
      );
      eachMapTextDiv.classList.add('d-flex', 'flex-column');
      eachMapAmountText.innerHTML = `${amountOfImages} image(s)`;
      eachMapDate.innerHTML = `<b>Saved:</b> ${timeSaved}`;
      eachMapTextDiv.append(eachMapAmountText, eachMapDate);

      recoverBtn.classList.add(
        'btn',
        'btn-primary',
        'btn-md',
        'rounded-pill',
        'recover'
      );
      recoverBtn.innerHTML = 'Recover';
      recoverBtnDiv.appendChild(recoverBtn);
      recoverBtn.setAttribute('data-map-index', `${index}`);
      recoverBtn.setAttribute('title', 'Recover map');

      eachMap.append(eachMapTextDiv, recoverBtnDiv);

      mapList.append(eachMap);
    });
  } else {
    mapList.innerHTML = '<h5> No Saved Maps </h5>';
  }
});
