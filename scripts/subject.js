let currentSubjectId = null;  // To track which subject is being edited or deleted
const subjectsRef = firebase.firestore().collection('subjects');  // Reference to Firestore collection
const timers = {};  // Global object to store timers for each subject

// Function to display subjects dynamically
function displaySubjectsDynamically() {
    let subjectTemplate = document.getElementById("subjectListTemplate");
    document.getElementById("subjects-go-here").innerHTML = "";  // Clear existing content

    // Fetch all subjects from Firestore
    subjectsRef.get().then((allSubjects) => {
        allSubjects.forEach((doc) => {
            const subjectId = doc.id;
            const subjectData = doc.data();

            // Clone the template for each subject
            let newList = subjectTemplate.content.cloneNode(true);
            const subjectItem = newList.querySelector(".subject-item");
            subjectItem.setAttribute("data-subject-id", subjectId);

            // Set the subject name and color
            newList.querySelector(".subject-name").textContent = subjectData.name;
            newList.querySelector(".subject-color").style.color = subjectData.color;
            newList.querySelector(".toggle-timer-btn").setAttribute("data-subject-id", subjectId);
            newList.querySelector(".subject-timer").setAttribute("data-subject-id", subjectId);

            // Add event listeners for Edit and Delete
            newList.querySelector(".dropdown-item-edit").addEventListener("click", () => {
                openEditSubjectModal(subjectId, subjectData.name, subjectData.color);
            });
            newList.querySelector(".dropdown-item-delete").addEventListener("click", () => {
                openDeleteModal(subjectId);
            });

            // Add event listener for Toggle Timer button
            newList.querySelector(".toggle-timer-btn").addEventListener("click", function () {
                toggleTimer(subjectId, this);
            });

            // Append the new subject item to the subjects container
            document.getElementById("subjects-go-here").appendChild(newList);

            // Initialize the timer display
            if (subjectData.totalTime) {
                updateTimerDisplay(subjectId, subjectData.totalTime);
            }

            // Listen for real-time updates for the subject
            listenForStudySessionUpdates(subjectId);
        });
    }).catch((error) => {
        console.error("Error displaying subjects: ", error);
    });
}

// Function to save a subject (either add or update)
function saveSubject() {
    const subjectName = document.getElementById("subjectNameInput").value;
    const subjectColor = document.getElementById("subjectColorInput").value;

    if (subjectName && subjectColor) {
        if (currentSubjectId) {
            // Update existing subject
            subjectsRef.doc(currentSubjectId).update({
                name: subjectName,
                color: subjectColor
            }).then(() => {
                displaySubjectsDynamically();  // Refresh subjects
                resetModal();  // Reset modal
            }).catch((error) => {
                console.error("Error updating subject: ", error);
            });
        } else {
            // Add new subject
            subjectsRef.add({
                name: subjectName,
                totalTime: 0,  // Initialize total time
                color: subjectColor,
                date: firebase.firestore.Timestamp.fromDate(new Date()),
                isTimerRunning: false,
                startTime: null
            }).then(() => {
                displaySubjectsDynamically();  // Refresh subjects
                resetModal();  // Reset modal
            }).catch((error) => {
                console.error("Error adding subject: ", error);
            });
        }
    } else {
        alert("Please enter both subject name and color.");
    }
}

// Function to delete a subject
function deleteSubject() {
    if (currentSubjectId) {
        subjectsRef.doc(currentSubjectId).delete().then(() => {
            displaySubjectsDynamically();  // Refresh subjects after delete
            $('#deleteModal').modal('hide');  // Hide delete modal
            currentSubjectId = null;  // Reset current subject id
        }).catch((error) => {
            console.error("Error deleting subject: ", error);
        });
    }
}

// Function to open the Add Subject Modal
function openAddSubjectModal() {
    currentSubjectId = null;
    document.getElementById("subjectModalLabel").innerText = "Add Subject";
    document.getElementById("addSubjectBtn").innerText = "Add Subject";
    resetModal();  // Reset modal fields
    $('#subjectModal').modal('show');  // Show modal
}

// Function to open the Edit Subject Modal
function openEditSubjectModal(subjectId, subjectName, subjectColor) {
    currentSubjectId = subjectId;
    document.getElementById("subjectModalLabel").innerText = "Edit Subject";
    document.getElementById("addSubjectBtn").innerText = "Save Changes";
    document.getElementById("subjectNameInput").value = subjectName;
    document.getElementById("subjectColorInput").value = subjectColor;
    $('#subjectModal').modal('show');  // Show modal
}

// Function to open the Delete Modal
function openDeleteModal(subjectId) {
    currentSubjectId = subjectId;
    $('#deleteModal').modal('show');  // Show delete modal
}

// Function to reset the modal inputs
function resetModal() {
    document.getElementById("subjectNameInput").value = "";
    document.getElementById("subjectColorInput").value = "#000000";
    $('#subjectModal').modal('hide');
    currentSubjectId = null;
}

// Function to listen for real-time updates on the subject
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

// Function to update the timer display based on total time
function updateTimerDisplay(subjectId, totalTime) {
    const timerElement = document.querySelector(`.subject-timer[data-subject-id="${subjectId}"]`);
    if (timerElement) {
        const hours = String(Math.floor(totalTime / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalTime % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalTime % 60).padStart(2, "0");

        timerElement.innerText = `${hours}:${minutes}:${seconds}`;
    }
}

// Function to toggle the timer (start/pause)
function toggleTimer(subjectId, buttonElement) {
    subjectsRef.doc(subjectId).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.isTimerRunning) {
                // Pause the timer
                pauseTimer(subjectId);
                buttonElement.querySelector("i").classList.replace("fa-pause", "fa-play");
            } else {
                // Start the timer
                startTimer(subjectId, new Date());
                buttonElement.querySelector("i").classList.replace("fa-play", "fa-pause");
            }
        }
    }).catch((error) => {
        console.error("Error toggling timer: ", error);
    });
}

// Function to start the timer
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

// Function to pause the timer
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

// Function to stop the timer (used when the timer is running but not managed locally)
function stopTimer(subjectId) {
    if (timers[subjectId]) {
        clearInterval(timers[subjectId]);
        delete timers[subjectId];
    }
}

// Function to increment the total time
function incrementTime(subjectId) {
    subjectsRef.doc(subjectId).update({
        totalTime: firebase.firestore.FieldValue.increment(1)
    }).catch((error) => {
        console.error("Error incrementing time: ", error);
    });
}

// Initialize by displaying subjects on page load
window.onload = function () {
    displaySubjectsDynamically();  // Display subjects when the page loads
};
