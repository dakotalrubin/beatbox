import {note_toggle, stop_beat, get_tempo_value, set_tempo_value} from './header_bar.js';
import {get_instrument_channel_names, set_instrument_channel_name,
get_instrument_channel_mute_buttons, set_instrument_channel_mute_buttons} from './instrument_channels.js';

// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

 let audio_file_array = []; // These values will be added to user data file

// ----------------------------------------------------------------------------
// EVENT LISTENERS ------------------------------------------------------------
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
    var zip_filename = "snapshot-" + get_formatted_time() + ".zip";
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
    audio_file_array = [];

    sounds.forEach(async function(sound) {
        // Gets the index of the sound being processed asynchronously
        // to preserve the channel ordering for re-upload
        let index = `${sounds.indexOf(sound) + 1}`;

        // Split filepath from filename
        var filename = sound.split('\\').pop().split('/').pop();
        var file = await fetch(sound);

        // This file was uploaded by user, so get data attribute to rename blob
        if (filename.slice(-3) != "wav") {
            filename = document.getElementById(`sound-${index}`).getAttribute("data");
        }

        // Add sound blobs to zip file
        var sound_blob = await file.blob();
        var zip_sound = zip.folder("beatbox_files");
        zip_sound.file(index + "_" + filename, sound_blob, {base64: true, binary: true});
        audio_file_array.push(index + "_" + filename);
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

    // Copy note grid values
    for (let i = 1; i < 9; i++) {
        for (let j = 1; j < 9; j++) {
            let note = "note" + `${j}-${i}`
            note = document.getElementById(note);
            user_data += `${note.getAttribute("value")}`;
        }
    }
    user_data += "\n";

    // Copy header tempo value
    user_data += get_tempo_value() + "\n";

    // Copy instrument channel names
    let instrument_channel_names = get_instrument_channel_names();
    for (let i = 0; i < 8; i++) {
        user_data += instrument_channel_names[i] + "\n";
    }

    // Copy audio filepaths
    audio_file_array.sort();
    for (let i = 0; i < 8; i++) {
        user_data += audio_file_array[i] + "\n";
    }

    // Copy instrument channel mute values
    let instrument_channel_mute_values = get_instrument_channel_mute_buttons();
    for (let i = 0; i < 8; i++) {
        user_data += instrument_channel_mute_values[i];
    }
    user_data += "\n";

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
                let lines = data.split("\n");

                // Checking "user_data.txt" for corrupted values
                let success = check_user_data_file(lines);
                if (success == 1) {
                    return;
                }

                // Upload snapshot values
                load_note_grid(lines[0]);
                set_tempo_value(Math.round(Number(lines[1])));

                for (let i = 1; i < 9; i++) {
                    set_instrument_channel_name(`instrument-channel-name-${i}`, lines[i+1]);
                }

                /* 
                for (let i = 1; i < 9; i++) {
                    upload_audio_file(zip.files[`beatbox_files/${lines[i+9]}`], i);
                }
                */

                set_instrument_channel_mute_buttons(lines[18]);
            });
        });
    };
    input.click();
}

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS -----------------------------------------------------------
// ----------------------------------------------------------------------------

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

// Used for generating unique snapshot filename
function get_formatted_time() {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var hour = today.getHours();
    var minute = today.getMinutes();
    var second = today.getSeconds();
    return month + "-" + day + "-" + year + "-" + hour + "-" + minute + "-" + second;
}

function check_user_data_file(lines) {

    // Checks to make sure notes grid formatted correctly
    if (lines[0].length != 64) {
        alert("User data file is corrupted! Pick a different snapshot!");
        return 1;
    }

    // Checks to make sure tempo is valid
    if (isNaN(Number(lines[1])) || Math.round(Number(lines[1])) < 10 || Math.round(Number(lines[1])) > 400) {
        alert("User data file is corrupted! Pick a different snapshot!");
        return 1;
    }

    // Checks to make sure instrument channel names formatted correctly
    for (let i = 2; i < 10; i++) {
        if (lines[i].length > 10) {
            alert("User data file is corrupted! Pick a different snapshot!");
            return 1;
        }
    }

    return 0;
}

function upload_audio_file(file, index) {
    var audio_element = document.getElementById(`sound-${index}`);
    var bytes = new TextEncoder("utf-8").encode(JSON.stringify(file)).buffer;
    var blob = new Blob([bytes], {"type": "application/json"});
    audio_element.src = URL.createObjectURL(blob);
    audio_element.load();
}