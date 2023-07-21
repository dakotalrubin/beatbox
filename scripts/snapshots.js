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
        var filename = sound.split('\\').pop().split('/').pop();
        var file = await fetch(sound);

        // This file has been uploaded by the user
        if (filename.slice(-3) != "wav") {
            file = new File([file.blob()], filename, {base64: true, binary: true});
        }

        var sound_blob = await file.blob();
        var zip_sound = zip.folder("sounds");
        zip_sound.file(filename, sound_blob, {base64: true, binary: true});
        count++;
        if (count == sounds.length + 1) {
            zip.generateAsync({type: "blob"}).then(function(content) {
                saveAs(content, zip_filename);
            });
        }
    });
}