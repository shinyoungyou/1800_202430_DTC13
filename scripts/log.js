// Get the subject_id from the URL
let urlParams = new URLSearchParams(window.location.search);
let subject_id_to_record = urlParams.get("subject_id");
let subject_name = urlParams.get("subject_name"); // Pass the subject name if needed for days > studied_subjects

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

        userEmail = await user.email; // Get the current user's email

        console.log(userEmail);

        // Query the days collection for today's date
        try {
            const daysRef = db.collection("days");
            const dayQuery = await daysRef
                .where("created_by", "==", userEmail)
                .where("date", "==", currentDate)
                .get();
            if (!dayQuery.empty) {
                const dayDoc = dayQuery.docs[0];
                const dayData = dayDoc.data();
                // Get the total_time field from today's document
                elapsedTodaySeconds = dayData.total_time || 0;

                // Update the initial daily time display
                totalDailyTimeUnderneath.textContent =
                    formatTime(elapsedTodaySeconds);
            } else {
                console.log("No daily data found for today. Starting at 0.");
                elapsedTodaySeconds = 0;
                totalDailyTimeUnderneath.textContent =
                    formatTime(elapsedTodaySeconds);
            }
        } catch (error) {
            console.error("Error fetching daily total time:", error);
            elapsedTodaySeconds = 0; // Default to 0 in case of error
            totalDailyTimeUnderneath.textContent =
                formatTime(elapsedTodaySeconds);
        }
    });
}

// Save the elapsed time to Firestore
async function saveStudyLog(subjectId, subjectName, elapsedSeconds) {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
            console.error("No user is logged in.");
            return;
        }

        userEmail = await user.email; // Get the current user's email

        console.log(userEmail);

        const db = await firebase.firestore();

        // Fetch subject color dynamically from the `subjects` collection
        let subjectColor;
        try {
            const subjectDoc = await db
                .collection("subjects")
                .doc(subjectId)
                .get();
            if (subjectDoc.exists) {
                subjectColor = subjectDoc.data().color;
            } else {
                console.error(`Subject with ID ${subjectId} does not exist.`);
                return;
            }
        } catch (error) {
            console.error("Error fetching subject color:", error);
            return;
        }

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
                color: subjectColor,
                total_time: 0, // Initialize with 0 seconds
            });
        }
        const timelineRefSubject = dailyLogDoc.collection("timelines");

        // Save to Day-Centric Structure
        const daysRef = db.collection("days");
        const dayQuery = await daysRef
            .where("created_by", "==", userEmail)
            .where("date", "==", currentDate)
            .get();

        let dayDoc;
        if (!dayQuery.empty) {
            dayDoc = dayQuery.docs[0].ref;
        } else {
            // Create a new day document if one doesn't exist
            dayDoc = await daysRef.add({
                date: currentDate,
                created_by: userEmail,
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
                color: subjectColor,
                total_time: 0, // Initialize with 0 seconds
            });
        }
        const timelineRefDay = studiedSubjectDoc.collection("timelines");

        try {
            // Save to subject > daily_logs > timelines
            await timelineRefSubject.add({
                start: new Date(
                    currentTimestamp.getTime() - elapsedSeconds * 1000
                ),
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
                start: new Date(
                    currentTimestamp.getTime() - elapsedSeconds * 1000
                ),
                end: currentTimestamp,
            });

            // Update or set the total time for the subject in days > studied_subjects
            const studiedSubjectDocData = (
                await studiedSubjectDoc.get()
            ).data();
            const currentSubjectTotal = await studiedSubjectDocData.total_time || 0;
            const updatedSubjectTotal = await currentSubjectTotal + elapsedSeconds;
            await studiedSubjectDoc.update({
                total_time: updatedSubjectTotal,
            });

            // Update the total daily time in days
            const dayDocData = (await dayDoc.get()).data();
            const currentDayTotal = (await dayDocData.total_time) || 0;
            const updatedDayTotal = await currentDayTotal + elapsedSeconds;
            await dayDoc.update({
                total_time: updatedDayTotal,
            });
        } catch (error) {
            console.error("Error saving study log:", error);
        }
    });
}

// Add event listeners for stop and go back buttons
pauseButton.addEventListener("click", async () => {
    stopTimer();
    await saveStudyLog(subject_id_to_record, subject_name, elapsedSeconds);
    setInterval(() => {
        window.location.href = "home.html";
    }, 2000);
});

goBack.addEventListener("click", async () => {
    stopTimer();
    await saveStudyLog(subject_id_to_record, subject_name, elapsedSeconds);
    setInterval(() => {
        window.location.href = "home.html";
    }, 2000);
});

// Initialize the display
timeDisplay.textContent = formatTime(elapsedSeconds);
totalSubjectTimeUnderneath.textContent = formatTime(elapsedSeconds);

// Fetch and display total daily time
fetchDailyTotalTime();

// Start the timer
startTimer();
