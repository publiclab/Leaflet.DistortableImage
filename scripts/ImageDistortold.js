//use of require.js for modularizing the script
define(function(require) { 
    var LeafletAffineImageOverlay = function(map, image, canvasId, options) {
        var map = map; // the leaflet map
        var image = image; // the image which is going to get transformed
        var canvasId = canvasId; // The id of the canvas element
        var canvas = null; // for DOM element canvas
        var ctx = null; // canvas drawing context (which is 2d in our case)
        var affineMarkers = []; // Markers which can be dragged for image transformation.
        var imageLocations = null; //Array of image pixel locations that match up with affineMarkers
        var affineMarkerLayer = null; //layer containing the markers
        var options = $.extend({ 
            icon: L.Icon.Default, // The markers to be used for the transformations.
            boundingScale: 0.5, //scale of image to map's veiwport
        }, options);

        // Initializing the process
        function init() {
            insertCanvas();
            ctx = canvas.getContext('2d');
            Markers();
            setupListeners();
            render();
            return;
        }

        function insertCanvas() {
            canvas = document.createElement('canvas');
            var mapSize = map.getSize();
            canvas.id = canvasId;
            canvas.width = mapSize.x;
            canvas.height = mapSize.y;
            $(map._container.parentNode).append(canvas);
            return;
        }

        function Markers() {
            var mapSize = map.getSize().clone();
            var boundedMapSize = map.getSize().clone();
            var imageSize = new L.Point(image.width, image.height);

            boundedMapSize.x *= options.boundingScale;
            boundedMapSize.y *= options.boundingScale;
            var xBoundingPad = (mapSize.x - boundedMapSize.x) / 2;
            var yBoundingPad = (mapSize.y - boundedMapSize.y) / 2;

            var mapAspectRatio = boundedMapSize.x / boundedMapSize.y;
            var imageAspectRatio = imageSize.x / imageSize.y;

            var xPad = 0;
            var yPad = 0;
            if (mapAspectRatio >= imageAspectRatio) {
                // Image taller than map per width, so pad x.
                var imageScale = boundedMapSize.y / imageSize.y;
                var scaledImageWidth = imageSize.x * imageScale;
                xPad = (boundedMapSize.x - scaledImageWidth) / 2;
            } else {
                // Image wider than map per height, so pad y.
                var imageScale = boundedMapSize.x / imageSize.x;
                var scaledImageHeight = imageSize.y * imageScale;
                yPad = (boundedMapSize.y - scaledImageHeight) / 2;
            }

            var north = yBoundingPad + yPad;
            var south = mapSize.y - (yBoundingPad + yPad);
            var west = xBoundingPad + xPad;
            var east = mapSize.x -  (xBoundingPad + xPad);

            var nw = new L.Point(west, north);
            var ne = new L.Point(east, north);
            var se = new L.Point(east, south);

            affineMarkers.push(createMarkerAtContainerPoint(nw));
            affineMarkers.push(createMarkerAtContainerPoint(ne));
            affineMarkers.push(createMarkerAtContainerPoint(se));

            affineMarkerLayer = new L.LayerGroup();
            for (i in affineMarkers) {
                affineMarkerLayer.addLayer(affineMarkers[i]);
            }
            map.addLayer(affineMarkerLayer);

            imageLocations = [];
            imageLocations.push([0,0]);
            imageLocations.push([image.width, 0]);
            imageLocations.push([image.width, image.height]);
        }

        // Returns a marker object at the given container location
        function createMarkerAtContainerPoint(container_point) {
            var latlng = map.containerPointToLatLng(container_point);

            return new L.Marker(latlng, {
                draggable: true,
                icon: new options.icon(),
            });
        }
       
        // Sets up the listeners needed to keep the overlay canvas in sync with 
        // the markers on the map.
        function setupListeners() {
            map.on('move', render);
            for (i in affineMarkers) {
                affineMarkers[i].on('drag', render);
            }
        }

       
        // Renders the overlay to the given canvas context.
        function render() {
            ctx.save();
            clearCanvas();

            var marker0 = map.latLngToContainerPoint(affineMarkers[0].getLatLng());
            var marker1 = map.latLngToContainerPoint(affineMarkers[1].getLatLng());
            var marker2 = map.latLngToContainerPoint(affineMarkers[2].getLatLng());

            var m11 = (marker1.x - marker0.x) / image.width;
            var m12 = (marker1.y - marker0.y) / image.width;
            var m21 = (marker2.x - marker1.x) / image.height;
            var m22 = (marker2.y - marker1.y) / image.height;
            var dx = marker0.x;
            var dy = marker0.y;

            ctx.setTransform(
                m11, m12,
                m21, m22,
                dx,  dy
            );
            ctx.globalAlpha = 1; //opacity of the image
            ctx.drawImage(image, 0,0);
            ctx.restore();
            return;
        }

        // Clear the canvas so it may be redrawn
        function clearCanvas() {
            ctx.clearRect(0,0, canvas.width, canvas.height);
            return;
        }

        // Return a list of ground control points that reflect the current state
        // of the overlay.  Ground control point objects have two attributes 
        // containing two-element arrays that express a coordinate pair,
        // image_location, and world_location.  The former being a pixel 
        // location on the image (x,y), the later being a location on the world
        // (lng,lat).
        function getGcpList() {
            var gcps = [];
            for (i in affineMarkers) {
                var image_loc = imageLocations[i];
                var world_loc = affineMarkers[i].getLatLng();
                gcps.push({
                    image_location: image_loc,
                    world_location: [world_loc.lng, world_loc.lat]
                });
            }
            return gcps;
        }

        init();
        return {
            getGcpList: getGcpList,
        };
    };

    return LeafletAffineImageOverlay;
});

