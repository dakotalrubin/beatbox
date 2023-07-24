// ----------------------------------------------------------------------------
// GLOBAL VARIABLES -----------------------------------------------------------
// ----------------------------------------------------------------------------

// Index in the knob ID string that has the instrument ID
const knobsIndexOfId = 32;

// Arrays for the states of all the panning knobs
// Index 0 is null because instrument numbering starts at 1
let isDragging = [null, false, false, false, false, false, false, false, false];
let startAngle = [null, 0, 0, 0, 0, 0, 0, 0, 0];
let startMouseX = [null, 0, 0, 0, 0, 0, 0, 0, 0];
let currentAngle = [null, 0, 0, 0, 0, 0, 0, 0, 0];

// How fast the knob turns
const sensitivity = 1.2;
let showPPopupTimeout;

// ----------------------------------------------------------------------------
// EVENT LISTENERS  -----------------------------------------------------------
// ----------------------------------------------------------------------------

const pkbs = document.querySelectorAll(".instrument-channel-panning-knob");

pkbs.forEach((panningKnob) => {
  // Add event listener for double click on the panning knob
  panningKnob.addEventListener("dblclick", handleDoubleClickPanning);

  // Add event listener for the panning knob button
  panningKnob.addEventListener("mousedown", handleMouseDownPanning);
  panningKnob.addEventListener("mouseenter", handleMouseEnterPanning);
  panningKnob.addEventListener("mouseleave", handleMouseLeavePanning);
});

document.addEventListener("mousemove", handleMouseMovePanning);
document.addEventListener("mouseup", handleMouseUpPanning);

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL PANNING KNOB FUNCTIONALITY ------------------------------
// ----------------------------------------------------------------------------

// Handles when the user clicks on a panning knob, initializing necessary values so it can be turned
function handleMouseDownPanning(event) {
    let id = event.target.id[knobsIndexOfId];
    let panningKnob = document.getElementById("instrument-channel-panning-knob-" + id);
    event.preventDefault();
    isDragging[id] = true;
    startAngle[id] = getCurrentRotationAngle(id);
    startMouseX[id] = event.clientX;
    currentAngle[id] = startAngle[id];
    panningKnob.classList.add("active"); 
    clearTimeout(showPPopupTimeout);
  }

// Handles checking if the user is dragging the panning knob when the mouse is moved, and updates the knob accordingly
function handleMouseMovePanning(event) {

    if (event.target.className != "instrument-channel-panning-knob"){
        id = clickedPanningKnob();
        if (id == null) return;
    }
    else { 
        id = event.target.id[knobsIndexOfId];
    }

    if (isDragging[id]) {
        updateKnobTicPosition(event, id);
    }

    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    panningPopup.style.opacity = 0;
    updatePanningPopUpPosition(event);
    panningPopup.style.opacity = 1;
}

// Runs when the user stops holding the mouse button, and if the user had been dragging a knob, 
// resetting the knob to not move anymore until clicked again
function handleMouseUpPanning(event) {
    let id = clickedPanningKnob();
    if (id == null) return;
  
    let panningKnob = document.getElementById("instrument-channel-panning-knob-" + id);
    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    isDragging[id] = false;
    currentAngle[id] = clampRotationAngle(currentAngle)[id]; 
    rotateTic(id, currentAngle[id]);
    panningPopup.style.opacity = 0;
    panningKnob.classList.remove("active");

  }

// Function to get the current rotation angle of the tic
function getCurrentRotationAngle(id) {
    let panningKnobTic = document.getElementById("instrument-channel-panning-tic-" + id);
    const transformStyle = window.getComputedStyle(panningKnobTic).getPropertyValue("transform");
    const matrix = transformStyle.match(/^matrix\((.+)\)$/);
    if (matrix) {
        const matrixValues = matrix[1].split(",");
        if (matrixValues.length === 6) {
            return Math.atan2(parseFloat(matrixValues[1]), parseFloat(matrixValues[0])) * (180 / Math.PI);
        }
    }
    return 0;
}

// Function to clamp the rotation angle within the specified range
// (makes no sense for a panning knob to fully rotate 360 deg)
function clampRotationAngle(angle) {
  const minAngle = -100;
  const maxAngle = 100;
  if (angle < minAngle) {
    return minAngle;
  } else if (angle > maxAngle) {
    return maxAngle;
  }
  return angle;
}

// Function to rotate the tic to a specific angle
function rotateTic(id, angle) {
    let panningKnobTic = document.getElementById("instrument-channel-panning-tic-" + id);
    panningKnobTic.style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

// Resets the knob's value to zero when the user double clicks it
function handleDoubleClickPanning(event) {
    let id = event.target.id[knobsIndexOfId];
    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    panningPopup.style.opacity = 1;
    event.preventDefault(); 
    resetTicAngle(id);
    const angle = getCurrentRotationAngle(id);
    updatePanningPopUpValue(id, angle);
    showPPopupTimeout = setTimeout(() => {
    panningPopup.style.opacity = 0;
    }, 550);
}

// Function to reset the tic angle to 0
function resetTicAngle(id) {
  currentAngle[id] = 0;
  rotateTic(id, currentAngle[id]);
}

// Places the pannning popup to be in the correct position relative to the user's cursor
// (helper of handleMouseMovePanning)
function updatePanningPopUpPosition(event) {
    let id = clickedPanningKnob();
    if (id == null) return;
    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    const x = event.clientX + 20;
    const y = event.clientY - 20;
    panningPopup.style.left = `${x}px`;
    panningPopup.style.top = `${y}px`;
}

// Updates the knob's rotation as the user drags it
// (helper of handleMouseMovePanning)
function updateKnobTicPosition(event, id) {
    const mouseX = event.clientX;
    const angleChange = (mouseX - startMouseX[id]) * sensitivity;
    const newAngle = startAngle[id] + angleChange;
    const clampedAngle = clampRotationAngle(newAngle); 
    currentAngle[id] = clampedAngle;
    rotateTic(id, currentAngle[id]);
    updatePanningPopUpValue(id, currentAngle[id]);
    updatePanningPopUpPosition(event);
}

// Manages the popup displaying the panning knob's value when the user starts hovering over the knob
function handleMouseEnterPanning(event) {
  let id = event.target.id[knobsIndexOfId];
  let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
  const x = event.clientX + 20;
  const y = event.clientY - 20;
  panningPopup.style.left = `${x}px`;
  panningPopup.style.top = `${y}px`;

  if (!isDragging[id]) {
    showPPopupTimeout = setTimeout(() => {
      panningPopup.style.opacity = 1;
      const angle = getCurrentRotationAngle(id);
      updatePanningPopUpValue(id, angle);
    }, 700); 
  }
}

// Manages the popup displaying the panning knob's value when the user stops hovering over the knob
function handleMouseLeavePanning(event) {
  let id = event.target.id[knobsIndexOfId];
  let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
  clearTimeout(showPPopupTimeout);
  panningPopup.style.opacity = 0;
}

// Applies the text describing the panning value to the panning button's popup 
function updatePanningPopUpValue(id, angle) {
    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    panningPopup.textContent = "Panning: " + Math.round(angle).toString();
  }

// Returns which panning knob is currently clicked / dragged by the user to adjust panning. 
// Returns null if the user is not interacting with a panning knob
function clickedPanningKnob() {
    for (let id = 1; id <= numInstruments; id++) {
        if (isDragging[id]) return id; 
    }
    return null;
}

// ----------------------------------------------------------------------------
// INSTRUMENT CHANNEL PANNING KNOB GETTER AND SETTER --------------------------
// ----------------------------------------------------------------------------

// Gets current instrument channel panning values for snapshot download
function get_instrument_channel_panning_knobs() {
  let instrument_channel_panning_values = [];
  let pannings = document.querySelectorAll(".panning-popup");
  for (let i = 0; i < 8; i++) {
    let panning_value = pannings[i].innerText.split(" "); // Split "Panning: "
    instrument_channel_panning_values.push(panning_value[1]);
  }
  return instrument_channel_panning_values;
}

// Sets new instrument channel panning values for snapshot upload
function set_instrument_channel_panning_knob(index, value) {
  document.getElementById(`instrument-channel-panning-popup-${index}`).innerText = "Panning: " + value;
  currentAngle[index] = value; // Applies the actual panning value change
  rotateTic(index, value); // Updates panning knob display
}