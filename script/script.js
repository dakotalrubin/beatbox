// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

let interval; // Interval for playing the beat
let bpm = 120; // Default 120 bpm
let lock_grid = false; // Locks note grid during playback
let popup = document.getElementById("popup"); // Toggles popup window
let lock_icon = document.getElementById("lock-icon"); // Toggles lock icon
let playing_beat = false; // Only allow header play button once
let volume_value_original; // Recovers original volume value

// Global variables for beat playback and latency maintenance
let beatsInLoop = 8;
let nextNoteTime = 0.0;
let beat = 0;
let queueBeats = [];
let audioContx = null;
let scheduleTimeBuf = 0.001;
let beatsPlaying = false;
let scheduleFreq = 25;
let trackVolume = 1; // To be modified when changing volume

// ----------------------------------------------------------------------------
// HEADER TEMPO BUTTON HANDLING -----------------------------------------------
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
      var regex = /^\d*\-*\.?\d*$/;
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
    var regex = /^\d*\-*\.?\d*$/;
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
// HEADER PLAY BUTTON HANDLING ------------------------------------------------
// ----------------------------------------------------------------------------

// Creates header_play event listener
const header_play = document.querySelector(".header-play");
// for header_play, adds event listener for "click"
header_play.addEventListener("click", play_beat);

// ----------------------------------------------------------------------------
// HEADER STOP BUTTON HANDLING ------------------------------------------------
// ----------------------------------------------------------------------------

// Creates header_stop event listener
const header_stop = document.querySelector(".header-stop");
// for header_stop, adds event listener for "click"
header_stop.addEventListener("click", stop_beat);

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL HANDLING ------------------------------------------------
// ----------------------------------------------------------------------------

// Creates node list (icpbs) of instrument-channel-play-buttons
const icpbs = document.querySelectorAll(".instrument-channel-play-button");

// For each instrument-channel-play-button, adds event listener for "click"
icpbs.forEach((button) => {
  button.addEventListener("click", play_icpb_sound);
});

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
      var regex = /^\d*\-*\.?\d*$/;
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
    var regex = /^\d*\-*\.?\d*$/;
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
// AUDIO PLAYBACK HANDLING ----------------------------------------------------
// ----------------------------------------------------------------------------

// This function plays the audio
// of the clicked instrument-channel-play-button (ICPB)
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

// This function plays the beat at the project's bpm
function play_beat() {

  // Only allow header play button once
  if (playing_beat == true) {
    return;
  }

  // Header play button is now playing beat
  playing_beat = true;

  // Lock the note grid during playback
  lock_grid = true;

  // Shows the instrument channel lock icon during playback
  lock_icon.classList.add("show-instrument-channel-lock");

  // Prevents errors from spamming header-play button
  // (multiple intervals at a time)
  clearInterval(interval);
  if (beatsPlaying) return; // May need to remove this once adding more tracks

  // Calculation to turn bpm into time between beats (tbb) in milliseconds
  let tbb = (60 / bpm) * 1000;

  beatsPlaying = true;
  beat = 0; // Restart at beginning of loop. Beat variable will always be 1-8
            // (except when being initialized)

  // Add Audio Context for scheduling
  if (audioContx == null) {
    audioContx = new (window.AudioContext || window.webkitAudioContext)();
  }

  nextNoteTime = audioContx.currentTime + 0.05;

  // Run scheduler and play beats
  interval = setInterval(() => runSchedulerAndBeat(), scheduleFreq );

  return;
}

// This function stops the beat and resets to the beginning
function stop_beat() {

  // Header play button is not playing beat
  playing_beat = false;

  // Unlock the note grid after playback
  lock_grid = false;

  // Removes the instrument channel lock icon after playback
  lock_icon.classList.remove("show-instrument-channel-lock");

  beatsPlaying = false;
  beat = 1;
  clearInterval(interval);

  return;
}

// Play highlighted notes at scheduled time (now) with current audio
// and increment beats
function playNextBeat() {

  // Advance current note and time by a quarter note (crotchet if you're posh)
  var secondsPerBeat = 60.0 / bpm; // Get length of beat
  nextNoteTime += secondsPerBeat; // Add beat length to last beat time

  let audio = document.querySelector("audio");

  if (beat == beatsInLoop) {
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

  return;
}

// Schedule beat at time now for immediate playback 
function scheduleBeat(beatNumber, time) {

  // Push beat onto queue, even if played or not
  queueBeats.push({ note: beatNumber, time: time });
  const source = audioContx.createGain();
        
  source.gain.value = trackVolume;  
  source.gain.exponentialRampToValueAtTime(1, time + 0.001);
  source.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

  source.connect(audioContx.destination);
  return;
}

// This function schedules beats for minimal latency,
// then calls for beat to be played
function runSchedulerAndBeat() {

  // While there are notes that will need to play before the next interval,
  // schedule those notes and advance pointer
  while (nextNoteTime < audioContx.currentTime + scheduleTimeBuf ) {

    scheduleBeat(beat, nextNoteTime); // Schedule beat for immediate playback 
    playNextBeat(); // Play beat at scheduled time (now)
  }

  return;
}

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

function upload_audio(event){
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
        audioElem.src = "./sounds/kick.wav";
        audioElem.load();
        return;
      }
    });
    
  }

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL POPUP WINDOW HANDLING -----------------------------------
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
// NOTE GRID HANDLING ---------------------------------------------------------
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