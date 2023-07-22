// ----------------------------------------------------------------------------
// EVENT LISTENERS FOR SNAPSHOT BUTTONS ---------------------------------------
// ----------------------------------------------------------------------------

const save_snapshot = document.querySelector(".header-save-snapshot");
save_snapshot.addEventListener("click", snapshot_download);

const load_snapshot = document.querySelector(".header-load-snapshot");
load_snapshot.addEventListener("click", snapshot_upload);

// ----------------------------------------------------------------------------
// SNAPSHOT DOWNLOAD BUTTON ---------------------------------------------------
// ----------------------------------------------------------------------------

// Retrieves all current sound files and project settings for download
async function snapshot_download() {
    var zip = new JSZip();
    var count = 1;
    var zip_filename = "snapshot.zip";
    var sounds = [
        document.getElementById("sound-1").src,
        document.getElementById("sound-2").src,
        document.getElementById("sound-3").src,
        document.getElementById("sound-4").src,
        document.getElementById("sound-5").src,
        document.getElementById("sound-6").src,
        document.getElementById("sound-7").src,
        document.getElementById("sound-8").src,
    ];

    sounds.forEach(async function(sound) {
        // Gets the index of the sound being processed asynchronously
        // to preserve the channel ordering for re-upload
        let index = `${sounds.indexOf(sound) + 1}`;

        // Split filepath from filename
        var filename = sound.split('\\').pop().split('/').pop();
        var file = await fetch(sound);

        // This file was uploaded by the user, so convert blob so rename file
        if (filename.slice(-3) != "wav") {
            filename = document.getElementById(`sound-${index}`).getAttribute("data");
        }

        // Add sound blobs to zip file
        var sound_blob = await file.blob();
        var zip_sound = zip.folder("beatbox_files");
        zip_sound.file(index + " - " + filename, sound_blob, {base64: true, binary: true});
        count++;

        // Save files and generate zip folder
        if (count == sounds.length + 1) {

            user_data = generate_user_data();
            var user_data_blob = new Blob([user_data], {type: "text/plain; charset=utf-8"});
            zip_sound = zip.folder("beatbox_files");
            zip_sound.file("user_data.txt", user_data_blob);

            zip.generateAsync({type: "blob"}).then(function(content) {
                saveAs(content, zip_filename);
            });
        }
    });
}

// This function gathers all settings on the site and compiles them into a string
function generate_user_data() {
    user_data = "";
    user_data += `Tempo: ${document.querySelector(".header-tempo").getAttribute("value")};\n`;
    // user_data += everything else lol
    return user_data;
}

// ----------------------------------------------------------------------------
// SNAPSHOT UPLOAD BUTTON -----------------------------------------------------
// ----------------------------------------------------------------------------

// Uploads all downloaded sound files and project settings
async function snapshot_upload() {
/*
    var zip = new JSZip();
    zip.loadAsync(data).then(function(zip) {
        zip.file("user_data.txt").async("string").then(function(data) {
            console.log(data); // Print data from "user_data.txt" file
        });
    });
*/
}