// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------
import {  } from './menu_bar.js';
import {  } from './audio.js';

let popup = document.getElementById("popup"); // Toggles popup window
let volume_value_original; // Recovers original volume value

let defaultSoundArry = [
"./sounds/kick.wav", "./sounds/clap.wav", "./sounds/hihat.wav", "./sounds/boom.wav",
"./sounds/openhat.wav", "./sounds/ride.wav", "./sounds/snare.wav", "./sounds/tink.wav"
]

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL POPUP WINDOWS -------------------------------------------
// ----------------------------------------------------------------------------

// This function opens an instrument channel popup window
function open_instrument_channel_popup() {
  popup.classList.add("open-popup");
  return;
}

// This function closes an instrument channel popup window
function close_instrument_channel_popup() {
  popup.classList.remove("open-popup");
  return;
}

// ----------------------------------------------------------------------------
// CHANNEL NAMING -------------------------------------------------------------
// ----------------------------------------------------------------------------

// This function updates an instrument channel's name value
function update_instrument_channel_name(id) {

  // Keep track of instrument channel text box cursor style
  const name_text = document.getElementById(id);

  // Make the cursor appear for visual feedback
  name_text.style.caretColor = "white";

  // Pressing enter after typing a new value updates the instrument
  // channel's name
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

  // Clicking outside the text after typing a new value also updates
  // the instrument channel's name
  name_text.addEventListener("blur", function() {

    // Make the cursor disappear after clicking away from the text
    name_text.style.caretColor = "transparent";

    // Extract text field value
    let name_value = name_text.value;

    // Update instrument channel name and truncate at 10 characters
    name_text.value = name_value.substring(0, 10);
    return;
  });

  return;
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL PLAY BUTTON  --------------------------------------------
// ----------------------------------------------------------------------------

// Creates node list (icpbs) of instrument-channel-play-buttons
const icpbs = document.querySelectorAll(".instrument-channel-play-button");

// For each instrument-channel-play-button, adds event listener for "click"
icpbs.forEach((button) => {
  button.addEventListener("click", play_icpb_sound);
});

// This function plays the audio of the clicked
// instrument-channel-play-button (ICPB)
function play_icpb_sound(e) {

  // Initializes icpb variable with the clicked ICPB
  const icpb = e.target;

  // Initializes audio variable with the clicked ICPB's associated sound
  const sound = icpb.getAttribute('sound');
  const audio = document.querySelector(`audio[sound="${sound}"]`);

  // Exits function if clicked ICPB has no audio (unnecessary right now)
  if (!audio) {
    return;
  }

  // Plays audio without waiting for previous sound to finish
  audio.currentTime = 0;
  audio.play();

  return;
}

// ----------------------------------------------------------------------------
// UPLOAD AUDIO BUTTON --------------------------------------------------------
// ----------------------------------------------------------------------------

//Grab hidden-upload-button and instument-channel-upload-button from HTML
const hiddenUploadBtn = document.querySelector(".hidden-upload-button")
const customUploadBtn = document.querySelector(".instrument-channel-upload-button")
//Our custom upload button "listens" for a click
//When it does, it "clicks" the hidden upload button
customUploadBtn.addEventListener("click", function(){
  hiddenUploadBtn.click()
})

//When the file is uploaded, the hiddenUploadBtn will call the upload_audio func
hiddenUploadBtn.addEventListener("change", upload_audio, false)

function upload_audio(event) {
    const uploadBtn = event.target
    const files = event.target.files
    const instrumentChannelIndex = uploadBtn.getAttribute("instrument-channel")

    //Check if file is smaller than 1MB
    if (this.files[0].size > 1048576){
      alert("Max File size is 1MB. Try Again!")
      return
    }
    
    //Load new uploaded sound into Instrument Channel
    $(`audio[sound="${instrumentChannelIndex}"]`).attr("src", URL.createObjectURL(files[0]))
    document.querySelector(`audio[sound="${instrumentChannelIndex}"]`).load()

    //Check if file is 2 seconds MAX
    const audioElem = document.getElementById(`sound-${instrumentChannelIndex}`)
    audioElem.addEventListener("loadedmetadata", function() {
      //If the audio duration > 2 seconds, default to kick drum
      if (audioElem.duration > 2) {
        alert("Max Duration size is 2 seconds. Try Again!");
        // Reset the audio element
        audioElem.src = defaultSoundArry[instrumentChannelIndex - 1];
        audioElem.load();
        return;
      }
    });    
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL VOLUME BUTTON -------------------------------------------
// ----------------------------------------------------------------------------

// This function updates an instrument channel's volume
function update_instrument_channel_volume(id) {

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

      // Convert valid volume string into a number
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

      // Update instrument volume value
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

    // Convert valid volume string into a number
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

    // Update instrument volume value
    volume_text.value = volume_value;
    return;
  });

  return;
}

// This function accepts an instrument channel's updated volume
function accept_instrument_channel_volume(id) {

  // Get the volume text id using this OK button's id
  volume_text_id = "volume-text-" + id[3];

  // Update the instrument channel's volume as a percent
  let new_volume = document.getElementById(volume_text_id).value * 0.01;
  const audio = document.querySelector(`audio[sound="${id[3]}"]`);
  audio.volume = new_volume;

  // Close the instrument channel popup window
  close_instrument_channel_popup();
  return;
}

// This function denies an instrument channel's updated volume
function deny_instrument_channel_volume(id) {

  // Get the volume text id using this Cancel button's id
  volume_text_id = "volume-text-" + id[7];

  // Revert volume value back to original value
  document.getElementById(volume_text_id).value = volume_value_original;

  // Close the instrument channel popup window
  close_instrument_channel_popup();
  return;
}

// ----------------------------------------------------------------------------
// PANNING KNOB ---------------------------------------------------------------
// ----------------------------------------------------------------------------

// Add event listeners for the volume button
volumeButton.addEventListener("mouseenter", handleMouseEnterVolume);
volumeButton.addEventListener("mouseleave", handleMouseLeaveVolume);
volumeButton.addEventListener("mousemove", handleMouseMoveVolume);

// Get the panning elements
const panningKnobTic = document.querySelector(".instrument-channel-panning-tic");
const panningKnob = document.querySelector(".instrument-channel-panning-knob");
const panningpopup = document.querySelector(".panning-popup");

// Variables 
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
  volumePopup.style.opacity = 0;
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

// Variables to keep track of double click
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

// Function to update the position of the panning popup
function updatePanningPopUpPosition(event) {
  const x = event.clientX + 25;
  const y = event.clientY - 25;
  panningpopup.style.left = `${x}px`;
  panningpopup.style.top = `${y}px`;
}

// Function to update the value of the panning popup
function updatePanningPopUpValue(angle) {
  panningpopup.textContent = Math.round(angle).toString();
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

// ----------------------------------------------------------------------------
// MUTE BUTTON ----------------------------------------------------------------
// ----------------------------------------------------------------------------

// Functionality for Mute button
function mute_volume(id) {

  var muteBtn = document.getElementById(id);

  // Get volume
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
    // audio.volume = audio.ogVol;
    audio.volume = audio.ogVol;
  }
  return;
}

// ----------------------------------------------------------------------------
// SOLO BUTTON ----------------------------------------------------------------
// ----------------------------------------------------------------------------

