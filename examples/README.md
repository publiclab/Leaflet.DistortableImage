//--------------------------------------------------------------------------------------------------------------------------------------------------
DOCUMENTATION FOR LIBRARY USAGE

(1.)
FEATURE: Reconstruct images from URL
DESCRIBE/HOW IT WORKS: Maps converted to JSON file and saved to archive.org can be reconstructed. This also applies to all the JSON files generated from legacy mapknitter.org and stored on archive.org.  
HOW TO USE THE FEATURE:
//1. Instantiate an empty `DistortableCollection` group
imgGroup = L.distortableCollection().addTo(map);

//2. Get property set for each of the images 
const imageCollectionObj = await map.imgGroup.recreateImagesFromJsonUrl(jsonDownloadURL); // library function

Note: jsonDownloadUrl must be in format: 
	i. https://archive.org/download/mkl-2-2/mkl-2-2.json (for json files generated from Mapknitter-Lite)
		- "mkl-2-2" is the identifier provided by archive.org after a file is uploaded to the service (i.e., archive,org)
		- "mkl-2-2.json" name of the Json file
    
	ii. OR https://archive.org/download/mapknitter/--10.json (for json files from legacy mapknitter.org)
		- "mapknitter" is the path for all the legacy Json files and must be present in the URL
		- "--10.json" 
	  
//3. Iterate through each of the property sets and place each of them on the tile map using:  
image = L.distortableImageOverlay(imageURL,{tooltipText, corners}); // extract imageURL, tooltipText and corners from each of the property set in imageCollectionObj
map.imgGroup.addLayer(image);

//--------------------------------------------------------------------------------------------------------------------------------------------------
DOCUMENTATION FOR MK-LITE APPLICATION

Term: json file => Map Recovery File (MRF)
      archive.org => internet archive (IA)

(1)
FEATURE: Knit Maps 
DESCRIBE/HOW: 
You can perform perspectival distortion of map images to build new maps using the provided tile.  
HOW TO USE THE FEATURE:
Load the URL https://localhost:8080/examples/archive.html in your browser
Follow instruction in the dialog box displayed to download your images to the tile
Click the "Place on map" button on the opened sidebar to place the desired image on the tile
Begin distorting and knitting of the images on the tile to build new map as desired.

(2)
FEATURE: Download Map 
DESCRIBE/HOW: 
You can download your current map to your computer after completing your mapknitter task or if you intend to continue the knitting task on thesame map 
in the future. With the download feature, the current state of your map is saved in the MRF. The MRF can be used to restore you map in the future so that you can continue
knitting your map from the point where you stopped.
 
HOW TO USE THE FEATURE:
After knitting the map, click the stack icon to open the sidebar.
Click the download button.
An MRF is generated and downloaded to your computer.
The MRF can be used to reconstruct the map in the future. 

//-----------

(3)
FEATURE: Save map in browser
DESCRIBE/HOW:
HOW TO USE THE FEATURE (FOR MRF GENERATED FROM MK-LITE):
After knitting the map, click the stack icon to open the sidebar.
Click the save icon.
An MRF is generated and saved to your broswer.
The MRF can be used to reconstruct the map in the future. 

//-----------
(4)
FEATURE: Share map
DESCRIBE/HOW: You can share your map by sharing the downloaded MRF or by uploading the MRF to IA 
HOW TO USE THE FEATURE (FOR MRF GENERATED FROM MK-LITE):
Follow the instruction on section "Download Map"
Upload the MRF to archive.org
Alternatively, you can share the MRF by email to another recipient (e.g., a colleague).

//-----------
(5)
FEATURE: Reconstruct Map from URL

DESCRIBE/HOW: 
MK-lite now supports reconstruction of maps from MRF saved on archive.org.  

HOW TO USE THE FEATURE (FOR MRF GENERATED FROM MK-LITE):
Construct shareable URL as below:
https://localhost:8080/examples/archive.html?k=[identifier]
https://localhost:8080/examples/archive.html?kl=[file-name]
http://localhost:8081/examples/archive.html?json=https://archive.org/download/[mkl-2-2]/[mkl-2-2.json] (for MK-Lite generated json files)
http://localhost:8081/examples/archive.html?json=https://archive.org/download/mapknitter/[--10.json] (

Load the shareable URL https://localhost:8080/examples/archive.html?k=[identifier] on your browser to reconstruct the map.
Ensure you replaced "[identifier]" with the identifier provided by archive.org.
This restores your map to its previous state and you can continue further knitting tasks.

HOW TO USE THE FEATURE:
To use MRF from legacy mapnitter.org, load shareable URL https://localhost:8080/examples/archive.html?kl=[file-name].
Ensure "[file-name]" is replaced with the MRF name (e.g., -emf-, 01_03_cockroach_75m, --10 etc.).
Names of the legacy MRFs are available here: http://localhost:8081/examples/mapknitter.html.
To use MK-Lite generated MRF, load shareable URL https://localhost:8080/examples/archive.html?k=[identifier] on your browser to reconstruct the legacy map.
Ensure "[identifier]" is replaced with the MRF identifier.
This restores your map to its previous state and you can continue further knitting tasks.

Note: 
For legacy MRF, image objects without coordinates are downloaded and placed on the sidebar, not the tile layer.
"Identifier" is generated by archive.org once you upload the downloaded MRF to the service. 
For example, 
	If your downloaded MRF from MK-Lite is "mkl-2-2.json", upon uploading to archive.org you will receive the URL https://archive.org/download/mkl-2-2/mkl-2-2.json to access the uploaded file. "mkl-2-2" is the identifier

You can also restore your map using URL formats:
	http://localhost:8081/examples/archive.html?json=[https://archive.org/download/mkl-2-2/mkl-2-2.json] (for MK-Lite generated json files)
	http://localhost:8081/examples/archive.html?json=https://archive.org/download/mapknitter/[--10.json]
Replace [https://archive.org/download/mkl-2-2/mkl-2-2.json] with the URL generated by internet archive after you upload MRF to it.
Replace [--10.json] with the name of the legacy MRF.
This restores your map to its previous state and you can continue further knitting tasks.
Alternatively, replace [https://archive.org/download/mkl-2-2/mkl-2-2.json] with URL from repositories similar to internet archive 

//----
(6) 
FEATURE: Drag and Drop Downloaded MRF to Reconstruct Map

DESCRIBE/HOW: 
A user can reconstruct map by dragging and dropping an MRF onto tile layer 

HOW TO USE THE FEATURE:
Load URL https://localhost:8080/examples/archive.html or https://localhost:8080/examples/local.html on your browser
Close dialog box if any is displayed. At this point, the tile layer is cleared.
Drag and drop the MRF onto the tile layer.
This restores your map to its previous state and you can continue further knitting tasks.

//-----------
(7)

FEATURE: Reconstruct Map through Auto-detection

DESCRIBE/HOW: 
Mapknitter Lite can now detect MRF containing a map, and upon user affirmation, it would be loaded on the tile layer.

HOW TO USE THE FEATURE:
Load URL https://localhost:8080/examples/archive.html 
Follow instruction in the dialog box displayed to download your images to the tile
A pop-up will ask if you want to restore map from MRF, if one is detected in the URL entered in the dialog box
Click "Ok" to restore the map using the detected MRF.
This restores your map to its previous state and you can continue further knitting tasks.


































