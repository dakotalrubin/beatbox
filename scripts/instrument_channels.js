// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

let volume_value_original; // Recovers original volume for popup Cancel button

let defaultSoundArry = [
"./sounds/kick.wav", "./sounds/clap.wav", "./sounds/hihat.wav", "./sounds/boom.wav",
"./sounds/openhat.wav", "./sounds/ride.wav", "./sounds/snare.wav", "./sounds/tink.wav"
]

// ----------------------------------------------------------------------------
// EVENT LISTENERS FOR ALL INSTRUMENT CHANNELS --------------------------------
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

// Channel volume buttons
const icvbs = document.querySelectorAll(".instrument-channel-volume-button");
icvbs.forEach((button) => {
  button.addEventListener("click", open_instrument_channel_popup);
  button.addEventListener("mouseenter", handleMouseEnterVolume);
  button.addEventListener("mouseleave", handleMouseLeaveVolume);
  button.addEventListener("mousemove", handleMouseMoveVolume);
});

// Channel volume text boxes
const icvt = document.querySelectorAll(".volume-popup-text");
icvt.forEach((input) => {
  input.addEventListener("click", update_instrument_channel_volume);
});

// Channel volume popup OK buttons
const pobs = document.querySelectorAll(".ok");
pobs.forEach((button) => {
  button.addEventListener("click", accept_instrument_channel_volume);
});

// Channel volume popup cancel buttons
const pcbs = document.querySelectorAll(".cancel");
pcbs.forEach((button) => {
  button.addEventListener("click", deny_instrument_channel_volume);
});

// Channel mute buttons
const icmbs = document.querySelectorAll(".instrument-channel-mute-button");
icmbs.forEach((button) => {
  button.addEventListener("click", mute_volume);
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
// INSTRUMENT CHANNEL VOLUME BUTTON -------------------------------------------
// ----------------------------------------------------------------------------

function update_instrument_channel_volume(e) {

  // Initializes id variable with the clicked channel name's id
  const id = e.target.getAttribute('id');

  // Keep track of volume text box cursor style
  const volume_text = document.getElementById(id);

  // Keep track of original volume value
  volume_value_original = volume_text.value;

  // Make the cursor appear for visual feedback, highlight button
  volume_text.style.caretColor = "white";
  volume_text.style.backgroundColor = "#7621C5";

  // Pressing "Enter" after typing a new value will update the volume
  volume_text.addEventListener("keydown", ({key}) => {
    if (key == "Enter") {

      // Make the cursor disappear after pressing "Enter"
      // Undo highlight button
      volume_text.style.caretColor = "transparent";
      volume_text.style.backgroundColor = "#551ABB";

      // Extract volume text field value
      let volume_value = volume_text.value;

      // Create new regex to determine if user entered valid volume
      var regex = /^-?(\d*\.)?\d+$/;
      var is_valid_volume_value = regex.test(volume_value);

      // Exit function if user entered invalid volume
      if (is_valid_volume_value == false) {
        volume_text.value = volume_value_original;
        return;
      }

      volume_value = Number(volume_value);

      // Set volume value lower bound, update volume button display
      if (volume_value < 0) {
        volume_text.value = 0;
        return;
      }

      // Set volume value upper bound, update volume button display
      if (volume_value > 100) {
        volume_text.value = 100;
        return;
      }

      // Set new volume value from volume_value rounded to the nearest int
      volume_value = Math.round(volume_value);

      volume_text.value = volume_value;
      return;
    }
  });

  // Clicking outside the text after typing a new value also updates
  // the instrument channel's volume
  volume_text.addEventListener("blur", function() {

    // Make the cursor disappear after clicking away from the text
    volume_text.style.caretColor = "transparent";
    volume_text.style.backgroundColor = "#551ABB";

    // Extract volume text field value
    let volume_value = volume_text.value;

    // Create new regex to determine if user entered valid volume
    var regex = /^-?(\d*\.)?\d+$/;
    var is_valid_volume_value = regex.test(volume_value);

    // Exit function if user entered invalid volume
    if (is_valid_volume_value == false) {
      volume_text.value = volume_value_original;
      return;
    }

    volume_value = Number(volume_value);

    // Set volume value lower bound, update volume button display
    if (volume_value < 0) {
      volume_text.value = 0;
      return;
    }

    // Set volume value upper bound, update volume button display
    if (volume_value > 100) {
      volume_text.value = 100;
      return;
    }

    // Set new volume value from volume_value rounded to the nearest int
    volume_value = Math.round(volume_value);

    volume_text.value = volume_value;
    return;
  });
}

function accept_instrument_channel_volume(e) {

  // Initializes id variable with the clicked volume OK button's id
  const id = e.target.getAttribute('id');

  // Get the volume text id using this OK button's id
  let volume_text_id = "volume-popup-text-" + id[3];

  // Update the instrument channel's volume as a percent
  let new_volume = document.getElementById(volume_text_id).value * 0.01;
  const audio = document.querySelector(`audio[sound="${id[3]}"]`);
  audio.volume = new_volume;
  close_instrument_channel_popup(e);
}

function deny_instrument_channel_volume(e) {

  // Initializes id variable with the clicked volume Cancel button's id
  const id = e.target.getAttribute('id');

  // Get the volume text id using this Cancel button's id
  let volume_text_id = "volume-popup-text-" + id[7];

  // If original volume value is undefined, make it default to 100
  if(volume_value_original == null) {
    volume_value_original = 100;
  }

  // Revert volume value back to original value
  document.getElementById(volume_text_id).value = volume_value_original;
  close_instrument_channel_popup(e);
}

function updateVolumePopupPosition(e) {
  const x = e.clientX + 20;
  const y = e.clientY - 20;
  let id = e.target.id[26];
  let volumePopup = document.getElementById("instrument-channel-volume-popup-" + id);
  volumePopup.style.left = `${x}px`;
  volumePopup.style.top = `${y}px`;
}

function updateVolumePopupValue(e) {
  let id = e.target.id[26];
  let volumeID = document.getElementById("volume-popup-text-" + id);
  let volumeValue = volumeID.value;
  let volumePopup = document.getElementById("instrument-channel-volume-popup-" + id);
  volumePopup.textContent = "Volume: " + volumeValue.toString();
}

function handleMouseEnterVolume(e) {
  let id = e.target.id[26];
  let volumePopup = document.getElementById("instrument-channel-volume-popup-" + id);
  updateVolumePopupPosition(e);
  updateVolumePopupValue(e);
  volumePopup.style.opacity = 1;
}

function handleMouseLeaveVolume(e) {
  let id = e.target.id[26];
  let volumePopup = document.getElementById("instrument-channel-volume-popup-" + id);
  volumePopup.style.opacity = 0;
}

function handleMouseMoveVolume(e) {
  updateVolumePopupPosition(e);
}

// Gets current instrument channel volume values for snapshot download
function get_instrument_channel_volume_buttons() {
  let instrument_channel_volume_values = [];
  let volumes = document.querySelectorAll(".volume-popup-text");
  for (let i = 0; i < 8; i++) {
    instrument_channel_volume_values.push(volumes[i].value);
  }
  return instrument_channel_volume_values;
}

// Sets new instrument channel volume values for snapshot upload
function set_instrument_channel_volume_button(id, value) {
  document.getElementById(id).value = value;
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL MUTE BUTTON ---------------------------------------------
// ----------------------------------------------------------------------------

function mute_volume(e) {

  var id;

  if (e.type == "click") {
    id = e.target.getAttribute('id'); // Apply clicked mute button's id
  } else {
    id = e; // Mute button was toggled by snapshot load
  }

  // Initializes id variable with the clicked mute button's id
  let muteBtn = document.getElementById(id);
  let audio = document.querySelector(`audio[sound="${id[9]}"]`);

  // Maintain original volume
  if (!audio.ogVol) {
    audio.ogVol = audio.volume;
  } else if ((audio.volume != 1) && (audio.volume > 0)) {
    audio.ogVol = audio.volume;
  } else if (audio.volume == 1) {
    audio.ogVol = 1;
  } 

  // Makes button red when clicked and sets volume to 0
  if (muteBtn.classList.toggle("mute-button-on")) {
    audio.volume = 0;
    document.getElementById(id).setAttribute("value", 1);
  } else {
    document.getElementById(id).setAttribute("value", 0);
    audio.volume = audio.ogVol;
  }
}

// Get current instrument channel mute values for snapshot download
function get_instrument_channel_mute_buttons() {
  let instrument_channel_mute_values = [];
  let mute_values = document.querySelectorAll(".instrument-channel-mute-button");
  for (let i = 0; i < 8; i++) {
    instrument_channel_mute_values.push(mute_values[i].value);
  }
  return instrument_channel_mute_values;
}

// Sets new instrument channel  mute values for snapshot upload
function set_instrument_channel_mute_buttons(line) {

  // Reset mute values by toggling all active mute buttons off
  let index = 0;
  for (let i = 1; i < 9; i++) {
    let checking_button = document.getElementById(`mute-btn-${i}`).getAttribute("value");
    if (checking_button == 1) {
      mute_volume(`mute-btn-${i}`);
    }
    index++;
  }

  // Apply mute button values from "user_data.txt"
  index = 0;
  for (let i = 0; i < 8; i++) {
    if (line[i] == 1) {
      mute_volume(`mute-btn-${i+1}`);
    }
    index++;
  }
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL SOLO BUTTON ---------------------------------------------
// ----------------------------------------------------------------------------



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