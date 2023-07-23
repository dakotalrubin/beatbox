// ----------------------------------------------------------------------------
// EVENT LISTENERS FOR PANNING KNOB -------------------------------------------
// ----------------------------------------------------------------------------

const pkbs = document.querySelectorAll(".instrument-channel-panning-knob")

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
// INSTRUMENT CHANNEL PANNING KNOB --------------------------------------------
// ----------------------------------------------------------------------------

const knobsIndexOfId = 32;


// Get the panning elements
const panningKnobTic = document.querySelector(".instrument-channel-panning-tic");
const panningpopup = document.querySelector(".panning-popup");

let isDragging = [null, false, false, false, false, false, false, false, false];
let startAngle = [null, 0, 0, 0, 0, 0, 0, 0, 0];
let startMouseX = [null, 0, 0, 0, 0, 0, 0, 0, 0];
let currentAngle = [null, 0, 0, 0, 0, 0, 0, 0, 0];
const sensitivity = 1.2; 
let showPPopupTimeout;

// Function to handle mouse down event on the panning knob button
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

// Function to handle mouse move event
function handleMouseMovePanning(event) {
    // let id = event.target.id[knobsIndexofId];;
    if (event.target.className != "instrument-channel-panning-knob"){
      id = clickedPanningKnob();
      if (id == null) return;
    }
    else { 
      id = event.target.id[knobsIndexOfId];
      if (!isDragging[id]) return;
    }
    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    panningPopup.style.opacity = 0;
    const mouseX = event.clientX;
    const angleChange = (mouseX - startMouseX[id]) * sensitivity;
    const newAngle = startAngle[id] + angleChange;
    const clampedAngle = clampRotationAngle(newAngle); 
    currentAngle[id] = clampedAngle;
    rotateTic(id, currentAngle[id]);
    updatePanningPopUpValue(id, currentAngle[id]);
    updatePanningPopUpPosition(event);
    panningPopup.style.opacity = 1;
  }

// Function to handle mouse up event
function handleMouseUpPanning(event) {
    let id = clickedPanningKnob();
    if (id == null) return;
  
    let panningKnob = document.getElementById("instrument-channel-panning-knob-" + id);
    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    isDragging[id] = false;
    console.log(isDragging);
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

// Variable to keep track of double click
let doubleClickTimer = null;

// Function to handle double click event
function handleDoubleClickPanning(event) {
    let id = event.target.id[knobsIndexOfId];
    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    panningPopup.style.opacity = 1;
    event.preventDefault(); 
    clearTimeout(doubleClickTimer);
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

function updatePanningPopUpPosition(event) {
//   let id = event.target.id[knobsIndexOfId];
    let id = clickedPanningKnob();
    if (id == null) return;
    let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
    const x = event.clientX + 20;
    const y = event.clientY - 20;
    panningPopup.style.left = `${x}px`;
    panningPopup.style.top = `${y}px`;
}

function updatePanningPopUpValue(id, angle) {
  let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
  panningPopup.textContent = "Panning: " + Math.round(angle).toString();
}

function handleMouseEnterPanning(event) {
  let id = event.target.id[knobsIndexOfId];
  let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
  if (!isDragging[id]) {
    showPPopupTimeout = setTimeout(() => {
      panningPopup.style.opacity = 1;
      const angle = getCurrentRotationAngle(id);
      updatePanningPopUpValue(id, angle);
    }, 700); 
  }
}

function handleMouseLeavePanning(event) {
  let id = event.target.id[knobsIndexOfId];
  let panningPopup = document.getElementById("instrument-channel-panning-popup-" + id);
  clearTimeout(showPPopupTimeout);
  panningPopup.style.opacity = 0;
}

// Returns which panning knob is currently clicked / dragged by the user to adjust panning. 
// Returns null if the user is not interacting with a panning knob
function clickedPanningKnob() {
    for (let id = 1; id <= numInstruments; id++) {
        if (isDragging[id]) return id; 
    }
    return null;
}

// panningKnob.addEventListener("mousemove", (event) => {
//   let id = event.target.id[knobsIndexOfId];
//   updatePanningPopUpPosition(event);
//   const angle = getCurrentRotationAngle(id);
//   updatePanningPopUpValue(id, angle);
// });
