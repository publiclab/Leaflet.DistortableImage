let map;

(function() {
  map = L.map('map').setView([51.505, -0.09], 13);
  map.addGoogleMutant();

  map.whenReady(function() {
    img = L.distortableImageOverlay('example.jpg', {
      corners: [
        L.latLng(51.52, -0.14),
        L.latLng(51.52, -0.10),
        L.latLng(51.50, -0.14),
        L.latLng(51.50, -0.10),
      ],
      mode: 'lock',
    });

    // create a second image
    img2 = L.distortableImageOverlay('example.jpg', {
      corners: [
        L.latLng(51.51, -0.20),
        L.latLng(51.51, -0.16),
        L.latLng(51.49, -0.21),
        L.latLng(51.49, -0.17),
      ],
      mode: 'freeRotate',
      suppressToolbar: true,
    });

    img3 = L.distortableImageOverlay('example.jpg', {
      corners: [
        L.latLng(51.50, -0.13),
        L.latLng(51.50, -0.09),
        L.latLng(51.48, -0.14),
        L.latLng(51.48, -0.10),
      ],
      actions: [
        L.DistortAction,
        L.FreeRotateAction,
        L.LockAction,
        L.OpacityAction,
        L.DeleteAction,
        L.StackAction,
      ],
    });

    img4 = L.distortableImageOverlay('example.jpg', {
      actions: [
        L.ScaleAction,
        L.DistortAction,
        L.RotateAction,
        L.FreeRotateAction,
        L.LockAction,
        L.OpacityAction,
        L.DeleteAction,
        L.StackAction,
      ],
      corners: [
        L.latLng(51.51, -0.07),
        L.latLng(51.51, -0.03),
        L.latLng(51.49, -0.08),
        L.latLng(51.49, -0.04),
      ],
    });

    imgGroup = L.distortableCollection().addTo(map);

    /* TODO: make an addLayers func */
    imgGroup.addLayer(img);
    imgGroup.addLayer(img4);
    imgGroup.addLayer(img2);
    imgGroup.addLayer(img3);
  });
})();


