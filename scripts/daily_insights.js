const calendar = document.getElementById("daily-calendar"); // Target the tbody of the calendar table
const monthYear = document.getElementById("monthYear");

let currentDate = new Date();
let studyData = {}; // Object to hold Firestore data

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
}

let formattedCurrentDate = formatDate(currentDate);

let previousSelectedCell = null; // To store the last selected cell

function secondsToDecimal(seconds) {
    return seconds / 3600; // Convert seconds to decimal hours
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

function secondsToHHMM(seconds) {
    const hours = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, "0");
    return `${hours}:${minutes}`;
}

displayCalendarDynamically("days"); // Input param is the name of the collection

function renderDailyCalendar(studyData) {
    calendar.innerHTML = ""; // Clear the previous calendar content
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let firstDay = new Date(year, month, 1).getDay();

    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday as the first day of the week
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Update the month display
    monthYear.textContent = currentDate.toLocaleDateString("en-US", {
        month: "short",
    });

    let row = document.createElement("tr");

    // Add empty cells for the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("td");
        emptyCell.classList.add("empty-cell");
        row.appendChild(emptyCell);
    }

    showDetails(formattedCurrentDate);

    // Fill in cells with dates and study hours
    for (let day = 1; day <= daysInMonth; day++) {
        if (row.children.length === 7) {
            calendar.appendChild(row);
            row = document.createElement("tr");
        }

        let date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;
        let dayData = studyData[date];

        let cell = document.createElement("td");
        cell.classList.add("calendar-cell");

        if (date === formattedCurrentDate) {
            cell.classList.add("current-date");
            previousSelectedCell = cell;
        }

        if (dayData) {
            let totalDayTimeDecimal = secondsToDecimal(dayData.total_day_time);

            let dataHours = null;
            if (totalDayTimeDecimal > 0 && totalDayTimeDecimal < 4) {
                dataHours = 0;
            } else if (totalDayTimeDecimal >= 4 && totalDayTimeDecimal < 7) {
                dataHours = 4;
            } else if (totalDayTimeDecimal >= 7 && totalDayTimeDecimal < 10) {
                dataHours = 7;
            } else if (totalDayTimeDecimal >= 10) {
                dataHours = 10;
            }

            cell.dataset.hours = dataHours;
            cell.innerHTML = `
                <p>${day}</p>
                <p>${secondsToHHMM(dayData.total_day_time)}</p>`;
        } else {
            cell.innerHTML = `
                <p>${day}</p>
                <p class='text-transparent'>00:00</p>`;
        }

        cell.addEventListener("click", () => {
            if (previousSelectedCell) {
                previousSelectedCell.classList.remove("current-date");
            }
            cell.classList.add("current-date");
            previousSelectedCell = cell;
            showDetails(date);
        });

        row.appendChild(cell);
    }

    while (row.children.length < 7) {
        const emptyCell = document.createElement("td");
        emptyCell.classList.add("empty-cell");
        row.appendChild(emptyCell);
    }

    calendar.appendChild(row);
}

// Month navigation
document.getElementById("prevMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderDailyCalendar(studyData);
};

document.getElementById("nextMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderDailyCalendar(studyData);
};

function showDetails(dateStr) {
    const dayData = studyData[dateStr];
    if (dayData) {
        document.getElementById("dayTitle").textContent =
            dayData.date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            });
        document.getElementById("totalDayTime").textContent = secondsToHHMMSS(
            dayData.total_day_time
        );

        // Calculate max_focus dynamically
        const maxFocus = Math.max(
            ...dayData.timelines.map(
                (timeline) => (timeline.end - timeline.start) / 1000 // Duration in seconds
            )
        );
        document.getElementById("totalMaxFocus").textContent =
            secondsToHHMMSS(maxFocus);

        // Calculate started and finished dynamically
        const started = new Date(
            Math.min(...dayData.timelines.map((timeline) => timeline.start))
        );
        const finished = new Date(
            Math.max(...dayData.timelines.map((timeline) => timeline.end))
        );

        document.getElementById("startedTime").textContent =
            started.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        document.getElementById("endTime").textContent =
            finished.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
    } else {
        document.getElementById("dayTitle").textContent = "No data available";
        document.getElementById("totalDayTime").textContent = "00:00:00";
        document.getElementById("totalMaxFocus").textContent = "00:00:00";
        document.getElementById("startedTime").textContent = "00:00 AM";
        document.getElementById("endTime").textContent = "00:00 AM";
    }
}

function displayCalendarDynamically(collection) {
    db.collection(collection)
        .get()
        .then((allDays) => {
            studyData = {};

            const promises = allDays.docs.map((doc) => {
                const dayData = doc.data();
                const date = dayData.date.toDate();
                const formattedDate = formatDate(date);

                const dayEntry = {
                    date,
                    total_day_time: dayData.total_time,
                    timelines: [],
                };

                return doc.ref
                    .collection("studied_subjects")
                    .get()
                    .then((subjects) => {
                        const subjectPromises = subjects.docs.map(
                            (subjectDoc) =>
                                subjectDoc.ref
                                    .collection("timelines")
                                    .get()
                                    .then((timelines) => {
                                        timelines.forEach((timelineDoc) => {
                                            const timelineData =
                                                timelineDoc.data();
                                            dayEntry.timelines.push({
                                                start: timelineData.start.toDate(),
                                                end: timelineData.end.toDate(),
                                            });
                                        });
                                    })
                        );

                        return Promise.all(subjectPromises).then(() => {
                            studyData[formattedDate] = dayEntry;
                        });
                    });
            });

            Promise.all(promises).then(() => renderDailyCalendar(studyData));
        });
}

function writeDays() {
    const daysRef = db.collection("days");

    // Define realistic daily data
    const mockDays = [
        {
            date: "2024-09-06",
            studiedSubjects: [
                {
                    name: "COMP1800",
                    total_time: 4200, // 1 hour 10 minutes
                    timelines: [
                        {
                            start: "2024-09-06T08:45:00-07:00",
                            end: "2024-09-06T09:35:00-07:00",
                        },
                        {
                            start: "2024-09-06T10:00:00-07:00",
                            end: "2024-09-06T10:30:00-07:00",
                        },
                    ],
                },
                {
                    name: "COMP1510",
                    total_time: 3600, // 1 hour
                    timelines: [
                        {
                            start: "2024-09-06T11:00:00-07:00",
                            end: "2024-09-06T11:40:00-07:00",
                        },
                        {
                            start: "2024-09-06T14:15:00-07:00",
                            end: "2024-09-06T14:45:00-07:00",
                        },
                    ],
                },
            ],
        },
        {
            date: "2024-09-07",
            studiedSubjects: [
                {
                    name: "COMP1712",
                    total_time: 5400, // 1 hour 30 minutes
                    timelines: [
                        {
                            start: "2024-09-07T07:00:00-07:00",
                            end: "2024-09-07T07:45:00-07:00",
                        },
                        {
                            start: "2024-09-07T10:00:00-07:00",
                            end: "2024-09-07T10:45:00-07:00",
                        },
                    ],
                },
                {
                    name: "COMP1537",
                    total_time: 3600, // 1 hour
                    timelines: [
                        {
                            start: "2024-09-07T12:00:00-07:00",
                            end: "2024-09-07T12:40:00-07:00",
                        },
                        {
                            start: "2024-09-07T16:00:00-07:00",
                            end: "2024-09-07T16:20:00-07:00",
                        },
                    ],
                },
            ],
        },
    ];

    mockDays.forEach((day) => {
        const totalDayTime = day.studiedSubjects.reduce(
            (acc, subject) => acc + subject.total_time,
            0
        );

        daysRef
            .add({
                date: firebase.firestore.Timestamp.fromDate(
                    new Date(`${day.date}T00:00:00`)
                ),
                total_time: totalDayTime,
            })
            .then((dayRef) => {
                day.studiedSubjects.forEach((subject) => {
                    dayRef
                        .collection("studied_subjects")
                        .add({
                            name: subject.name,
                            total_time: subject.total_time,
                        })
                        .then((subjectRef) => {
                            subject.timelines.forEach((timeline) => {
                                subjectRef.collection("timelines").add({
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

// writeDays();
