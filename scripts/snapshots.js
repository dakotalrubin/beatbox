// ----------------------------------------------------------------------------
// EVENT LISTENERS FOR SNAPSHOT BUTTONS ---------------------------------------
// ----------------------------------------------------------------------------
import {note_toggle, stop_beat} from './header_bar.js';

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

            var user_data = generate_user_data();
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
    let user_data = "";
    //user_data += `Tempo: ${document.querySelector(".header-tempo").getAttribute("value")}\n`;

    // Copy note grid values
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            let note = "note" + `${j}-${i}`
            note = document.getElementById(note);
            user_data += `${note.getAttribute("value")}`;
        }
    }
    return user_data;
}

// ----------------------------------------------------------------------------
// SNAPSHOT UPLOAD BUTTON -----------------------------------------------------
// ----------------------------------------------------------------------------

// Uploads all downloaded sound files and project settings
async function snapshot_upload() {

    // Silence background noise while searching for snapshot
    stop_beat(); 

    // Prompt user to upload file
    let input = document.createElement("input");
    input.type = "file";
    input.onchange = _ => {

        let files = Array.from(input.files);

        // Only allow file with zip extension
        if (files[0].name.split(".").pop() != "zip") {
            alert("This is not a zip file. Try again!");
            return;
        }

        // Check filename for "snapshot" substring
        if (!files[0].name.includes("snapshot")) {
            alert("This is not a snapshot file. Try again!");
            return;
        }

        // Upload settings using "user_data.txt" values
        var zip = new JSZip();
        zip.folder().loadAsync(files[0]).then(function(zip) {

            // Error handling for necessary user data file
            try {
                zip.files["beatbox_files/user_data.txt"].name;
            } catch (TypeError) {
                alert("User data file not found. Try again!");
                return;
            }

            let user_data = zip.files["beatbox_files/user_data.txt"].name;
            zip.file(user_data).async("string").then(function(data) {
                load_note_grid(data);
            });
        });
    };
    input.click();
}

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS -----------------------------------------------------------
// ----------------------------------------------------------------------------

// Load note grid from snapshot
function load_note_grid(data) {

    // Reset note grid values by toggling all active notes off
    let index = 0;
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            let note = "note" + `${j}-${i}`
            let checking_note = document.getElementById(note).getAttribute("value");
            if (checking_note == 1) {
                note_toggle(note);
            }
            index++;
        }
    }

    // Apply note grid values from "user_data.txt"
    index = 0;
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            let note = "note" + `${j}-${i}`
            if (data[index] == 1) {
                note_toggle(note);
            }
            index++;
        }
    }
}