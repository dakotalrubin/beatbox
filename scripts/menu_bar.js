// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------
import { bpm, lock_grid, popup, lock_icon, playing_beat, stop_beat } from './audio.js';
import {  } from './instrument_channels.js';

let bpm = 120; // Default 120 bpm
let lock_grid = false; // Locks note grid during playback
let lock_icon = document.getElementById("lock-icon"); // Toggles lock icon

// ----------------------------------------------------------------------------
// HEADER TEMPO BUTTON --------------------------------------------------------
// ----------------------------------------------------------------------------

// Creates header_tempo event listener
const header_tempo = document.querySelector(".header-tempo");
// for header_tempo, adds event listener for "click"
header_tempo.addEventListener("click", update_header_tempo);

// This function updates the tempo button value (the bpm)
function update_header_tempo() {

  // Keep track of tempo text box cursor style
  const tempo_text = document.querySelector(".header-tempo");

  // Keep track of original tempo value
  let tempo_value_original = tempo_text.value;

  // Make the cursor appear for visual feedback, highlight button
  tempo_text.style.caretColor = "white";
  tempo_text.style.backgroundColor = "#7621C5";

  // Pressing enter after typing a new value will update the project's tempo
  tempo_text.addEventListener("keypress", ({key}) => {
    if (key == "Enter") {

      // Make the cursor disappear after pressing "Enter"
      // Also undoes highlight button
      tempo_text.style.caretColor = "transparent";
      tempo_text.style.backgroundColor = "#551ABB";

      // Extract tempo text field value
      let tempo_value = tempo_text.value;

      // Create new regex to determine if user entered valid tempo
      var regex = /^-?(\d*\.)?\d+$/;
      var is_valid_tempo_value = regex.test(tempo_value);

      // Exit function if user entered invalid tempo
      if (is_valid_tempo_value == false) {
        tempo_text.value = tempo_value_original;
        return;
      }

      // Convert valid tempo string into a number
      tempo_value = Number(tempo_value);

      // Set tempo value lower bound, update tempo button display
      if (tempo_value < 10) {
        bpm = 10;
        tempo_text.value = 10;
        return;
      }

      // Set tempo value upper bound, update tempo button display
      if (tempo_value > 400) {
        bpm = 400;
        tempo_text.value = 400;
        return;
      }

      // Set new project bpm from tempo_value rounded to the nearest int
      tempo_value = Math.round(tempo_value);
      bpm = tempo_value;

      // Update tempo button display and stop playback
      tempo_text.value = tempo_value;
      stop_beat();
    }
  });

  // Clicking outside the text after typing a new value also updates
  // the project's tempo
  tempo_text.addEventListener("blur", function() {

    // Make the cursor disappear after clicking away from the text
    tempo_text.style.caretColor = "transparent";
    tempo_text.style.backgroundColor = "#551ABB";

    // Extract tempo text field value
    let tempo_value = tempo_text.value;

    // Create new regex to determine if user entered valid tempo
    var regex = /^-?(\d*\.)?\d+$/;
    var is_valid_tempo_value = regex.test(tempo_value);

    // Exit function if user entered invalid tempo
    if (is_valid_tempo_value == false) {
      tempo_text.value = tempo_value_original;
      return;
    }

    // Convert valid tempo string into a number
    tempo_value = Number(tempo_value);

    // Set tempo value lower bound, update tempo button display
    if (tempo_value < 10) {
      bpm = 10;
      tempo_text.value = 10;
      return;
    }

    // Set tempo value upper bound, update tempo button display
    if (tempo_value > 400) {
      bpm = 400;
      tempo_text.value = 400;
      return;
    }

    // Set new project bpm from tempo_value rounded to the nearest int
    tempo_value = Math.round(tempo_value);
    bpm = tempo_value;

    // Update tempo button display and stop playback
    tempo_text.value = tempo_value;
    stop_beat();
  });

  return;
}

// ----------------------------------------------------------------------------
// HEADER PLAY BUTTON ---------------------------------------------------------
// ----------------------------------------------------------------------------

// Creates header_play event listener
const header_play = document.querySelector(".header-play");
// for header_play, adds event listener for "click"
header_play.addEventListener("click", play_beat);

// ----------------------------------------------------------------------------
// HEADER STOP BUTTON ---------------------------------------------------------
// ----------------------------------------------------------------------------

// Creates header_stop event listener
const header_stop = document.querySelector(".header-stop");
// for header_stop, adds event listener for "click"
header_stop.addEventListener("click", stop_beat);

// ----------------------------------------------------------------------------
// NOTE GRID ------------------------------------------------------------------
// ----------------------------------------------------------------------------

// This function toggles an instrument note button on (orange) or off (gray)
function note_toggle(id) {

  // Don't allow notes to be toggled during beat playback
  if (lock_grid == true) {
    return;
  }

  // Get background color of an instrument note button
  // The 'background' variable has no value when you click a specific
  // note button for the first time, because that 'id' has no styling.
  // The following if-else block was written to handle every case!
  let background = document.getElementById(id).style.backgroundColor;

  // Changes background color of an instrument note button
  // Also changes Boolean value associated with that instrument note button
  if(background == "rgb(255, 130, 67)") { // If orange note button, make gray
    document.getElementById(id).style.backgroundColor="rgb(84, 84, 84)";
    document.getElementById(id).value = 0; // Note is now INACTIVE for playback
  } else { // If gray note button, make orange
    document.getElementById(id).style.backgroundColor="rgb(255, 130, 67)";
    document.getElementById(id).value = 1; // Note is now ACTIVE for playback
  }

  return;
}

// This function will highlight the background of any note
// obj - the affected note
// color - the color palette to be applied wrapped in quotes
// e.g. "#FFFFFF" for the color white
function highlightElemBackground(obj, color) {

  // Calculation to turn bpm into time between beats (tbb) in milliseconds
  let tbb = (60 / bpm) * 1000;

  const flash = obj.style.backgroundColor;
  obj.style.backgroundColor = color;

  // Create timeout so the note flashes with the beat
  setTimeout(() => {
    obj.style.backgroundColor = flash;
  }, tbb);

  return;
}