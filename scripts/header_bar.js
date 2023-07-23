// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

let bpm = 120; // Default 120 bpm
let lock_grid = false; // Locks note grid during playback
let lock_icons = document.querySelectorAll(".fa-lock");
let interval; // Interval for playing the beat
let playing_beat = false; // Only allow header play button once

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
let source = [];
let panner = [];
let audioNodeMerger;
let pannerOption = {pan: 0};

// Global variables for audio recording
let audioContxRec = null;
let currentlyRecording = false;
let endOfLoopRecording = false;

// ----------------------------------------------------------------------------
// EVENT LISTENERS FOR ALL BUTTONS --------------------------------------------
// ----------------------------------------------------------------------------

// Header tempo button
const header_tempo = document.querySelector(".header-tempo");
header_tempo.addEventListener("click", update_header_tempo);

// Header play button
const header_play = document.querySelector(".header-play");
header_play.addEventListener("click", play_beat);

// Header stop button
const header_stop = document.querySelector(".header-stop");
header_stop.addEventListener("click", stop_beat);

// Header download button
const header_download = document.querySelector(".header-download");
header_download.addEventListener("click", startRecording);

// An invisible link that will be "clicked" to trigger the audio file 
// download when the download render is done
const downloadLink = document.querySelector(".header-download-link");
downloadLink.addEventListener("click", downloadBlob);

// Note buttons
const notes = document.querySelectorAll(".instrument-note-button");
notes.forEach((button) => {
  button.addEventListener("click", note_toggle);
});

// ----------------------------------------------------------------------------
// SETUP FOR AUDIO CONTEXT AND NODES ------------------------------------------
// ----------------------------------------------------------------------------

var AudioContext = window.AudioContext;
const numInstruments = 8;

function createAudioContx(){
  if (audioContx == null) {
    audioContx = new AudioContext();
    connectAudioToAudioContext();
  }
  return;
}

function connectAudioToAudioContext() {
  audioContx.destination = BaseAudioContext.destination;
  if (audioNodeMerger == null) {
    audioNodeMerger = audioContx.createChannelMerger(numInstruments);
    for (var iChannelIndex = 1; iChannelIndex < numInstruments + 1; iChannelIndex++) {
      const audioNode = audioContx.createMediaElementSource(document.querySelector(`audio[sound="${iChannelIndex}"]`));
      const nodePanner = new StereoPannerNode(audioContx, {pan: 0});
      const stereoSplitter = audioContx.createChannelSplitter(2);

      // Connect directly to the panner node because we manage volume in the HTML elements
      audioNode.connect(nodePanner);
      nodePanner.connect(stereoSplitter);
      stereoSplitter.connect(audioNodeMerger, 0, 0);
      stereoSplitter.connect(audioNodeMerger, 1, 1);

      panner[iChannelIndex] = nodePanner;
    } 
    
    audioNodeMerger.connect(audioContx.destination);
  }
  return audioNodeMerger;
}


// ----------------------------------------------------------------------------
// HEADER TEMPO BUTTON --------------------------------------------------------
// ----------------------------------------------------------------------------

function update_header_tempo() {

  // Keep track of tempo text box cursor style
  const tempo_text = document.querySelector(".header-tempo");

  // Keep track of original tempo value
  let tempo_value_original = tempo_text.value;

  // Make the cursor appear for visual feedback, highlight button
  tempo_text.style.caretColor = "white";
  tempo_text.style.backgroundColor = "#7621C5";

  // Pressing enter after typing new value will update tempo
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

  // Clicking outside text after typing new value updates tempo
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
}
// ----------------------------------------------------------------------------
// PAN AUDIO  -----------------------------------------------------------------
// ----------------------------------------------------------------------------
function panAudio(){
  for(let i = 1; i < numInstruments+1; i++) {
    const angle = Number(0.01*currentAngle[i]);
    // console.log("angle val: " , angle);
    panner[i].pan.value = angle;
    // console.log("pan value: " , panner[1].pan.value);
  }
  return;
 }
 

// Gets current tempo value for snapshot download
function get_tempo_value() {
  return document.querySelector(".header-tempo").value;
}

// Sets new tempo value for snapshot upload
function set_tempo_value(value) {
  stop_beat();
  // Tempo value already within accepted range
  document.querySelector(".header-tempo").value = value;
  bpm = value;
}

// ----------------------------------------------------------------------------
// HEADER PLAY BUTTON ---------------------------------------------------------
// ----------------------------------------------------------------------------

// This function plays the beat at the project's bpm
function play_beat() {

  // Only allow header play button to be pressed once
  if (playing_beat == true) {
    return;
  }

  // Header play button is now playing beat
  playing_beat = true;

  // Lock the note grid during playback
  lock_grid = true;

  // Shows the instrument channel lock icon during playback
  for (var i = 0; i < lock_icons.length; ++i) {
    lock_icons[i].classList.add("show-instrument-channel-lock");
  }

  // Prevents errors from spamming header-play button
  // (multiple intervals at a time)
  clearInterval(interval);

  // Calculation to turn bpm into time between beats (tbb) in milliseconds
  let tbb = (60 / bpm) * 1000;

  beatsPlaying = true;
  beat = 0; // Restart at beginning of loop. Beat variable will always be 1-8
            // (except when being initialized)

  // Add Audio Context for scheduling
  //if (audioContx == null) {
    //audioContx = new AudioContext();
  // }
  createAudioContx(); 

  nextNoteTime = audioContx.currentTime + 0.05;

  // Run scheduler and play beats
  interval = setInterval(() => runSchedulerAndBeat(), scheduleFreq);
}

// Play highlighted notes at scheduled time with current audio, increment beats
function playNextBeat() {

  // Advance current note and time by a quarter note (crotchet if you're posh)
  var secondsPerBeat = 60.0 / bpm; // Get length of beat
  nextNoteTime += secondsPerBeat; // Add beat length to last beat time

  // ***Needs to be updated for different audios***
  let audio = document.querySelectorAll('audio');
  panAudio();

  if (beat == beatsInLoop) {
    if(currentlyRecording) { // if we are currently recording and reached end of loop, STOP & SAVE
      endOfLoopRecording = true;
      //stopRecording();
      stop_beat();
      rec.stop(); // stop recording 
      endOfLoopRecording = false;
      downloadRecording();  
      currentlyRecording = false;
      return; // exit before next beat plays
    }
    beat = 1; // Beat will reset to 1
  } else {
    beat++; // Increment beat
  } 

  // Store all 8 channel note ids into an array
  const ids = [];
  for (let i = 1; i <= 8; i += 1) {
    ids.push(`note${beat}-${i}`);
  }

  const inb = ids.map(id => document.getElementById(id));
  const values = inb.map(inb => inb.value);

  for (let i = 0; i < 8; i += 1) {
    if (values[i] == 1) {
      audio[i].currentTime = 0;
      audio[i].play();
      highlightElemBackground(inb[i], "#D60049");
    } else {
      highlightElemBackground(inb[i], "#474747");
    }
  }
}

// Schedule beat at time now for immediate playback 
function scheduleBeat(beatNumber, time) {

  // Push beat onto queue, even if played or not
  queueBeats.push({ note: beatNumber, time: time });
  
}

// This function schedules beats for minimal latency, calls for beat to play
function runSchedulerAndBeat() {

  // While there are notes that will need to play before the next interval,
  // schedule those notes and advance pointer  
  while (nextNoteTime < audioContx.currentTime + scheduleTimeBuf ) {
    scheduleBeat(beat, nextNoteTime); // Schedule beat for immediate playback 
    playNextBeat(); // Play beat at scheduled time (now)
  }
}

// ----------------------------------------------------------------------------
// HEADER STOP BUTTON ---------------------------------------------------------
// ----------------------------------------------------------------------------

function stop_beat() {

  // Header play button is not playing beat
  playing_beat = false;

  // Unlock the note grid after playback
  lock_grid = false;

  // Removes the instrument channel lock icons after playback
  for (var i = 0; i < lock_icons.length; ++i) {
    lock_icons[i].classList.remove("show-instrument-channel-lock");
  }

  beatsPlaying = false;
  endOfLoopRecording = false;
  beat = 1;
  clearInterval(interval);
}

// ----------------------------------------------------------------------------
// HEADER DOWNLOAD BUTTON -----------------------------------------------------
// ----------------------------------------------------------------------------

URL = window.URL;
var rec; // Recorder.js object
var recordingBlob; // Blob that stores the .wav file produced by the recording

function startRecording() {
  currentlyRecording = true;
  // Disable play and download buttons until recording is finished to prevent overly long recordings
  disableHeaderButtons(true);

  createAudioContx();

  var mergeNode = connectAudioToAudioContext();

  // Create Recorder object to record mono sound (1 channel)
  rec = new Recorder(mergeNode, {numChannels: 1});

  rec.record();
  play_beat();
}

// Export the recording from Recorder.js and download the .WAV file
function downloadRecording() {
  rec.exportWAV(takeExportedWAVBlob);
  rec.clear();
  // Everything is recorded and downloaded so the user can safely start another download
  disableHeaderButtons(false);
}

function takeExportedWAVBlob(blob) {
  if (!blob) {
    console.log("Export failed.");
    return;
  }
  recordingBlob = blob;
  downloadLink.click();
}

function downloadBlob(){
  const href = URL.createObjectURL(recordingBlob);
  downloadLink.setAttribute("href", href);
}

// Disables or enables header buttons: prevents changes during audio recording
function disableHeaderButtons(bool) {
  header_play.disabled = bool;
  header_download.disabled = bool;
  header_stop.disabled = bool;
  header_tempo.disabled = bool;
}

// ----------------------------------------------------------------------------
// NOTE GRID ------------------------------------------------------------------
// ----------------------------------------------------------------------------

// This function toggles an instrument note button on (orange) or off (gray)
function note_toggle(e) {

  var id;

  if (e.type == "click") {
    id = e.target.getAttribute('id'); // Apply clicked note button's id
  } else {
    id = e; // Note was toggled by snapshot load
  }

  // Don't allow notes to be toggled during beat playback
  if (lock_grid == true) {
    return;
  }

  // Get background color of an instrument note button
  // The 'background' variable has no value when you click a specific
  // note button for the first time, because that 'id' has no styling.
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
}