// ----------------------------------------------------------------------------
// EVENT LISTENER -------------------------------------------------------------
// ----------------------------------------------------------------------------

// Channel solo buttons
const icsbs = document.querySelectorAll(".instrument-channel-solo-button");
icsbs.forEach((button) => {
  button.addEventListener("click", solo_instrument);
});

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL SOLO BUTTON FUNCTIONALITY -------------------------------
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

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL SOLO BUTTON HELPER FUNCTIONS ----------------------------
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL SOLO BUTTON GETTER AND SETTER ---------------------------
// ----------------------------------------------------------------------------

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