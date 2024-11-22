// Get the subject_id from the URL
let urlParams = new URLSearchParams(window.location.search);
let subject_id_to_record = urlParams.get("subject_id");

// Select DOM elements
let timeDisplay = document.getElementById("time");
let pauseButton = document.getElementById("pauseButton");

if (subject_id_to_record) {
    console.log(`Subject ID: ${subject_id_to_record}`);
} else {
    console.error("No subject ID found in the URL.");
}

// Remaining logic remains the same

// Timer variables
let timerInterval = null;
let elapsedSeconds = 0;

// Format time as HH:MM:SS
function formatTime(seconds) {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        elapsedSeconds++;
        timeDisplay.textContent = formatTime(elapsedSeconds);
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Save the elapsed time to Firestore
function saveTimeToFirestore() {
    return new Promise((resolve, reject) => {
        const subjectRef = db.collection("subjects").doc(subject_id_to_record);

        if (subject_id_to_record) {
            subjectRef
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        const currentTotalTime = doc.data().total_subject_time;
                        const [hours, minutes, seconds] = currentTotalTime
                            .split(":")
                            .map(Number);
                        const totalSeconds =
                            hours * 3600 +
                            minutes * 60 +
                            seconds +
                            elapsedSeconds;

                        return subjectRef.update({
                            total_subject_time: formatTime(totalSeconds),
                        });
                    } else {
                        console.error("No such document!");
                        reject("No such document!");
                    }
                })
                .then(() => {
                    console.log("Total subject time updated successfully.");
                    resolve(); // Resolve after Firestore update
                })
                .catch((error) => {
                    console.error("Error updating document:", error);
                    reject(error); // Reject on error
                });
        } else {
            console.error("No subject ID provided.");
            reject("No subject ID provided.");
        }
    });
}

// Add event listeners for stop and go back buttons
pauseButton.addEventListener("click", async () => {
    stopTimer();
    await saveTimeToFirestore();
    window.location.href = "home.html";
});

goBack.addEventListener("click", async () => {
    stopTimer();
    await saveTimeToFirestore();
    window.location.href = "home.html";
});

// Initialize the display
timeDisplay.textContent = formatTime(elapsedSeconds);
startTimer();
