// Get the subject_id from the URL
let urlParams = new URLSearchParams(window.location.search);
let subject_id_to_record = urlParams.get("subject_id");
let subject_name = urlParams.get("subject_name"); // Pass the subject name if needed for days > studied_subjects

// Select DOM elements
let timeDisplay = document.getElementById("time");
let pauseButton = document.getElementById("pauseButton");
let goBack = document.getElementById("goBack");

if (subject_id_to_record) {
    console.log(`Subject ID: ${subject_id_to_record}`);
} else {
    console.error("No subject ID found in the URL.");
}

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
async function saveStudyLog(subjectId, subjectName, elapsedSeconds) {
    const db = firebase.firestore();

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const currentTimestamp = new Date();

    // Save to Subject-Centric Structure
    const subjectRef = db.collection("subjects").doc(subjectId);
    const dailyLogsRef = subjectRef.collection("daily_logs");

    // Query daily log by date
    const dailyLogQuery = await dailyLogsRef
        .where("date", "==", currentDate)
        .get();
    let dailyLogDoc;
    if (!dailyLogQuery.empty) {
        dailyLogDoc = dailyLogQuery.docs[0].ref;
    } else {
        // Create a new daily log if one doesn't exist
        dailyLogDoc = await dailyLogsRef.add({
            date: currentDate,
            total_time: 0, // Initialize with 0 seconds
        });
    }
    const timelineRefSubject = dailyLogDoc.collection("timelines");

    // Save to Day-Centric Structure
    const daysRef = db.collection("days");
    const dayQuery = await daysRef.where("date", "==", currentDate).get();
    let dayDoc;
    if (!dayQuery.empty) {
        dayDoc = dayQuery.docs[0].ref;
    } else {
        // Create a new day document if one doesn't exist
        dayDoc = await daysRef.add({
            date: currentDate,
            total_time: 0, // Initialize with 0 seconds
        });
    }
    const studiedSubjectsRef = dayDoc.collection("studied_subjects");
    const studiedSubjectQuery = await studiedSubjectsRef
        .where("name", "==", subjectName)
        .get();
    let studiedSubjectDoc;
    if (!studiedSubjectQuery.empty) {
        studiedSubjectDoc = studiedSubjectQuery.docs[0].ref;
    } else {
        // Create a new studied subject if one doesn't exist
        studiedSubjectDoc = await studiedSubjectsRef.add({
            name: subjectName,
            total_time: 0, // Initialize with 0 seconds
        });
    }
    const timelineRefDay = studiedSubjectDoc.collection("timelines");

    try {
        // Save to subject > daily_logs > timelines
        await timelineRefSubject.add({
            start: new Date(currentTimestamp.getTime() - elapsedSeconds * 1000),
            end: currentTimestamp,
        });

        // Update or set the total time for the day in subject > daily_logs
        const subjectDailyDocData = (await dailyLogDoc.get()).data();
        const currentTotal = subjectDailyDocData.total_time || 0;
        const updatedTotal = currentTotal + elapsedSeconds; // Add elapsed time in seconds
        await dailyLogDoc.update({
            total_time: updatedTotal,
        });

        // Save to days > studied_subjects > timelines
        await timelineRefDay.add({
            start: new Date(currentTimestamp.getTime() - elapsedSeconds * 1000),
            end: currentTimestamp,
        });

        // Update or set the total time for the subject in days > studied_subjects
        const studiedSubjectDocData = (await studiedSubjectDoc.get()).data();
        const currentSubjectTotal = studiedSubjectDocData.total_time || 0;
        const updatedSubjectTotal = currentSubjectTotal + elapsedSeconds;
        await studiedSubjectDoc.update({
            total_time: updatedSubjectTotal,
        });

        // Update the total daily time in days
        const dayDocData = (await dayDoc.get()).data();
        const currentDayTotal = dayDocData.total_time || 0;
        const updatedDayTotal = currentDayTotal + elapsedSeconds;
        await dayDoc.update({
            total_time: updatedDayTotal,
        });
    } catch (error) {
        console.error("Error saving study log:", error);
    }
}


// Add event listeners for stop and go back buttons
pauseButton.addEventListener("click", async () => {
    stopTimer();
    if (subject_id_to_record && subject_name) {
        await saveStudyLog(subject_id_to_record, subject_name, elapsedSeconds);
    }
    window.location.href = "home.html";
});

goBack.addEventListener("click", async () => {
    stopTimer();
    if (subject_id_to_record && subject_name) {
        await saveStudyLog(subject_id_to_record, subject_name, elapsedSeconds);
    }
    window.location.href = "home.html";
});

// Initialize the display
timeDisplay.textContent = formatTime(elapsedSeconds);
startTimer();
