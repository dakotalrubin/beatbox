// This function plays an audio element for an associated instrument-channel-button "click" event.
function playSound(e) {
  const button = e.target;
  const audio = button.querySelector("audio");

  // Exits function if instrument-channel-button clicked has no audio (unnecessary as of right now)
  if (!audio) {
    return;
  }
}

// Creates node list of intsrument-channel-buttons
const buttons = document.querySelectorAll(".instrument-channel-button");
// For each intsrument-channel-button, adds event listener for "click"
buttons.forEach((button) => {
  button.addEventListener("click", playSound);
});