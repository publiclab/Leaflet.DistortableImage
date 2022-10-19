const upload_files = () => {
    const drop_zone = document.getElementById('dropZone');
    



    const active = () => drop_zone.classList.add("overlay");
    

    const inactive = () => drop_zone.classList.remove("overlay");

    const prevents = (e) => e.preventDefault();

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evtName => {
        drop_zone.addEventListener(evtName, prevents);
    });

    ['dragenter', 'dragover'].forEach(evtName => {
        drop_zone.addEventListener(evtName, active);
    });

    ['dragleave', 'drop'].forEach(evtName => {
        drop_zone.addEventListener(evtName, inactive);
    });

    drop_zone.addEventListener("drop", handleDrop);

}

document.addEventListener("DOMContentLoaded", upload_files);

const handleDrop = (e) => {
  
    var files = e.dataTransfer.files;
    console.log(files); 
    for (var i = 0, f; (f = files[i]); i++) {
        const reader = new FileReader();
      //save file to local storage
      reader.addEventListener("load", () => {
      localStorage.setItem("recent-image", reader.result)
    })
    reader.readAsDataURL(files[i]);
    // Read the File objects in this FileList.
  }

    alert("You're editing a map with local images. You'll need to save images at Archive.org if you'd like to save your work online, or to export the map");

    let form = new FormData()
    form.append('scale', prompt("Choose a scale to download image or use the default (cm per pixel):", 100) || mergedOpts.scale);
} 
