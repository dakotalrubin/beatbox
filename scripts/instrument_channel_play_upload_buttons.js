// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

let defaultSoundArry = [
"./sounds/kick.wav", "./sounds/clap.wav", "./sounds/hihat.wav", "./sounds/boom.wav",
"./sounds/openhat.wav", "./sounds/ride.wav", "./sounds/snare.wav", "./sounds/tink.wav"
]

// ----------------------------------------------------------------------------
// EVENT LISTENERS FOR INSTRUMENT CHANNELS ------------------------------------
// ----------------------------------------------------------------------------

// Channel names
const channel_names = document.querySelectorAll(".instrument-channel-name");
channel_names.forEach((input) => {
  input.addEventListener("click", update_instrument_channel_name);
});

// Channel play buttons
const icpbs = document.querySelectorAll(".instrument-channel-play-button");
icpbs.forEach((button) => {
  button.addEventListener("click", play_icpb_sound);
});

// Channel hidden upload buttons
const hubs = document.querySelectorAll(".hidden-upload-button");
hubs.forEach((button) => {
  button.addEventListener("change", upload_audio, false);
});

// Channel custom upload buttons
const cubs = document.querySelectorAll(".instrument-channel-upload-button");
cubs.forEach((button) => {
  button.addEventListener("click", function(e) {
    hubs[e.target.id[5] - 1].click(); // Clicks proper hidden upload button
  });
});

// ----------------------------------------------------------------------------
// CHANNEL NAMING -------------------------------------------------------------
// ----------------------------------------------------------------------------

function update_instrument_channel_name(e) {

  // Initializes id variable with the clicked channel name's id
  const id = e.target.getAttribute('id');

  // Keep track of instrument channel text box cursor style
  const name_text = document.getElementById(id);

  // Make the cursor appear for visual feedback
  name_text.style.caretColor = "white";

  // Pressing enter after typing new value updates name
  name_text.addEventListener("keypress", ({key}) => {
    if (key == "Enter") {

      // Make the cursor disappear after pressing "Enter"
      name_text.style.caretColor = "transparent";

      // Extract text field value
      let name_value = name_text.value;

      // Update instrument channel name and truncate at 10 characters
      name_text.value = name_value.substring(0, 10);
      return;
    }
  });

  // Clicking outside text after typing new value updates name
  name_text.addEventListener("blur", function() {

    // Make the cursor disappear after clicking away from the text
    name_text.style.caretColor = "transparent";

    // Extract text field value
    let name_value = name_text.value;

    // Update instrument channel name and truncate at 10 characters
    name_text.value = name_value.substring(0, 10);
    return;
  });
}

// ----------------------------------------------------------------------------
// CHANNEL NAMING GETTER AND SETTER -------------------------------------------
// ----------------------------------------------------------------------------

// Gets current instrument channel names for snapshot download
function get_instrument_channel_names() {
  let instrument_channel_names = [];
  let names = document.querySelectorAll(".instrument-channel-name");
  for (let i = 0; i < 8; i++) {
    instrument_channel_names.push(names[i].value);
  }
  return instrument_channel_names;
}

// Sets new instrument channel names for snapshot upload
function set_instrument_channel_name(id, value) {
  document.getElementById(id).value = value;
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL PLAY BUTTON ---------------------------------------------
// ----------------------------------------------------------------------------

// This function plays audio for clicked instrument channel play button
function play_icpb_sound(e) {

  createAudioContx();

  // Initializes audio variable with the clicked ICPB's associated sound
  const sound = e.target.getAttribute('sound');
  const audio = document.querySelector(`audio[sound="${sound}"]`);

  // Exits function if clicked ICPB has no audio
  if (!audio) {
    return;
  }

  // Plays audio without waiting for previous sound to finish
  panAudio();
  audio.currentTime = 0;
  audio.play();
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL UPLOAD BUTTON -------------------------------------------
// ----------------------------------------------------------------------------

function upload_audio(event) {

  const uploadBtn = event.target;
  const files = event.target.files;
  const instrumentChannelIndex = uploadBtn.getAttribute("instrument-channel");

  // Check if file is smaller than 1 MB
  if (this.files[0].size > 1048576) {
    alert("Max File size is 1MB. Try again!");
    return;
  }
    
  // Load new uploaded sound into Instrument Channel
  $(`audio[sound="${instrumentChannelIndex}"]`).attr("src", URL.createObjectURL(files[0]));
  document.querySelector(`audio[sound="${instrumentChannelIndex}"]`).load();

  // Check if audio file is less than 2 seconds
  var audioElem = document.getElementById(`sound-${instrumentChannelIndex}`);

  audioElem.addEventListener("loadedmetadata", function() {

    // If audio file is greater than 2 seconds, default to kick drum
    if (audioElem.duration > 2) {
      alert("Max file duration is 2 seconds. Try again!");

      // Reset audio element
      audioElem.src = defaultSoundArry[instrumentChannelIndex - 1];
      audioElem.load();      
    }
  });

  // Attach filename to audioElem as data attribute
  audioElem.setAttribute('data', `${this.files[0].name}`);
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL POPUP WINDOWS -------------------------------------------
// ----------------------------------------------------------------------------

// Open the specific instrument channel volume popup window requested
function open_instrument_channel_popup(e) {
  let popup = document.getElementById("popup-" + e.target.id[26]);
  let popup_header_text = document.getElementById("popup-header-" + e.target.id[26]);

  // Add instrument channel name to volume popup window
  popup_header_text.innerHTML = "Instrument Channel: " + 
    document.getElementById("instrument-channel-name-" + e.target.id[26]).value;
  popup.classList.add("open-popup");
}

// Close the specific instrument channel volume popup window requested
function close_instrument_channel_popup(e) {
  let popup;

  // If hitting Cancel button...
  if (e.target.id[0] == "c") {
    popup = document.getElementById("popup-" + e.target.id[7]);
  } else {
    popup = document.getElementById("popup-" + e.target.id[3]);
  }
  popup.classList.remove("open-popup");
}