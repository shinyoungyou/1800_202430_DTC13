//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displaySubjectsDynamically(collection) {
    const subjectTemplate = document.getElementById("subjectListTemplate"); // Retrieve the HTML element with the ID "subjectTemplate".

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.error("No user is logged in.");
            return;
        }

        const userEmail = user.email; // Get the current user's email

        db.collection(collection)
            .where("user_id", "==", user.uid) // Fetch subjects created by the current user
            .get() // Fetch the collection called "subjects"
            .then((allSubjects) => {
                allSubjects.forEach((doc) => {
                    const subject_id = doc.id;
                    const subject_name = doc.data().name; // Get the "name" key
                    const subject_color = doc.data().color; // Get the "color" key

                    // Get `total_time` for today from `logs`
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    db.collection("logs")
                        .where("user_id", "==", user.uid)
                        .where("subject_id", "==", subject_id)
                        .where(
                            "start",
                            ">=",
                            firebase.firestore.Timestamp.fromDate(today)
                        )
                        .get()
                        .then((logSnapshot) => {
                            let total_subject_time = 0; // Default to 0 if no logs exist

                            logSnapshot.forEach((logDoc) => {
                                const logData = logDoc.data();
                                const start = logData.start.toDate();
                                const end = logData.end.toDate();
                                total_subject_time += (end - start) / 1000; // Calculate total time in seconds
                            });

                            // Clone the subject template
                            const newList =
                                subjectTemplate.content.cloneNode(true);

                            // Populate subject details
                            newList
                                .querySelector("#subjectName")
                                .appendChild(
                                    document.createTextNode(subject_name)
                                );
                            newList.querySelector(
                                "#subjectName"
                            ).href = `log.html?subject_id=${subject_id}&subject_name=${subject_name}`;
                            newList.querySelector(
                                "#totalSubjectTime"
                            ).textContent = secondsToHHMMSS(total_subject_time);
                            newList.querySelector("#subjectColor").style.color =
                                subject_color;
                            newList.querySelector("button").id = subject_id;

                            // Append the populated subject to the list
                            document
                                .getElementById(collection + "-go-here")
                                .appendChild(newList);
                        })
                        .catch((error) => {
                            console.error(
                                `Error fetching logs for subject ${subject_id}:`,
                                error
                            );
                        });
                });
            });
    });
}
displaySubjectsDynamically("subjects"); // Input param is the name of the collection

// Event listener for the "Add Subject" button
let addSubjectForm = document.getElementById("addSubjectForm");

document.getElementById("addSubjectBtn").onclick = () => {
    addSubjectForm.classList.remove("hidden"); // Show the form
};

document.getElementById("cancel").onclick = () => {
    addSubjectForm.classList.add("hidden"); // Hide the form
};

// Function to add a new subject
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
            .then(() => {
                window.location.href = "home.html"; // Redirect to the home page
            })
            .catch((error) => {
                console.error("Error adding subject:", error);
            });
    } else {
        console.log("No user is signed in");
        window.location.href = "home.html";
    }
}

// Utility function to format seconds as HH:MM:SS
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
