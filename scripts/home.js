//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displaySubjectsDynamically(collection) {
    const subjectTemplate = document.getElementById("subjectListTemplate"); // Retrieve the HTML element with the ID "subjectTemplate".

    db.collection(collection)
        .get() // Fetch the collection called "subjects"
        .then((allSubjects) => {
            allSubjects.forEach((doc) => {
                const subject_id = doc.id;
                const subject_name = doc.data().name; // Get the "name" key
                const subject_color = doc.data().color; // Get the "color" key

                // Get `total_time` for today from `daily_logs`
                const today = new Date()
                today.setHours(0, 0, 0, 0);

                console.log(today);
                const dailyLogsRef = db
                    .collection("subjects")
                    .doc(subject_id)
                    .collection("daily_logs")
                    .where("date", "==", today);

                dailyLogsRef
                    .get()
                    .then((logSnapshot) => {
                        let total_subject_time = 0; // Default to 0 if no logs exist

                        if (!logSnapshot.empty) {
                            logSnapshot.forEach((logDoc) => {
                                console.log(logDoc);
                                total_subject_time =
                                    logDoc.data().total_time || 0;
                            });
                        }

                        // Clone the subject template
                        const newList = subjectTemplate.content.cloneNode(true);

                        // Populate subject details
                        newList
                            .querySelector("#subjectName")
                            .appendChild(document.createTextNode(subject_name));
                        newList.querySelector(
                            "#subjectName"
                        ).href = `log.html?subject_id=${subject_id}&subject_name=${subject_name}`;
                        newList.querySelector("#totalSubjectTime").textContent =
                            secondsToHHMMSS(total_subject_time);
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
                            `Error fetching daily logs for subject ${subject_id}:`,
                            error
                        );
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

// Function to delete a subject
let confirmDeleteSubject = document.getElementById("confirmDeleteSubject");
let subject_id_to_update = null;

function openSubjectModal(event) {
    subject_id_to_update = event.currentTarget.id;
    document.getElementById("updateSubject").classList.remove("hidden");
}

function closeSubjectModal() {
    document.getElementById("updateSubject").classList.add("hidden");
    subject_id_to_update = null;
}

function deleteSubject() {
    if (subject_id_to_update) {
        db.collection("subjects")
            .doc(subject_id_to_update)
            .delete()
            .then(() => {
                console.log("Subject successfully deleted!");
                window.location.href = "home.html";
            })
            .catch((error) => {
                console.error("Error deleting subject:", error);
            });
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
    console.log(now);
    const formattedDate = now.toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    console.log(formattedDate);
    currentDateElement.textContent = formattedDate;
}

// Function to fetch and display the total time studied for the current day
function updateTotalTime() {
    const totalTimeElement = document.getElementById("total_time");
    const today = new Date()
    today.setHours(0, 0, 0, 0);
    console.log(today);

    db.collection("days")
        .where(
            "date",
            "==",
            firebase.firestore.Timestamp.fromDate(new Date(today))
        )
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                let totalTime = 0;

                querySnapshot.forEach((doc) => {
                    totalTime += doc.data().total_time;
                });

                totalTimeElement.textContent = secondsToHHMMSS(totalTime);
            } else {
                totalTimeElement.textContent = "00:00:00";
            }
        })
        .catch((error) => {
            console.error("Error fetching total time for the day:", error);
            totalTimeElement.textContent = "Error";
        });
}

// Update date and total time on page load
updateCurrentDate();
updateTotalTime();

function writeSubjects() {
    const subjectsRef = db.collection("subjects");

    // Define realistic study data
    const mockSubjects = [
        { name: "COMP1800", color: "#FFFF00" },
        { name: "COMP1510", color: "#0000FF" },
        { name: "COMP1712", color: "#800080" },
        { name: "COMP1537", color: "#FF0000" },
        { name: "COMM1116", color: "#FFC0CB" },
        { name: "COMP1113", color: "#7FFF00" },
    ];

    const dailyLogs = [
        {
            date: "2024-09-06",
            timelines: [
                {
                    start: "2024-09-06T08:30:00-07:00",
                    end: "2024-09-06T09:15:00-07:00",
                },
                {
                    start: "2024-09-06T10:00:00-07:00",
                    end: "2024-09-06T10:45:00-07:00",
                },
            ],
        },
        {
            date: "2024-09-07",
            timelines: [
                {
                    start: "2024-09-07T13:00:00-07:00",
                    end: "2024-09-07T14:30:00-07:00",
                },
                {
                    start: "2024-09-07T16:00:00-07:00",
                    end: "2024-09-07T16:45:00-07:00",
                },
            ],
        },
    ];

    mockSubjects.forEach((subject) => {
        subjectsRef
            .add({
                name: subject.name,
                color: subject.color,
                total_time: 0, // We'll calculate the total time based on timelines
            })
            .then((subjectRef) => {
                dailyLogs.forEach((log) => {
                    const totalDailyTime = log.timelines.reduce(
                        (acc, timeline) => {
                            const start = new Date(timeline.start);
                            const end = new Date(timeline.end);
                            return acc + (end - start) / 1000; // Convert duration to seconds
                        },
                        0
                    );

                    subjectRef
                        .collection("daily_logs")
                        .add({
                            date: firebase.firestore.Timestamp.fromDate(
                                new Date(`${log.date}T00:00:00`)
                            ),
                            total_time: totalDailyTime,
                        })
                        .then((dailyLogRef) => {
                            log.timelines.forEach((timeline) => {
                                dailyLogRef.collection("timelines").add({
                                    start: firebase.firestore.Timestamp.fromDate(
                                        new Date(timeline.start)
                                    ),
                                    end: firebase.firestore.Timestamp.fromDate(
                                        new Date(timeline.end)
                                    ),
                                });
                            });
                        });
                });
            });
    });
}
// writeSubjects();
