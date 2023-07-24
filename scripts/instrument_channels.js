// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

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

// Sets new instrument channel mute values for snapshot upload
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
let channelVolumes = null;
let activeSoloButton = null;
let soloStates = null;

function solo_instrument(e) {

  // Turn all solo buttons off
  for (let i = 1; i < 9; i++) {
    document.getElementById(`solo-btn-${i}`).value = 0;
  }

  var id;

  if (e.type == "click") {
    id = e.target.getAttribute('id'); // Apply clicked solo button's id
  } else {
    id = e; // Solo button was toggled by snapshot load
  }

  let soloBtn = document.getElementById(id);

  // Toggle solo button value on/off
  if (soloBtn.getAttribute("value") == 1) {
    soloBtn.setAttribute("value", 0);

  } else {
    soloBtn.setAttribute("value", 1);
  }

  let audio = document.querySelector(`audio[sound="${id[9]}"]`);
  let channelID = id[9];
  let channelVolumes;

  if (channelVolumes == null) {
    channelVolumes = store_volumes_for_solo();
  }

  //Check if there is already an active soloBtn
  if (activeSoloButton !== soloBtn){
    //If there is, then untoggle it and restore volume to channels
    if (activeSoloButton) {
      activeSoloButton.classList.remove("solo-button-on");
      activeSoloButton = null;
      restore_volumes_to_channels(channelVolumes, soloStates);
    }
    activeSoloButton = soloBtn;
  }

  // If the soloBtn is on, then mute all other channels
  if (soloBtn.classList.toggle("solo-button-on")) {

    // Disable all other mute buttons
    for(let i = 1; i < 9; i++) {
      if (i != id[9]) {
        document.getElementById(`mute-btn-${i}`).disabled = true;
      } else {
        document.getElementById(`mute-btn-${i}`).disabled = false;
      }
    }
    soloStates = mute_all_other_channels(channelVolumes, channelID);
  } else {

    // Enable all mute buttons
    for(let i = 1; i < 9; i++) {
      document.getElementById(`mute-btn-${i}`).disabled = false;
    }

      // If the soloBtn is turned off, then restore volume to other channels
      if (channelVolumes) {
        restore_volumes_to_channels(channelVolumes, soloStates); 
      }else{
        for (let i = 0; i < 8; i++) {
          if (document.getElementById(`mute-btn-${i}`).value != 1) {
            let revertAudio = document.querySelector(`audio[sound="${i + 1}"]`);
            revertAudio.volume = 1;
          }
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

//Parameters:
//First: Takes in an array of current volumes for ICs
//Second: Takes the currentID of the soloBtn that was pressed
//Return: An array that stores the current solo state of an IC
//It's either soloed or not
function mute_all_other_channels(channelVolumes, channelID) {
  const numOfChannels = 8;
  const activeSoloChannel = channelID;
  const soloStates = [];
  
  for (let i = 0; i < numOfChannels; i++) {
    let audio = document.querySelector(`audio[sound="${i + 1}"]`);
    soloStates[i] = audio.volume;
    if (i + 1 == activeSoloChannel) {
      channelVolumes[i].soloed = true;
    } else {
      channelVolumes[i].soloed = false; // Set the soloed flag to false for non-soloed channels
      audio.volume = 0; // Mute non-soloed channels'
    }
  }
  return soloStates;
}

//Parameters:
//First: Takes in an array of current volumes for ICs
//Second: Takes the array of the current solo states
//Return: Restores the original volume back to the ICs
function restore_volumes_to_channels(channelVolumes, soloStates) {
  const numOfChannels = 8;

  for (let i = 0; i < numOfChannels; i++) {
    let audio = document.querySelector(`audio[sound="${i + 1}"]`);
    if (channelVolumes[i].soloed === false) {
      audio.volume = soloStates[i];
    }
  }
}

// Get current instrument channel solo values for snapshot download
function get_instrument_channel_solo_buttons() {
  let instrument_channel_solo_values = [];
  let solo_values = document.querySelectorAll(".instrument-channel-solo-button");
  for (let i = 0; i < 8; i++) {
    instrument_channel_solo_values.push(solo_values[i].value);
  }
  return instrument_channel_solo_values;
}

// Sets new instrument channel solo values for snapshot upload
function set_instrument_channel_solo_buttons(line) {

  // Reset solo values by toggling all active solo buttons off
  let index = 0;
  for (let i = 1; i < 9; i++) {
    let checking_button = document.getElementById(`solo-btn-${i}`).getAttribute("value");
    if (checking_button == 1) {
      solo_instrument(`solo-btn-${i}`);
    }
    index++;
  }

  // Apply solo button values from "user_data.txt"
  index = 0;
  for (let i = 0; i < 8; i++) {
    if (line[i] == 1) {
      solo_instrument(`solo-btn-${i+1}`);
    }
    index++;
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