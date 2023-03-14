# MapKnitter Lite

Following MapKnitter's shutdown in 2022 due to lack of funds, Public Lab's code community team came together to come up with a way to run some version of MapKnitter on minimal resources. 

MapKnitter has been used by thousands of people to make their own aerial maps (a kind of DIY Google Earth), especially of areas of environmental disasters like the 2011 BP oil disaster. @publiclab community members take aerial photos from balloons, kites, & even long poles and combine or “knit” them into high resolution maps. 

One reason MapKnitter went offline was its high cost to operate. So MapKnitter Lite re-imagined MapKnitter as a serverless, static JavaScript app that runs for free, hosted on GitHub Pages. We chose to build it within GitHub Pages, for now as a subset of the purely JS Leaflet.DistortableImage project.

Happily, due to the excellent work of @segun-codes and @7malikk during the 2023 Winter session of Outreachy, we have been able to make almost all of MapKnitter's original features available again. 

But where are the images and saved maps stored? Images are kept in Internet Archive collections (which Public Lab was already doing) & maps are saved in “mapknitter.json” save files, which can be downloaded, emailed, or stored online.

In addition, since we made a huge effort to archive over 7800 old MapKnitter maps at @waybackmachine, @7malikk & @segun-codes made it possible to open and edit old maps. It’s not the fanciest, but here’s a list of all ~7800 maps:

https://publiclab.github.io/Leaflet.DistortableImage/examples/mapknitter

Now, for some documentation:

****

### Reference Terms: 

* `save file`: a JSON file containing a saved state of the images you've added to the map, their positions and distortions
* `IA`: Internet Archive

## Features of Mapknitter Lite

## 1. Knit Maps 

You can perform perspectival distortion of map images to build new maps over the provided background map tiles.

### How to Use the Feature

1. Start the server with `http-server` (install this with `npm install http-server`) and load https://localhost:8080/examples/archive.html in your browser.
2. Follow instruction in the dialog box displayed to fetch images to work with. (They must first be uploaded into an IA collection.)
3. Click the "Place on map" button on the opened sidebar to place the desired image on the base map.
4. Begin distorting and knitting of the images on the base map to build new map as desired.

### Demo

![1-knitting](https://user-images.githubusercontent.com/1612359/222577171-d72ce619-ae7e-4dac-a27f-dd8bb07fb3db.gif)

## 2. Download Map saved state 

You can download a "save file" of your current map to your computer after completing your mapknitter task or if you intend to continue working on the same map. With the download feature, the current state of your map (image positions, but not the image files themselves) is saved in the save file. The save file can be used to restore you map in the future so that you can continue knitting your map from the point where you stopped, or share it with someone else.

### How to Use the Feature

1.  After knitting the map, click the stack icon to open the sidebar.
2. Click the download button.
3. An save file is generated and downloaded to your computer.
4. The save file can be used to reconstruct the map in the future.

### Demo

![2 downloadMap](https://user-images.githubusercontent.com/1612359/222585816-509b075f-e6dd-4556-b2a7-413231801c14.gif)

## 3. Save map in browser

MapKnitter Lite offers the ability to save maps to the browser for easy retrieval in the future. Remember: it is only saved in your current browser, not on other devices or in other browsers on the same device. This feature uses the browser's `localStorage` capability. 

### How to Use the Feature

1. After knitting the map, click the stack icon to open the sidebar.
2. Click the save icon.
3. An save file is generated and saved to your broswer.
4. The save file can be used to reconstruct the map in the future.

### Demo

![3 SaveMapInBrowser](https://user-images.githubusercontent.com/1612359/222585883-af55aac5-2e7b-4634-8b59-dc8890a49ea3.gif)

## 4. Share map

You can share your map by sharing the downloaded save file or by uploading the save file to IA or another publicly available online URL. 

### How to Use the Feature

1. Follow the instruction on section "Download Map".
2. Upload the save file to archive.org.
3. Alternatively, you can share the save file by email to another recipient (e.g., a colleague).

### Demo

![shareMap](https://user-images.githubusercontent.com/1612359/222586029-55e80585-51fd-471f-8679-4aa65cf9e5d9.gif)

## 5. Reconstruct Map from URL

MapKnitter Lite now supports reconstruction of maps from save files uploaded into archive.org collections.

1. Construct shareable URL using one of the two URL formats below:
    a. Using the full URL of a JSON file: https://publiclab.github.io/Leaflet.DistortableImage/examples/archive?json=https://archive.org/download/mkl-2-2/mkl-2-2.json
    b. Using just the key of the IA collection, where it will auto-detect the JSON file: https://publiclab.github.io/Leaflet.DistortableImage/examples/archive?k=mkl-2-2
    c. We also wanted to enable people to load old maps from the MapKnitter.org website. To load a legacy map like https://mapknitter.org/maps/ceres--2 (now offline, but cached in the Wayback Machine), you can use the URL https://publiclab.github.io/Leaflet.DistortableImage/examples/archive?kl=ceres--2
2. Share or save the above URLs
3. Load the shareable URL in a browser to reconstruct the map.

### Demo

![5a-1](https://user-images.githubusercontent.com/1612359/222574118-8843e8f7-53f7-4e8b-869a-99de8cc4aeab.gif)
![5b-2](https://user-images.githubusercontent.com/1612359/222574511-cfedfe32-f53d-46c2-a39a-bb5147245630.gif)
![5b Support json links restored](https://user-images.githubusercontent.com/1612359/222569683-4605e82c-d809-44bb-a4cb-1a09ca86c556.gif)

### Note:

* Names of all legacy save files are available here: http://localhost:8081/examples/mapknitter.html
* Legacy save file with image objects having no coordinates are downloaded and placed on the sidebar, not the tile layer.

## 6. Drag and Drop Downloaded Save File to Reconstruct Map

A user can reconstruct map by dragging and dropping a save file onto the base map. 

### How to Use the Feature

1. Load URL https://publiclab.github.io/Leaflet.DistortableImage/examples/archive or https://publiclab.github.io/Leaflet.DistortableImage/examples/local in your browser.
2. Close dialog box if any is displayed. At this point, the tile layer is cleared.
3. Drag and drop the save file onto the tile layer.
4. This restores your map to its previous state and you can continue further knitting tasks.

### Demo

![6a](https://user-images.githubusercontent.com/1612359/222570595-b63ca096-e5ea-4512-85a6-360e72ce652e.gif)

### 7. Reconstruct Map Through JSON Save File Auto-Detection

MapKnitter Lite can now detect a save file containing, and upon user confirmation, it is loaded onto the base map.

### How to Use the Feature

1. Load URL https://publiclab.github.io/Leaflet.DistortableImage/examples/archive
2. Follow instruction in the dialog box displayed to fetch images to work with, from an IA collection with a save file in the collection.
3. A pop-up will ask if you want to restore map from save file, if one is detected in the IA collection entered in the dialog box.
4. Click "Ok" to restore the map using the detected save file.

### Demo

![7 autoDetect-json](https://user-images.githubusercontent.com/1612359/222586141-f1b2bfeb-75bb-48a0-a391-1b069d65395a.gif)
