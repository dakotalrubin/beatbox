// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

let volume_value_original; // Recovers original volume value

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

// Channel solo buttons
const icsbs = document.querySelectorAll(".instrument-channel-solo-button");
icsbs.forEach((button) => {
  button.addEventListener("click", solo_instrument);
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
// INSTRUMENT CHANNEL PLAY BUTTON ---------------------------------------------
// ----------------------------------------------------------------------------

// This function plays audio for clicked instrument channel play button
function play_icpb_sound(e) {

  // Initializes audio variable with the clicked ICPB's associated sound
  const sound = e.target.getAttribute('sound');
  const audio = document.querySelector(`audio[sound="${sound}"]`);

  // Exits function if clicked ICPB has no audio
  if (!audio) {
    return;
  }

  // Plays audio without waiting for previous sound to finish
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
    alert("Max File size is 1MB. Try Again!");
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

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL PANNING KNOB --------------------------------------------
// ----------------------------------------------------------------------------

// Get the panning elements
const panningKnobTic = document.querySelector(".instrument-channel-panning-tic");
const panningKnob = document.querySelector(".instrument-channel-panning-knob");
const panningpopup = document.querySelector(".panning-popup");

let isDragging = false;
let startAngle = 0;
let startMouseX = 0;
let currentAngle = 0;
const sensitivity = 1.2; 
let showPPopupTimeout;

// Function to handle mouse down event on the panning knob button
function handleMouseDownPanning(event) {
  event.preventDefault();
  isDragging = true;
  startAngle = getCurrentRotationAngle();
  startMouseX = event.clientX;
  currentAngle = startAngle;
  panningKnob.classList.add("active"); 
  clearTimeout(showPPopupTimeout);
}

// Function to handle mouse move event
function handleMouseMovePanning(event) {
  panningpopup.style.opacity = 0;
  if (!isDragging) return;
  const mouseX = event.clientX;
  const angleChange = (mouseX - startMouseX) * sensitivity;
  const newAngle = startAngle + angleChange;
  const clampedAngle = clampRotationAngle(newAngle); 
  currentAngle = clampedAngle;
  rotateTic(currentAngle);
  updatePanningPopUpValue(currentAngle);
  updatePanningPopUpPosition(event);
  panningpopup.style.opacity = 1;
}

// Function to handle mouse up event
function handleMouseUpPanning(event) {
  if (!isDragging) return;
  isDragging = false;
  currentAngle = clampRotationAngle(currentAngle); 
  rotateTic(currentAngle);
  panningpopup.style.opacity = 0;
  panningKnob.classList.remove("active");
}

// Function to get the current rotation angle of the tic
function getCurrentRotationAngle() {
  const transformStyle = window.getComputedStyle(panningKnobTic).getPropertyValue("transform");
  const matrix = transformStyle.match(/^matrix\((.+)\)$/);
  if (matrix) {
    const matrixValues = matrix[1].split(",");
    if (matrixValues.length === 6) {
      return Math.atan2(parseFloat(matrixValues[1]), parseFloat(matrixValues[0])) * (180 / Math.PI);
    }
  }
  return 0;
}

// Function to clamp the rotation angle within the specified range
// (makes no sense for a panning knob to fully rotate 360 deg)
function clampRotationAngle(angle) {
  const minAngle = -100;
  const maxAngle = 100;
  if (angle < minAngle) {
    return minAngle;
  } else if (angle > maxAngle) {
    return maxAngle;
  }
  return angle;
}

// Function to rotate the tic to a specific angle
function rotateTic(angle) {
  panningKnobTic.style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

// Variable to keep track of double click
let doubleClickTimer = null;

// Function to handle double click event
function handleDoubleClickPanning(event) {
  panningpopup.style.opacity = 1;
  event.preventDefault(); 
  clearTimeout(doubleClickTimer);
  resetTicAngle();
  const angle = getCurrentRotationAngle();
  updatePanningPopUpValue(angle);
  showPPopupTimeout = setTimeout(() => {
    panningpopup.style.opacity = 0;
  }, 550);
}

// Function to reset the tic angle to 0
function resetTicAngle() {
  currentAngle = 0;
  rotateTic(currentAngle);
}

function updatePanningPopUpPosition(event) {
  const x = event.clientX + 20;
  const y = event.clientY - 20;
  panningpopup.style.left = `${x}px`;
  panningpopup.style.top = `${y}px`;
}

function updatePanningPopUpValue(angle) {
  panningpopup.textContent = "Panning: " + Math.round(angle).toString();
}

function handleMouseEnterPanning() {
  if (!isDragging) {
    showPPopupTimeout = setTimeout(() => {
      panningpopup.style.opacity = 1;
      const angle = getCurrentRotationAngle();
      updatePanningPopUpValue(angle);
    }, 700); 
  }
}

function handleMouseLeavePanning() {
  clearTimeout(showPPopupTimeout);
  panningpopup.style.opacity = 0;
}

panningKnob.addEventListener("mousemove", (event) => {
  updatePanningPopUpPosition(event);
  const angle = getCurrentRotationAngle();
  updatePanningPopUpValue(angle);
});

// Add event listener for double click on the panning knob
panningKnob.addEventListener("dblclick", handleDoubleClickPanning);

// Add event listener for the panning knob button
panningKnob.addEventListener("mousedown", handleMouseDownPanning);
document.addEventListener("mousemove", handleMouseMovePanning);
document.addEventListener("mouseup", handleMouseUpPanning);

// Add event listener for the panning knob button
panningKnob.addEventListener("mouseenter", handleMouseEnterPanning);
panningKnob.addEventListener("mouseleave", handleMouseLeavePanning);

// IN-PROGRESS
function panAudio() {
  const panner = new audioContext.PannerNode();
  return;
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL MUTE BUTTON ---------------------------------------------
// ----------------------------------------------------------------------------

function mute_volume(e) {

  // Initializes id variable with the clicked volume mute button's id
  let id = e.target.getAttribute('id');
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
  } else {
    audio.volume = audio.ogVol;
  }
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL SOLO BUTTON ---------------------------------------------
// ----------------------------------------------------------------------------
let channelVolumes = null;

function solo_instrument(e) {
  let id = e.target.getAttribute('id');
  let soloBtn = document.getElementById(id);
  let audio = document.querySelector(`audio[sound="${id[9]}"]`);
  let channelID = id[9];
  let channelVolumes;
  let soloStates;

  if (soloBtn.classList.toggle("solo-button-on")) {
    if (channelVolumes == null) {
      channelVolumes = store_volumes_for_solo();
    }
    soloStates = mute_all_other_channels(channelVolumes, channelID);
  } else {
      if (channelVolumes) {
        console.log("Inside the else statement")
        restore_volumes_to_channels(channelVolumes, soloStates); 
      }else{
        for (let i = 0; i < 8; i++) {
          let revertAudio = document.querySelector(`audio[sound="${i + 1}"]`);
          revertAudio.volume = 1;
        }
      }
  }
}

//Supplementary Functions to keep track of Instrument Channel Volumes
//Returns an array of the current volumes for the ICs
function store_volumes_for_solo() {
  const numOfChannels = 8;
  const array = [];

  for (let i = 0; i < numOfChannels; i++) {
    let audio = document.querySelector(`audio[sound="${i + 1}"]`);
    array[i] = { volume: audio.volume, soloed: false };
  }

  return array;
}

function mute_all_other_channels(array, channelID) {
  const numOfChannels = 8;
  const activeSoloChannel = channelID;
  const soloStates = [];
  
  for (let i = 0; i < numOfChannels; i++) {
    let audio = document.querySelector(`audio[sound="${i + 1}"]`);
    soloStates[i] = audio.volume;
    if (i + 1 == activeSoloChannel) {
      array[i].soloed = true;
    } else {
      array[i].soloed = false; // Set the soloed flag to false for non-soloed channels
      audio.volume = 0; // Mute non-soloed channels
    }
  }
  return soloStates;
}

function restore_volumes_to_channels(channelVolumes, soloStates) {
  const numOfChannels = 8;

  for (let i = 0; i < numOfChannels; i++) {
    let audio = document.querySelector(`audio[sound="${i + 1}"]`);
    if (channelVolumes[i].soloed === false) {
      audio.volume = soloStates[i];
    }
  }
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