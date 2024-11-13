let timerInterval;
let isTimerRunning = false;
let totalTime = 0;
let subjectId;
let subjectName;

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    subjectId = urlParams.get('subjectId');
    subjectName = urlParams.get('subjectName');

    document.getElementById('subjectName').textContent = subjectName;
    document.getElementById("toggleButton").addEventListener("click", toggleTimer);
    loadSubjectData();
});

function loadSubjectData() {
    firebase.firestore().collection('subjects').doc(subjectId).get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                totalTime = data.totalTime || 0;
                updateTimerDisplay();
                updateSubjectTimeDisplay();
            }
        })
        .catch((error) => {
            console.error("Error loading subject data:", error);
        });
}

function toggleTimer() {
    const icon = this.querySelector("i");
    if (!isTimerRunning) {
        startTimer();
        icon.classList.replace("fa-play", "fa-pause");
    } else {
        stopTimer();
        icon.classList.replace("fa-pause", "fa-play");
    }
}

function startTimer() {
    isTimerRunning = true;
    const startTime = new Date();
    timerInterval = setInterval(() => {
        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        totalTime += elapsedTime;
        updateTimerDisplay();
    }, 1000);

    firebase.firestore().collection('subjects').doc(subjectId).update({
        isTimerRunning: true,
        startTime: firebase.firestore.FieldValue.serverTimestamp()
    });
}

function stopTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);

    firebase.firestore().collection('subjects').doc(subjectId).update({
        isTimerRunning: false,
        totalTime: totalTime,
        startTime: null
    }).then(() => {
        logStudySession();
    });
}

function updateTimerDisplay() {
    const hours = String(Math.floor(totalTime / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalTime % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalTime % 60).padStart(2, "0");
    document.getElementById("time").innerText = `${hours}:${minutes}:${seconds}`;
}

function updateSubjectTimeDisplay() {
    const hours = String(Math.floor(totalTime / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalTime % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalTime % 60).padStart(2, "0");
    document.getElementById("subjectTime").innerText = `${hours}:${minutes}:${seconds}`;
}

function logStudySession() {
    const studySession = {
        subjectId: subjectId,
        subjectName: subjectName,
        duration: totalTime,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    firebase.firestore().collection('studySessions').add(studySession)
        .then(() => {
            const message = `${subjectName}: ${Math.floor(totalTime / 60)} min logged`;
            localStorage.setItem('completionMessage', message);
            window.location.href = 'home.html';
        })
        .catch((error) => {
            console.error("Error logging study session: ", error);
        });
}
