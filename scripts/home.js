// Function to display the current time in the header
function displayTime() {
    const timeElement = document.getElementById("timeDisplay");
    setInterval(function () {
        const currentTime = new Date();
        timeElement.textContent = currentTime.toLocaleTimeString();
    }, 1000); // Update every second
}


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Function to load and display subjects
function loadSubjects() {
    const subjectsContainer = document.getElementById("subjects-go-here");
    db.collection("subjects").get().then((snapshot) => {
        snapshot.forEach((doc) => {
            const subject = doc.data();
            addSubjectToPage(subject, doc.id);
        });
    });
}

// Function to add a subject to the page
function addSubjectToPage(subject, subjectId) {
    const template = document.getElementById("subjectListTemplate").content.cloneNode(true);
    const subjectColor = template.querySelector(".subject-color");
    const subjectName = template.querySelector(".subject-name");
    const moreMenu = template.querySelector(".dropdown-menu");

    subjectColor.style.backgroundColor = subject.color;
    subjectName.textContent = subject.name;

    // Set edit functionality
    const editBtn = moreMenu.querySelector(".dropdown-item-edit");
    editBtn.addEventListener("click", () => editSubject(subjectId));

    // Set delete functionality
    const deleteBtn = moreMenu.querySelector(".dropdown-item-delete");
    deleteBtn.addEventListener("click", () => deleteSubject(subjectId));

    // Append to the subjects container
    document.getElementById("subjects-go-here").appendChild(template);
}

// Function to handle editing a subject
function editSubject(subjectId) {
    const newSubjectName = prompt("Enter new subject name:");
    const newSubjectColor = prompt("Enter new subject color (hex code):");

    if (newSubjectName && newSubjectColor) {
        db.collection("subjects").doc(subjectId).update({
            name: newSubjectName,
            color: newSubjectColor
        }).then(() => {
            alert("Subject updated!");
            loadSubjects(); // Reload subjects after update
        }).catch((error) => {
            alert("Error updating subject: " + error);
        });
    }
}

// Function to delete a subject
function deleteSubject(subjectId) {
    db.collection("subjects").doc(subjectId).delete().then(() => {
        alert("Subject deleted!");
        loadSubjects(); // Reload subjects after deletion
    }).catch((error) => {
        alert("Error deleting subject: " + error);
    });
}

// Function to handle adding a subject
function addNewSubject() {
    const subjectName = document.getElementById("subjectNameInput").value;
    const subjectColor = document.getElementById("subjectColorInput").value;

    if (subjectName && subjectColor) {
        db.collection("subjects").add({
            name: subjectName,
            color: subjectColor
        }).then(() => {
            alert("Subject added!");
            loadSubjects(); // Reload subjects after adding
            document.getElementById("subjectNameInput").value = ''; // Clear input fields
            document.getElementById("subjectColorInput").value = '#000000';
        }).catch((error) => {
            alert("Error adding subject: " + error);
        });
    } else {
        alert("Please fill in both fields.");
    }
}

// Event listener for the "Done" button to add a subject
document.getElementById("addSubjectBtn").addEventListener("click", addNewSubject);

// Call the displayTime function to update the time on page load
window.onload = function () {
    displayTime();
    loadSubjects();
};
