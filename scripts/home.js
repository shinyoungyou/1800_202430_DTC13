// Global variable to manage the subject list
let subjectList = [];

//------------------------------------------------------------------------------
// Function to dynamically display subjects
//------------------------------------------------------------------------------
function displaySubjectsDynamically(collection) {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.error("No user is logged in.");
            return;
        }

        db.collection(collection)
            .where("user_id", "==", user.uid) // Fetch subjects created by the current user
            .get() // Fetch the collection called "subjects"
            .then((allSubjects) => {
                subjectList = []; // Clear the subject list
                allSubjects.forEach((doc) => {
                    const subject_id = doc.id;
                    const subject_name = doc.data().name; // Get the "name" key
                    const subject_color = doc.data().color; // Get the "color" key

                    // Add the subject to the global list
                    subjectList.push({
                        id: subject_id,
                        name: subject_name,
                        color: subject_color,
                        total_time: 0,
                    });
                });

                // Fetch total time for each subject
                fetchTotalTimeForSubjects(user.uid);
            });
    });
}

displaySubjectsDynamically("subjects");

function fetchTotalTimeForSubjects(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const promises = subjectList.map((subject) => {
        return db
            .collection("logs")
            .where("user_id", "==", userId)
            .where("subject_id", "==", subject.id)
            .where("start", ">=", firebase.firestore.Timestamp.fromDate(today))
            .get()
            .then((logSnapshot) => {
                let total_subject_time = 0; // Default to 0 if no logs exist

                logSnapshot.forEach((logDoc) => {
                    const logData = logDoc.data();
                    const start = logData.start.toDate();
                    const end = logData.end.toDate();
                    total_subject_time += (end - start) / 1000; // Calculate total time in seconds
                });

                subject.total_time = total_subject_time; // Update the total time in the global list
            });
    });

    Promise.all(promises).then(() => {
        renderSubjectList();
    });
}

function renderSubjectList() {
    const subjectsContainer = document.getElementById("subjects-go-here");
    subjectsContainer.innerHTML = ""; // Clear the container

    subjectList.forEach((subject) => {
        addSubjectToDOM(subject);
    });
}


// Function to update the date dynamically
function updateCurrentDate() {
    const currentDateElement = document.getElementById("currentDate");

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    currentDateElement.textContent = formattedDate;
}

// Function to fetch and display the total time studied for the current day
function updateTotalTime() {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.error("No user is logged in.");
            return;
        }

        const totalTimeElement = document.getElementById("total_time");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        db.collection("logs")
            .where("user_id", "==", user.uid)
            .where("start", ">=", firebase.firestore.Timestamp.fromDate(today))
            .get()
            .then((querySnapshot) => {
                let totalTime = 0;

                querySnapshot.forEach((doc) => {
                    const logData = doc.data();
                    const start = logData.start.toDate();
                    const end = logData.end.toDate();
                    totalTime += (end - start) / 1000; // Calculate total time in seconds
                });

                totalTimeElement.textContent = secondsToHHMMSS(totalTime);
            })
            .catch((error) => {
                console.error("Error fetching total time for the day:", error);
                totalTimeElement.textContent = "Error";
            });
    });
}

// Update date and total time on page load
updateCurrentDate();
updateTotalTime();

function addSubjectToDOM(subject) {
    const subjectTemplate = document.getElementById("subjectListTemplate");
    const newList = subjectTemplate.content.cloneNode(true);

    // Populate subject details
    newList
        .querySelector("#subjectName")
        .appendChild(document.createTextNode(subject.name));
    newList.querySelector(
        "#subjectName"
    ).href = `log.html?subject_id=${subject.id}&subject_name=${subject.name}`;
    newList.querySelector("#totalSubjectTime").textContent = secondsToHHMMSS(
        subject.total_time
    );
    newList.querySelector("#subjectColor").style.color = subject.color;
    newList.querySelector("button").id = subject.id;

    document.getElementById("subjects-go-here").appendChild(newList);
}

// Event listener for the "Add Subject" button
let addSubjectForm = document.getElementById("addSubjectForm");

function showSuccessMessage(content) {
    const successMessage = document.getElementById("successMessage");
    const successMessageContent = document.querySelector(".successMessageText");
    successMessageContent.innerText = content;
    successMessage.classList.add("visible");

    successMessage.addEventListener(
        "animationend",
        () => {
            successMessage.classList.remove("visible");
        },
        { once: true }
    );
}

document.getElementById("addSubjectBtn").onclick = () => {
    addSubjectForm.classList.remove("hidden"); // Show the form
};

document.getElementById("cancel").onclick = () => {
    addSubjectForm.classList.add("hidden"); // Hide the form
};

function addSubject(event) {
    event.preventDefault();

    const subject_name = document.getElementById("subject_name").value;
    const subject_color = document.getElementById("subject_color").value;

    const user = firebase.auth().currentUser;
    if (user) {
        db.collection("subjects")
            .add({
                name: subject_name,
                color: subject_color,
                user_id: user.uid,
            })
            .then((docRef) => {
                const newSubject = {
                    id: docRef.id,
                    name: subject_name,
                    color: subject_color,
                    total_time: 0,
                };
                subjectList.push(newSubject); // Add to the global list
                renderSubjectList();
                showSuccessMessage("Successfully added!");
                document.getElementById("subject_name").value = "";
                document.getElementById("subject_color").value = "#000";
                addSubjectForm.classList.add("hidden");
            })
            .catch((error) => {
                console.error("Error adding subject:", error);
            });
    } else {
        console.log("No user is signed in");
        window.location.href = "home.html";
    }
}

function secondsToHHMMSS(seconds) {
    const hours = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
}

let updateSubject = document.getElementById("updateSubject");
let subject_id_to_update = null;

function openSubjectModal(event) {
    subject_id_to_update = event.currentTarget.id;
    updateSubject.classList.remove("hidden"); // Show the modal
}

function closeSubjectModal() {
    updateSubject.classList.add("hidden"); // Show form
    subject_id_to_update = null;
}

let editSubjectForm = document.getElementById("editSubjectForm");

function openEditSubject() {
    editSubjectForm.classList.remove("hidden"); // Show form
    updateSubject.classList.add("hidden"); // Show form
    // Reference to the Firestore document
    let subjectRef = db.collection("subjects").doc(subject_id_to_update);

    // Fetch the document data
    subjectRef.get().then((doc) => {
        if (doc.exists) {
            let subjectData = doc.data();
            console.log(subjectData);

            // Set the input values with the retrieved data
            document.getElementById("edit_subject_name").value =
                subjectData.name;
            document.getElementById("edit_subject_color").value =
                subjectData.color;
        } else {
            console.error("No such document!");
        }
    });
}

function editSubject(event) {
    event.preventDefault();

    const updatedName = document.getElementById("edit_subject_name").value;
    const updatedColor = document.getElementById("edit_subject_color").value;

    const subjectRef = db.collection("subjects").doc(subject_id_to_update);

    subjectRef
        .update({
            name: updatedName,
            color: updatedColor,
        })
        .then(() => {
            // Update global list
            const subject = subjectList.find((s) => s.id === subject_id_to_update);
            
            if (subject) {
                subject.name = updatedName;
                subject.color = updatedColor;
            }

            renderSubjectList();
            showSuccessMessage("Successfully updated!");

            editSubjectForm.classList.add("hidden");
            subject_id_to_update = null;
        })
        .catch((error) => {
            console.error("Error updating subject:", error);
        });
}

document.getElementById("editCancel").onclick = () => {
    editSubjectForm.classList.add("hidden"); // Show form
};

// Function to delete a subject
let confirmDeleteSubject = document.getElementById("confirmDeleteSubject");
let chooseOption = document.getElementById("chooseOption");
function openDeleteSubject() {
    confirmDeleteSubject.classList.remove("hidden");
    confirmDeleteSubject.classList.add("flex");

    chooseOption.classList.add("hidden");
    chooseOption.classList.remove("flex");
}

function resetDeleteUI() {
    confirmDeleteSubject.classList.add("hidden");
    confirmDeleteSubject.classList.remove("flex");
    updateSubject.classList.add("hidden");

    chooseOption.classList.remove("hidden");
    chooseOption.classList.add("flex");
}

function deleteSubject() {
    const subjectRef = db.collection("subjects").doc(subject_id_to_update);

    // Delete the subject document
    subjectRef
        .delete()
        .then(() => {
            // Remove from the global list
            subjectList = subjectList.filter((s) => s.id !== subject_id_to_update);

            // Query and delete related logs
            const logsQuery = db.collection("logs").where("subject_id", "==", subject_id_to_update);

            logsQuery
                .get()
                .then((logSnapshots) => {
                    const batch = db.batch();

                    logSnapshots.forEach((logDoc) => {
                        batch.delete(logDoc.ref); // Add each log document to the batch
                    });

                    return batch.commit(); // Commit the batch deletion
                })
                .then(() => {
                    console.log("Related logs deleted successfully.");
                })
                .catch((error) => {
                    console.error("Error deleting related logs:", error);
                });

            renderSubjectList();
            showSuccessMessage("Successfully deleted!");

            subject_id_to_update = null;
            resetDeleteUI();
        })
        .catch((error) => {
            console.error("Error deleting subject:", error);
        });
}
