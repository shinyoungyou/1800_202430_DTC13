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
    return `${hours}:${minutes}:${secs.slice(0, 2)}`;
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

displayCalendarDynamically("logs"); // Input param is the name of the collection

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
        document.getElementById("dayTitle").textContent = dateStr;
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
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.error("No user is logged in.");
            return;
        }

        const userId = user.uid; // Get the current user's UID

        db.collection(collection)
            .where("user_id", "==", userId)
            .get()
            .then((logs) => {
                studyData = {};

                logs.forEach((logDoc) => {
                    const logData = logDoc.data();
                    const date = logData.start.toDate();
                    const formattedDate = formatDate(date);

                    if (!studyData[formattedDate]) {
                        studyData[formattedDate] = {
                            total_day_time: 0,
                            timelines: [],
                        };
                    }

                    const start = logData.start.toDate();
                    const end = logData.end.toDate();
                    const duration = (end - start) / 1000; // Duration in seconds

                    studyData[formattedDate].total_day_time += duration;
                    studyData[formattedDate].timelines.push({ start, end });
                });

                renderDailyCalendar(studyData);
            });
    });
}
