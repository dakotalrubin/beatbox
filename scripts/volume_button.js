// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

let volume_value_original; // Recovers original volume for popup Cancel button

// ----------------------------------------------------------------------------
// EVENT LISTENERS ------------------------------------------------------------
// ----------------------------------------------------------------------------

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