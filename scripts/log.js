let currentSubjectId = null;
let globalTimer = null;
let globalStartTime = null;
let isTimerRunning = false;
let totalElapsedSeconds = 0;

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');
    const timeDisplay = document.getElementById('time');
    const subjectNameDisplay = document.getElementById('subject-name');
    const subjectTimerDisplay = document.getElementById('subject-timer');

    // Get subject ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentSubjectId = urlParams.get('subjectId');

    // Function to format time
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    // Function to get current subject details
    function getCurrentSubject() {
        if (currentSubjectId) {
            const subjectsRef = firebase.firestore().collection('subjects');
            subjectsRef.doc(currentSubjectId).get().then(doc => {
                if (doc.exists) {
                    const subjectData = doc.data();
                    subjectNameDisplay.textContent = subjectData.name;

                    // Initialize total time if exists
                    if (subjectData.totalTime) {
                        totalElapsedSeconds = subjectData.totalTime;
                        subjectTimerDisplay.textContent = formatTime(totalElapsedSeconds);
                    }
                }
            }).catch(error => {
                console.error("Error getting subject:", error);
            });
        }
    }

    // Function to start the timer
    function startTimer() {
        if (!isTimerRunning) {
            isTimerRunning = true;
            globalStartTime = new Date();

            // Update toggle button icon
            toggleButton.querySelector('i').classList.replace('fa-play', 'fa-pause');

            globalTimer = setInterval(() => {
                const currentTime = new Date();
                const elapsedSeconds = Math.floor((currentTime - globalStartTime) / 1000);

                // Update total elapsed seconds
                totalElapsedSeconds += elapsedSeconds;

                // Update main timer display
                timeDisplay.textContent = formatTime(totalElapsedSeconds);
                subjectTimerDisplay.textContent = formatTime(totalElapsedSeconds);

                // Update Firestore with new total time
                if (currentSubjectId) {
                    updateSubjectTimer();
                }

                // Reset start time for next interval
                globalStartTime = currentTime;
            }, 1000);
        }
    }

    // Function to pause the timer
    function pauseTimer() {
        if (isTimerRunning) {
            isTimerRunning = false;
            clearInterval(globalTimer);

            // Update toggle button icon
            toggleButton.querySelector('i').classList.replace('fa-pause', 'fa-play');

            // Show completion modal
            const message = `You've studied for ${formatTime(totalElapsedSeconds)}`;
            localStorage.setItem('completionMessage', message);
            showCompletionModal(message);
        }
    }

    function showCompletionModal(message) {
        const modal = document.createElement('div');
        modal.innerHTML = `
        <div class="modal fade show" id="completionModal" tabindex="-1" aria-labelledby="completionModalLabel" aria-hidden="true" style="display: block;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="completionModalLabel">Study Session Completed</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="redirectToHome()">OK</button>
                    </div>
                </div>
            </div>
        </div>
    `;
        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(document.getElementById('completionModal'));
        modalInstance.show();
    }

    function redirectToHome() {
        window.location.href = 'home.html';
    }


    // Function to update subject timer in Firestore
    function updateSubjectTimer() {
        const subjectsRef = firebase.firestore().collection('subjects');
        subjectsRef.doc(currentSubjectId).update({
            totalTime: totalElapsedSeconds,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.error("Error updating subject timer: ", error);
        });
    }

    // Toggle timer on button click
    toggleButton.addEventListener('click', () => {
        if (!isTimerRunning) {
            startTimer();
        } else {
            pauseTimer();
        }
    });

    // Initialize current subject on page load
    getCurrentSubject();
});
