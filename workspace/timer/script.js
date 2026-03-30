const timeDisplay = document.getElementById("time-display");
const totalDisplay = document.getElementById("total-display");
const statusPill = document.getElementById("status-pill");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");
const presetButtons = document.querySelectorAll(".preset-button");

let totalSeconds = 0;
let remainingSeconds = 0;
let timerId = null;
let endTime = null;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, secs].map((value) => String(value).padStart(2, "0")).join(":");
  }

  return [minutes, secs].map((value) => String(value).padStart(2, "0")).join(":");
}

function updateDisplays() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  totalDisplay.textContent = formatTime(totalSeconds);
}

function updateStatus(label, running = false) {
  statusPill.textContent = label;
  statusPill.style.color = running ? "var(--accent)" : "var(--success)";
  statusPill.style.background = running ? "rgba(255, 184, 77, 0.16)" : "rgba(123, 224, 184, 0.14)";
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  endTime = null;
}

function tick() {
  if (!endTime) {
    return;
  }

  const nextRemaining = Math.max(0, (endTime - Date.now()) / 1000);
  remainingSeconds = nextRemaining;
  updateDisplays();

  if (nextRemaining <= 0) {
    stopTimer();
    totalSeconds = 0;
    remainingSeconds = 0;
    updateDisplays();
    updateStatus("Finished");
  }
}

function addTime(secondsToAdd) {
  totalSeconds += secondsToAdd;

  if (timerId && endTime) {
    endTime += secondsToAdd * 1000;
    remainingSeconds = Math.max(0, (endTime - Date.now()) / 1000);
  } else {
    remainingSeconds += secondsToAdd;
  }

  updateDisplays();

  if (!timerId) {
    updateStatus("Ready");
  }
}

function startTimer() {
  if (timerId || remainingSeconds <= 0) {
    return;
  }

  endTime = Date.now() + remainingSeconds * 1000;
  timerId = window.setInterval(tick, 100);
  tick();
  updateStatus("Running", true);
}

function pauseTimer() {
  if (!timerId) {
    return;
  }

  tick();
  stopTimer();
  totalSeconds = Math.ceil(remainingSeconds);
  remainingSeconds = totalSeconds;
  updateDisplays();
  updateStatus("Paused");
}

function resetTimer() {
  stopTimer();
  totalSeconds = 0;
  remainingSeconds = 0;
  updateDisplays();
  updateStatus("Ready");
}

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const seconds = Number(button.dataset.seconds);
    addTime(seconds);
  });
});

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

updateDisplays();
updateStatus("Ready");
