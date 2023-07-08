// ----------------------------------------------------------------------------
// Global variables
let interval; // Interval for playing the beat
let bpm = 120; // Default 120 bpm
// ----------------------------------------------------------------------------

// Creates header_tempo
const header_tempo = document.querySelector(".header-tempo");
// for header_tempo, adds event listener for "click"
header_tempo.addEventListener("click", update_header_tempo);

// Creates header_play
const header_play = document.querySelector(".header-play");
// for header_play, adds event listener for "click"
header_play.addEventListener("click", play_beat);

// Creates header_stop
const header_stop = document.querySelector(".header-stop");
// for header_stop, adds event listener for "click"
header_stop.addEventListener("click", stop_beat);

// Creates node list (icpbs) of instrument-channel-play-buttons
const icpbs = document.querySelectorAll(".instrument-channel-play-button");

// For each instrument-channel-play-button, adds event listener for "click"
icpbs.forEach((button) => {
  button.addEventListener("click", play_icpb_sound);
});

// This function updates the tempo button value (the bpm)
function update_header_tempo() {

  const tempo_text = document.querySelector(".header-tempo");

  // Make the cursor appear for visual feedback
  tempo_text.style.caretColor = "white";

  // Pressing enter after typing a new value will update the project's tempo
  tempo_text.addEventListener("keypress", ({key}) => {
    if (key == "Enter") {

      // Make the cursor disappear after pressing "Enter"
      tempo_text.style.caretColor = "transparent";

      // Extract text field value
      let tempo_value = document.querySelector("input").value;

      // Create new regex to determine if user entered valid tempo
      var regex = /^\d*\.?\d*$/;
      var is_valid_tempo_value = regex.test(tempo_value);

      // Exit function if user entered invalid tempo
      if (is_valid_tempo_value == false) {
        return;
      }

      // Convert valid tempo string into a number
      tempo_value = Number(tempo_value);

      // Set tempo value lower bound, update tempo button display
      if (tempo_value < 10) {
        bpm = 10;
        document.querySelector("input").value = 10;
        return;
      }

      // Set tempo value upper bound, update tempo button display
      if (tempo_value > 200) {
        bpm = 200;
        document.querySelector("input").value = 200;
        return;
      }

      // Set new project bpm from tempo_value rounded to the nearest int
      tempo_value = Math.round(tempo_value);
      bpm = tempo_value;

      // Update tempo button display and stop playback
      document.querySelector("input").value = tempo_value;
      stop_beat();
    }
  });

  return;
}

// This function plays the audio of the clicked instrument-channel-play-button (ICPB)
function play_icpb_sound(e) {

  // Initializes icpb variable with the clicked ICPB
  const icpb = e.target;

  // Initializes audio variable with the clicked ICPB's associated sound
  const sound = icpb.getAttribute('sound');
  const audio = document.querySelector(`audio[sound="${sound}"]`);

  // Exits function if the clicked ICPB has no audio (unnecessary as of right now)
  if (!audio) {
    return;
  }

  // Plays audio without waiting for previous sound to finish
  audio.currentTime = 0;
  audio.play();

  return;
}

// This function plays the beat at the project's bpm
function play_beat() {

  // Prevents errors from spamming header-play button (multiple intervals at a time)
  clearInterval(interval);

  let audio = document.querySelector("audio");

  // Calculation to turn bpm into time between beats (tbb) in milliseconds
  let tbb = (60 / bpm) * 1000;

  // Beat variable will always be 1-8 (except when being initialized)
  let beat = 0;

  // Sets the interval to time between beats (tbb)
  interval = setInterval(() => {

    if (beat == 8) {
      beat = 1; // Beat will reset to 1
    } else {
      beat++; // Increment beat
    }

    const id = 'note' + beat;
    const instrument_note_button = document.getElementById(id);
    const value = instrument_note_button.value;

    // Play a selected instrument note button
    if (value == 1) {

      // Plays audio without waiting for previous sound to finish
      audio.currentTime = 0;
      highlightElemBackground(instrument_note_button, '#9e5803');
      audio.play();
    } else {
      highlightElemBackground(instrument_note_button, '#303030');
    }
  }, tbb);

  return;
}

// This function stops the beat
function stop_beat() {
  clearInterval(interval);
  return;
}

// This function toggles an instrument note button on (orange) or off (gray)
function note_toggle(id) {

  // Get background color of an instrument note button
  // The 'background' variable has no value when you click a specific
  // note button for the first time, because that 'id' has no styling.
  // The following if-else block was written to handle every case!
  let background = document.getElementById(id).style.backgroundColor;

  // Changes background color of an instrument note button
  // Also changes the Boolean value associated with that instrument note button
  if(background == "rgb(255, 130, 67)") { // If the instrument note button is orange...
    document.getElementById(id).style.backgroundColor="rgb(84, 84, 84)"; // Make it gray
    document.getElementById(id).value = 0; // The note is now INACTIVE for playback
  } else {
    document.getElementById(id).style.backgroundColor="rgb(255, 130, 67)"; // Make it orange
    document.getElementById(id).value = 1; // The note is now ACTIVE for playback
  }

  return;
}

// This function will highlight the background of any element
// obj - the affected object
// color - the color palette to be applied wrapped in quotes
// e.g. '#fffff' for the color white
function highlightElemBackground(obj, color) {

  // Calculation to turn bpm into time between beats (tbb) in milliseconds
  let tbb = (60 / bpm) * 1000;

  // Create timeout so the element flashes with the beat
  const flash = obj.style.backgroundColor;
  obj.style.backgroundColor = color;

  setTimeout(() => {
    obj.style.backgroundColor = flash;
  }, tbb);

  return;
}