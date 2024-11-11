let timerInterval;
let isTimerRunning = false;
let totalTime = 0;  // total time in seconds

document.getElementById("toggleButton").addEventListener("click", function () {
    const icon = this.querySelector("i");

    if (!isTimerRunning) {
        // Start the timer
        icon.classList.replace("fa-play", "fa-pause");
        isTimerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
    } else {
        // Pause the timer
        icon.classList.replace("fa-pause", "fa-play");
        isTimerRunning = false;
        clearInterval(timerInterval);
    }
});

function updateTimer() {
    totalTime++;
    const hours = String(Math.floor(totalTime / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalTime % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalTime % 60).padStart(2, "0");

    document.getElementById("time").innerText = `${hours}:${minutes}:${seconds}`;
}
