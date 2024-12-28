// Get the subject_id from the URL
let urlParams = new URLSearchParams(window.location.search);
let subject_id_to_record = urlParams.get("subject_id");
let subject_name = urlParams.get("subject_name");

// Select DOM elements
let timeDisplay = document.getElementById("time");
let pauseButton = document.getElementById("pauseButton");
let goBack = document.getElementById("goBack");

let subjectNameUnderneath = document.getElementById("subjectNameUnderneath");
subjectNameUnderneath.innerText = subject_name;
let totalSubjectTimeUnderneath = document.getElementById(
    "totalSubjectTimeUnderneath"
);
let totalDailyTimeUnderneath = document.getElementById(
    "totalDailyTimeUnderneath"
);

// Timer variables
let timerInterval = null;
let elapsedSeconds = 0;
let elapsedTodaySeconds = 0; // Track total daily elapsed time

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
        totalSubjectTimeUnderneath.textContent = formatTime(elapsedSeconds);

        // Update the daily total dynamically
        const updatedTodaySeconds = elapsedTodaySeconds + elapsedSeconds;
        totalDailyTimeUnderneath.textContent = formatTime(updatedTodaySeconds);
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Fetch and update daily total time
async function fetchDailyTotalTime() {
    const db = firebase.firestore();
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Midnight of today

    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            console.error("No user is logged in.");
            return;
        }

        const userId = user.uid; // Get the current user's UID

        // Query the logs collection for today's total time
        try {
            const logsQuery = await db
                .collection("logs")
                .where("user_id", "==", userId)
                .where(
                    "start",
                    ">=",
                    firebase.firestore.Timestamp.fromDate(currentDate)
                )
                .get();

            elapsedTodaySeconds = 0;

            logsQuery.forEach((logDoc) => {
                const logData = logDoc.data();
                const start = logData.start.toDate();
                const end = logData.end.toDate();
                elapsedTodaySeconds += (end - start) / 1000; // Convert duration to seconds
            });

            totalDailyTimeUnderneath.textContent =
                formatTime(elapsedTodaySeconds);
        } catch (error) {
            console.error("Error fetching daily total time:", error);
            elapsedTodaySeconds = 0; // Default to 0 in case of error
            totalDailyTimeUnderneath.textContent =
                formatTime(elapsedTodaySeconds);
        }
    });
}

// Save the elapsed time to Firestore
// Save the elapsed time to Firestore
async function saveStudyLog(subjectId, elapsedSeconds) {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (!user) {
                console.error("No user is logged in.");
                reject("No user is logged in.");
                return;
            }

            const userId = user.uid; // Get the current user's UID
            const db = firebase.firestore();

            const currentTimestamp = new Date();
            const startTime = new Date(
                currentTimestamp.getTime() - elapsedSeconds * 1000
            );

            try {
                // Save the log entry to the logs collection
                await db.collection("logs").add({
                    start: firebase.firestore.Timestamp.fromDate(startTime),
                    end: firebase.firestore.Timestamp.fromDate(currentTimestamp),
                    subject_id: subjectId,
                    user_id: userId,
                });
                resolve();
            } catch (error) {
                console.error("Error saving study log:", error);
                reject(error);
            }
        });
    });
}

// Format elapsed seconds as "Xh Ym Zs"
function formatElapsedTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${secs}s logged`;
}

function handleStopAndNavigate() {
    stopTimer();
    
    saveStudyLog(subject_id_to_record, elapsedSeconds)
        .then(() => {
            localStorage.setItem("subjectName", subject_name);
            localStorage.setItem("elapsedSeconds", formatElapsedTime(elapsedSeconds)); // 포맷된 시간 저장
            window.location.href = "home.html";
        })
        .catch((error) => {
            console.error("Failed to save log:", error);
        });
}

// Add event listeners for stop and go back buttons
pauseButton.addEventListener("click", handleStopAndNavigate);
goBack.addEventListener("click", handleStopAndNavigate);

// Initialize the display
timeDisplay.textContent = formatTime(elapsedSeconds);
totalSubjectTimeUnderneath.textContent = formatTime(elapsedSeconds);

// Fetch and display total daily time
fetchDailyTotalTime();

// Start the timer
startTimer();
