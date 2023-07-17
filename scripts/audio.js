// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------
import { bpm, lock_grid, lock_icon, playing_beat, header_tempo } from './menu_bar.js';
import {  } from './instrument_channels.js';

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

// Global variables for audio recording
let audioContxRec = null;
let currentlyRecording = false;
let endOfLoopRecording = false;

// ----------------------------------------------------------------------------
// BEAT PLAYBACK HANDLING -----------------------------------------------------
// ----------------------------------------------------------------------------

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
    audioContx = new AudioContext(); //(window.AudioContext || window.webkitAudioContext)();
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
  endOfLoopRecording = false;
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
    if( currentlyRecording ){ // if we are currently recording and have reached end of loop -> STOP & SAVE
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

// ----------------------------------------------------------------------------
// AUDIO PANNING --------------------------------------------------------------
// ----------------------------------------------------------------------------

function panAudio(){
  const panner = new audioContext.PannerNode();

  return;
}

// Get the volume elements
const volumeButton = document.querySelector(".instrument-channel-volume-button");
const volumePopup = document.querySelector(".volume-popup");
const volumeID = document.getElementById("volume-text-1");

let showVPopupTimeout;

// Function to update volume popup position
function updateVolumePopupPosition(event) {
  const x = event.clientX + 25;
  const y = event.clientY - 25;
  volumePopup.style.left = `${x}px`;
  volumePopup.style.top = `${y}px`;
}

// Function to update volume popup value
function updateVolumePopupValue() {
  const volumeValue = volumeID.value;
  volumePopup.textContent = volumeValue.toString();
}

function handleMouseEnterVolume(event) {
  showVPopupTimeout = setTimeout(() => {
    updateVolumePopupPosition(event);
    updateVolumePopupValue();
    volumePopup.style.opacity = 1;
  }, 700);
}

function handleMouseLeaveVolume() {
  volumePopup.style.opacity = 0;
}

function handleMouseMoveVolume(event) {
  updateVolumePopupPosition(event);
}

// ----------------------------------------------------------------------------
// AUDIO DOWNLOAD HANDLING ----------------------------------------------------
// ----------------------------------------------------------------------------

// Creates header_download event listener
const header_download = document.querySelector(".header-download");

// For header_download, adds event listener for "click"
header_download.addEventListener("click", startRecording);

// webkitURL is deprecated
URL = window.URL || window.webkitURL;

var input; // MediaStreamAudioSourceNode for recording
var rec; // Recorder.js object
var recordingBlob; // Blob that stores the .wav file produced by the recording

// Create an AudioContext
var AudioContext = window.AudioContext;
var audioContext; // audioContext helps with recording process

// This function begins recording when user clicks header download button
function startRecording() {
  currentlyRecording = true;
  // Disable play and download buttons until recording is finished to prevent overly long recordings
  disableHeaderButtons(true);

  if (audioContx == null) {
    audioContx = new AudioContext;
  }

  // TODO Generalize to 8 channels
  const audioNode = audioContx.createMediaElementSource(document.querySelector(`audio`));
  audioNode.connect(audioContx.destination);

  // Create Recorder object to record stereo sound (2 channels)
  rec = new Recorder(audioNode, {numChannels: 2});

  // Begin recording process
  rec.record();
  console.log("Recording started.");
  play_beat();
  return;
}

// An ivisible link that will be "clicked" to trigger the audio file 
// download when the download render is done
const downloadLink = document.querySelector(".header-download-link")
downloadLink.addEventListener("click", downloadBlob)

// Export the recording from Recorder.js and download the .WAV file
function downloadRecording() {
  rec.exportWAV(takeExportedWAVBlob);
  rec.clear();
  // Everything is recorded and downloaded so the user can safely start another download
  disableHeaderButtons(false);
  return;
}

function takeExportedWAVBlob(blob) {
  if (!blob) {
    console.log("export failed");
    return;
  }
  recordingBlob = blob;
  downloadLink.click();
}

function downloadBlob(){
  const href = URL.createObjectURL(recordingBlob);
  downloadLink.setAttribute("href", href);
}

// Disables or enables all header buttons: used for preventing changes during audio recording
function disableHeaderButtons(bool) {
  header_play.disabled = bool;
  header_download.disabled = bool;
  header_stop.disabled = bool;
  header_tempo.disabled = bool;
}