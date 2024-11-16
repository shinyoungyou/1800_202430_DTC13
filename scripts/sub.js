let currentSubjectId = null;
const subjectsRef = firebase.firestore().collection('subjects');
const timers = {};

function displaySubjectsDynamically() {
    let subjectTemplate = document.getElementById("subjectListTemplate");
    document.getElementById("subjects-go-here").innerHTML = "";

    subjectsRef.get().then((allSubjects) => {
        allSubjects.forEach((doc) => {
            const subjectId = doc.id;
            const subjectData = doc.data();
            let newList = subjectTemplate.content.cloneNode(true);

            const subjectItem = newList.querySelector(".subject-item");
            subjectItem.setAttribute("data-subject-id", subjectId);
            newList.querySelector(".subject-name").textContent = subjectData.name;
            newList.querySelector(".subject-color").style.color = subjectData.color;
            newList.querySelector(".toggle-timer-btn").setAttribute("data-subject-id", subjectId);
            newList.querySelector(".subject-timer").setAttribute("data-subject-id", subjectId);

            // Add event listeners for edit and delete actions
            newList.querySelector(".dropdown-item-edit").addEventListener("click", () => {
                openEditSubjectModal(subjectId, subjectData.name, subjectData.color);
            });
            newList.querySelector(".dropdown-item-delete").addEventListener("click", () => {
                openDeleteModal(subjectId);
            });

            // Add event listener for timer toggle
            newList.querySelector(".toggle-timer-btn").addEventListener("click", function () {
                toggleTimer(subjectId, this);
            });

            document.getElementById("subjects-go-here").appendChild(newList);

            // Update timer display if totalTime exists
            if (subjectData.totalTime) {
                newList.querySelector(".subject-timer").textContent = formatTime(subjectData.totalTime);
            }

            // Listen for study session updates
            listenForStudySessionUpdates(subjectId);
        });
    }).catch((error) => {
        console.error("Error displaying subjects: ", error);
    });
}

// Helper function to format time
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


function saveSubject() {
    const subjectName = document.getElementById("subjectNameInput").value;
    const subjectColor = document.getElementById("subjectColorInput").value;

    if (subjectName && subjectColor) {
        if (currentSubjectId) {
            subjectsRef.doc(currentSubjectId).update({
                name: subjectName,
                color: subjectColor
            }).then(() => {
                displaySubjectsDynamically();
                resetModal();
            }).catch((error) => {
                console.error("Error updating subject: ", error);
            });
        } else {
            subjectsRef.add({
                name: subjectName,
                totalTime: 0,
                color: subjectColor,
                date: firebase.firestore.Timestamp.fromDate(new Date()),
                isTimerRunning: false,
                startTime: null
            }).then(() => {
                displaySubjectsDynamically();
                resetModal();
            }).catch((error) => {
                console.error("Error adding subject: ", error);
            });
        }
    } else {
        alert("Please enter both subject name and color.");
    }
}

function deleteSubject() {
    if (currentSubjectId) {
        subjectsRef.doc(currentSubjectId).delete().then(() => {
            displaySubjectsDynamically();
            $('#deleteModal').modal('hide');
            currentSubjectId = null;
        }).catch((error) => {
            console.error("Error deleting subject: ", error);
        });
    }
}

function openAddSubjectModal() {
    currentSubjectId = null;
    document.getElementById("subjectModalLabel").innerText = "Add Subject";
    document.getElementById("addSubjectBtn").innerText = "Add Subject";
    resetModal();
    $('#subjectModal').modal('show');
}

function openEditSubjectModal(subjectId, subjectName, subjectColor) {
    currentSubjectId = subjectId;
    document.getElementById("subjectModalLabel").innerText = "Edit Subject";
    document.getElementById("addSubjectBtn").innerText = "Save Changes";
    document.getElementById("subjectNameInput").value = subjectName;
    document.getElementById("subjectColorInput").value = subjectColor;
    $('#subjectModal').modal('show');
}

function openDeleteModal(subjectId) {
    currentSubjectId = subjectId;
    $('#deleteModal').modal('show');
}

function resetModal() {
    document.getElementById("subjectNameInput").value = "";
    document.getElementById("subjectColorInput").value = "#000000";
    $('#subjectModal').modal('hide');
    currentSubjectId = null;
}

function listenForStudySessionUpdates(subjectId) {
    subjectsRef.doc(subjectId).onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.totalTime !== undefined) {
                updateTimerDisplay(subjectId, data.totalTime);
            }
            if (data.isTimerRunning && data.startTime) {
                const startTime = data.startTime.toDate();
                startTimer(subjectId, startTime);
            } else {
                stopTimer(subjectId);
            }
        }
    });
}

function updateTimerDisplay(subjectId, totalTime) {
    const timerElement = document.querySelector(`.subject-timer[data-subject-id="${subjectId}"]`);
    if (timerElement) {
        const hours = String(Math.floor(totalTime / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalTime % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalTime % 60).padStart(2, "0");
        timerElement.innerText = `${hours}:${minutes}:${seconds}`;
    }
}

function toggleTimer(subjectId, buttonElement) {
    subjectsRef.doc(subjectId).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.isTimerRunning) {
                pauseTimer(subjectId);
                buttonElement.querySelector("i").classList.replace("fa-pause", "fa-play");
            } else {
                startTimer(subjectId, new Date());
                buttonElement.querySelector("i").classList.replace("fa-play", "fa-pause");
            }
        }
    }).catch((error) => {
        console.error("Error toggling timer: ", error);
    });
}

function startTimer(subjectId, startTime) {
    subjectsRef.doc(subjectId).update({
        isTimerRunning: true,
        startTime: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        if (!timers[subjectId]) {
            timers[subjectId] = setInterval(() => {
                incrementTime(subjectId);
            }, 1000);
        }
    }).catch((error) => {
        console.error("Error starting timer: ", error);
    });
}

function pauseTimer(subjectId) {
    subjectsRef.doc(subjectId).update({
        isTimerRunning: false,
        startTime: null
    }).then(() => {
        if (timers[subjectId]) {
            clearInterval(timers[subjectId]);
            delete timers[subjectId];
        }
    }).catch((error) => {
        console.error("Error pausing timer: ", error);
    });
}

function stopTimer(subjectId) {
    if (timers[subjectId]) {
        clearInterval(timers[subjectId]);
        delete timers[subjectId];
    }
}

function incrementTime(subjectId) {
    subjectsRef.doc(subjectId).update({
        totalTime: firebase.firestore.FieldValue.increment(1)
    }).catch((error) => {
        console.error("Error incrementing time: ", error);
    });
}


function checkAndShowCompletionModal() {
    const message = localStorage.getItem('completionMessage');
    if (message) {
        showCompletionModal(message);
        localStorage.removeItem('completionMessage');
    }
}

// Call this function when the home page loads

window.onload = function () {
    // displaySubjectsDynamically();
    // checkAndShowCompletionModal();
};

document.addEventListener('DOMContentLoaded', function () {
    // displaySubjectsDynamically();
    document.getElementById("addSubjectBtn").addEventListener("click", saveSubject);
    document.getElementById("confirmDeleteBtn").addEventListener("click", deleteSubject);
});
