// Global Variables -----------------------------------------------------------
let interval; // Interval for playing beat
// ----------------------------------------------------------------------------

// Creates play_button
const play_button = document.querySelector(".header-play");
// for play_button, adds event listener for "click"
play_button.addEventListener("click", play_beat);

// Creates stop_button
const stop_button = document.querySelector(".header-stop");
// for stop_button, adds event listener for "click"
stop_button.addEventListener("click", stop_beat);

// Creates node list (icbs) of intsrument-channel-buttons
const icbs = document.querySelectorAll(".playBtn");

// For each intsrument-channel-button, adds event listener for "click" 
icbs.forEach((button) => {
  button.addEventListener("click", play_icb_sound);
});

// This function plays the audio of the clicked instrument-channel-button(ICB)
function play_icb_sound(e) {

  // Initializes icb variable with the clicked ICB
  const icb = e.target;

  // Initializes audio variable with the clicked ICB's associated sound
  const sound = icb.getAttribute('sound');
  const audio = document.querySelector(`audio[sound="${sound}"]`);

  // Exits function if the clicked ICB has no audio (unnecessary as of right now)
  if (!audio) {
    return;
  }

  // Play audio
  audio.currentTime = 0; // Plays sound without waiting for previous sound to finish
  audio.play();
  return;
}

// This function plays the beat at the default 120bpm
function play_beat() {

  // Prevents error caused by spamming the play button (multiple intervals going at one time)
  clearInterval(interval);

  // Default 120 bpm
  let bpm = 120;

  // Calculation to turn bpm into time between beats (tbb) in milliseconds
  const milli_in_1min = 60000;
  let useless = bpm / milli_in_1min;
  const tbb = 1 / useless;

  let beat = 0; // beat variable will always be 1-8 (except when being initialized) 

  let audio = document.querySelector("audio");
  interval = setInterval(() => {
    if (beat == 8) {
      beat = 1; // Beat will reset to 1
    } else {
      beat++; // Increment beat
    }
    const id = 'note' + beat;
    const noteBtn = document.getElementById(id);
    const value = noteBtn.value;
    if (value == 1) {
      audio.currentTime = 0;
      audio.play();
    }
  }, tbb); // Set the interval to time between beats (tbb)
  return;
}

// This function stops the beat
function stop_beat() {
  clearInterval(interval);
  return;
}

// This function toggles a note button on (orange) or off (gray)
function note_toggle(id) {

  // Get background color of a note button
  // The 'background' variable has no value when you click a specific
  // note button for the first time, because that 'id' has no styling.
  // The following if-else block was written to handle every case!
  let background = document.getElementById(id).style.backgroundColor;

  // Changes background color of a note button
  // Also changes the Boolean value associated with that note button
  if(background == "rgb(255, 130, 67)") { // If the note button is orange...
    document.getElementById(id).style.backgroundColor="rgb(84, 84, 84)"; // Make it gray
    document.getElementById(id).value = 0; // The note is now INACTIVE for playback
  } else {
    document.getElementById(id).style.backgroundColor="rgb(255, 130, 67)"; // Make it orange
    document.getElementById(id).value = 1; // The note is now ACTIVE for playback
  }
  return;
}