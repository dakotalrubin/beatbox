// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

var filepath_array = [];
var filename_array = [];

// ----------------------------------------------------------------------------
// EVENT LISTENERS FOR SNAPSHOT BUTTONS ---------------------------------------
// ----------------------------------------------------------------------------

const save_snapshot = document.querySelector(".header-save-snapshot");
save_snapshot.addEventListener("click", save_snapshot_data, false);

const load_snapshot = document.querySelector(".header-load-snapshot");
load_snapshot.addEventListener("click", load_snapshot_data, false);

// ----------------------------------------------------------------------------
// SAVE SNAPSHOT BUTTON -------------------------------------------------------
// ----------------------------------------------------------------------------

// Handles on-click functionality for the "Save Snapshot" button
function save_snapshot_data() {
    filepath_array = [];
    filename_array = [];
    get_filepaths();
    get_filenames(filepath_array);
    zip_files("save-snapshot", filepath_array);
}

// Populates filepath_array with the filepaths of all audio files
function get_filepaths() {
    for (var i = 0; i < 8; i++) {
        filepath = document.getElementById("sound-" + `${i+1}`).src;
        filepath_array.push(filepath);
    }
}

// Populates filename_array with the filenames of all audio files
function get_filenames(filepath_array) {
    for (var i = 0; i < 8; i++) {
        filename_array.push(parse_filename(filepath_array[i]));
    }
}

// Retrieves filename from filepath string
function parse_filename(string) {
    return string.split('\\').pop().split('/').pop();
}

function zip_files(id, filepath_array) {

    // Create new zip file
    zip = new JSZip();

    // Zip first audio file for download
    JSZipUtils.getBinaryContent(filepath_array[0], function (err, data) {
        if (!err) {
            // Lossless file encoding
            var dictionary = {base64:true, binary:true};
            zip.file(filename_array[0], data, dictionary);
        }
    });
    download_zip(id);
}

function download_zip(id) {

    zip.generateAsync({type:"blob"}).then(function(content) {
        var a = document.querySelector("#" + id);
        a.download = "snapshot";
        a.href = URL.createObjectURL(content);
        a.click();
    });
}

// ----------------------------------------------------------------------------
// LOAD SNAPSHOT BUTTON -------------------------------------------------------
// ----------------------------------------------------------------------------

// Handles on-click functionality for the "Load Snapshot" button
function load_snapshot_data() {
    return;
}