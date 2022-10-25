const upload_files = () => {
    const drop_zone = document.getElementById('dropZone');




    const active = () => drop_zone.classList.add("overlay");


    const inactive = () => drop_zone.classList.remove("overlay");

    const prevents = (e) => e.preventDefault();

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
        drop_zone.addEventListener(e, prevents);
    });

    ['dragenter', 'dragover'].forEach(e => {
        drop_zone.addEventListener(e, active);
    });

    ['dragleave', 'drop'].forEach(e => {
        drop_zone.addEventListener(e, inactive);
    });

    drop_zone.addEventListener("drop", handleDrop);

}

document.addEventListener("DOMContentLoaded", upload_files);

const handleDrop = (e) => {

    alert("You're editing a map with local images. You'll need to save images at Archive.org if you'd like to save your work online, or to export the map. \n please refresh to continue working on your image");

    let form = new FormData()
    form.append('scale', prompt("Choose a scale to download image or use the default (cm per pixel):", 100) || mergedOpts.scale);

    var files = e.dataTransfer.files;
    for (var i = 0, f; (f = files[i]); i++) {
        const reader = new FileReader();
      //save file to local storage
      reader.addEventListener("load", () => {
      localStorage.setItem("recent-image", reader.result)
    })
    reader.readAsDataURL(files[i]);
    // Read the File objects in this FileList.
  }

} 
