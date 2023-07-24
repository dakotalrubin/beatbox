// ----------------------------------------------------------------------------
// EVENT LISTENER -------------------------------------------------------------
// ----------------------------------------------------------------------------

// Channel mute buttons
const icmbs = document.querySelectorAll(".instrument-channel-mute-button");
icmbs.forEach((button) => {
  button.addEventListener("click", mute_volume);
});

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL MUTE BUTTON FUNCTIONALITY -------------------------------
// ----------------------------------------------------------------------------

function mute_volume(e) {

  var id;

  if (e.type == "click") {
    id = e.target.getAttribute('id'); // Apply clicked mute button's id
  } else {
    id = e; // Mute button was toggled by snapshot load or solo button
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
    if (activeSoloButton != muteBtn) {
      audio.volume = audio.ogVol;
    }
  }
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL MUTE BUTTON GETTER AND SETTER ---------------------------
// ----------------------------------------------------------------------------

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