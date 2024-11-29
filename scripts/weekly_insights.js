const calendar = document.getElementById("weekly-calendar");
const quarterYear = document.getElementById("quarterYear");
const weekTitle = document.getElementById("weekTitle");
const totalWeekTime = document.getElementById("totalWeekTime");
const averageTime = document.getElementById("averageTime");
let studyData = {};

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;

let formattedDate= formatDate(getStartOfWeek(currentDate));
console.log("formattedDate:" +formattedDate);

let previousSelectedCell = null; // To track the previously selected cell

// Convert time string to decimal
function timeStringToDecimal(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours + minutes / 60 + seconds / 3600;
}

function initializeWeeks(quarterStart, quarterEnd) {
    const weeksRef = db.collection("weeks");

    // Retrieve all days within the quarter range
    db.collection("days")
        .where("date", ">=", firebase.firestore.Timestamp.fromDate(new Date(quarterStart)))
        .where("date", "<=", firebase.firestore.Timestamp.fromDate(new Date(quarterEnd)))
        .get()
        .then((daysSnapshot) => {
            const daysData = {};
            daysSnapshot.forEach((doc) => {
                const day = doc.data();
                const weekStart = getStartOfWeek(day.date.toDate()); // Helper to calculate week start
                if (!daysData[weekStart]) {
                    daysData[weekStart] = [];
                }
                daysData[weekStart].push(day.total_time);
            });

            // Process each week's data
            Object.keys(daysData).forEach((weekStart) => {
                const totalWeekTime = daysData[weekStart].reduce((acc, time) => acc + time, 0);
                const weekAverage = Math.floor(totalWeekTime / 7); // Average in seconds

                // Save to Firestore
                weeksRef
                    .doc(weekStart)
                    .set({
                        start_date: firebase.firestore.Timestamp.fromDate(new Date(weekStart)),
                        total_week_time: totalWeekTime,
                        week_average: weekAverage,
                    })
                    .catch((error) => console.error("Error saving week data:", error));
            });
        })
        .catch((error) => console.error("Error fetching days:", error));
}

// Helper function to get the start date of the current week (Monday)
function getStartOfWeek(date) {
    let day = date.getDay();
    let diffToMonday = day === 0 ? -6 : 1 - day; // Adjust to Monday (or previous Monday if Sunday)
    let startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() + diffToMonday);
    return startOfWeek;
}

function updateWeekIfNeeded(startOfWeek, endOfWeek) {
    const weeksRef = db.collection("weeks");
    const daysRef = db.collection("days");

    // Check if the week's data is already complete
    weeksRef
        .doc(startOfWeek)
        .get()
        .then((doc) => {
            if (doc.exists) {
                // Week data exists, check if any days are missing
                const weekData = doc.data();
                daysRef
                    .where("date", ">=", firebase.firestore.Timestamp.fromDate(new Date(startOfWeek)))
                    .where("date", "<=", firebase.firestore.Timestamp.fromDate(new Date(endOfWeek)))
                    .get()
                    .then((daysSnapshot) => {
                        const totalDays = daysSnapshot.size;
                        if (totalDays < 7) {
                            // Some days are missing, calculate again
                            const totalWeekTime = daysSnapshot.docs.reduce(
                                (sum, dayDoc) => sum + dayDoc.data().total_time,
                                0
                            );
                            const weekAverage = totalWeekTime / 7;

                            // Update week in Firestore
                            weeksRef
                                .doc(startOfWeek)
                                .update({
                                    total_week_time: totalWeekTime,
                                    week_average: weekAverage,
                                })
                                .catch((error) => console.error("Error updating week:", error));
                        }
                    });
            } else {
                // Week data doesn't exist, initialize it
                initializeWeeks(startOfWeek, endOfWeek);
            }
        })
        .catch((error) => console.error("Error fetching week data:", error));
}

function formatDate(startDate) {
    return `${startDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}`;
}

function formatDateRange(startDate) {
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return `${startDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    })} - ${endDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    })}`;
}

function updateQuarterDisplay() {
    quarterYear.textContent = `${currentYear} Q${currentQuarter}`;
}

function getStartDateOfWeek(year, weekNumber) {
    let jan1 = new Date(year, 0, 1); // January 1st
    let daysOffset = (weekNumber - 1) * 7;
    let weekStartDate = new Date(jan1);
    weekStartDate.setDate(jan1.getDate() + daysOffset);
    while (weekStartDate.getDay() !== 1) {
        weekStartDate.setDate(weekStartDate.getDate() + 1);
    }
    return weekStartDate;
}

function renderWeeklyCalendar() {
    calendar.innerHTML = "";
    updateQuarterDisplay();
    studyData = {};

    let startWeek = (currentQuarter - 1) * 13 + 1; // Weeks 1-13 for Q1, 14-26 for Q2, etc.
    let year = currentYear;

    let quarterStartDate = getStartDateOfWeek(year, startWeek);
    let weekStartDate = new Date(quarterStartDate);
    let quarterEndDate = new Date(quarterStartDate);
    quarterEndDate.setDate(quarterEndDate.getDate() + 7 * 13 - 1); // End of quarter

    // Initialize weeks for the quarter
    initializeWeeks(quarterStartDate, quarterEndDate);

    db.collection("weeks")
        .where("start_date", ">=", firebase.firestore.Timestamp.fromDate(quarterStartDate))
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                let start_date = data.start_date.toDate();
                let weekStartStr = formatDate(start_date);
                studyData[weekStartStr] = {
                    start_date: start_date,
                    total_week_time: secondsToHHMMSS(data.total_week_time),
                    week_average: secondsToHHMMSS(data.week_average),
                };
            });
            showDetails(formattedDate);


            let row = document.createElement("tr");
            
            
            for (let week = 0; week < 13; week++) {
                let weekStartStr = formatDate(weekStartDate);

                // Check and update week data if necessary
                let endOfWeek = new Date(weekStartDate);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                updateWeekIfNeeded(weekStartDate.toISOString().split("T")[0], endOfWeek.toISOString().split("T")[0]);

                let cell = document.createElement("td");
                cell.classList = "calendar-cell week";

                if (studyData[weekStartStr]) {
                    const totalWeekTime = studyData[weekStartStr].total_week_time;

                    let totalWeekTimeDecimal = timeStringToDecimal(
                        studyData[weekStartStr].total_week_time
                    );

                    let dataHours = null;
                    if (totalWeekTimeDecimal > 0 && totalWeekTimeDecimal < 20) {
                        dataHours = 0;
                    } else if (
                        totalWeekTimeDecimal >= 20 &&
                        totalWeekTimeDecimal < 35
                    ) {
                        dataHours = 4;
                    } else if (
                        totalWeekTimeDecimal >= 35 &&
                        totalWeekTimeDecimal < 50
                    ) {
                        dataHours = 7;
                    } else if (totalWeekTimeDecimal >= 50) {
                        dataHours = 10;
                    }
                    cell.dataset.hours = dataHours;
                    
                    cell.innerHTML = 
                        `<p>${weekStartStr} ~</p>
                        <p>${totalWeekTime}</p>`;
                } else {
                    cell.innerHTML = 
                        `<p>${weekStartStr} ~</p>
                        <p class='text-transparent'>00:00:00</p>`;
                }

                // Add click event for selecting a cell
                cell.addEventListener("click", () => {
                    if (previousSelectedCell) {
                        previousSelectedCell.classList.remove("current-week");
                    }
                    cell.classList.add("current-week");
                    previousSelectedCell = cell; // Update the previously selected cell
                    showDetails(weekStartStr);
                });

                // Highlight the current week by default
                if (weekStartStr === formatDate(getStartOfWeek(new Date()))) {
                    cell.classList.add("current-week");
                    previousSelectedCell = cell;
                }

                row.appendChild(cell);
                if (row.children.length === 5) {
                    calendar.appendChild(row);
                    row = document.createElement("tr");
                }
                weekStartDate.setDate(weekStartDate.getDate() + 7);
            }

            
            if (row.children.length > 0) {
                calendar.appendChild(row);
            }
        })
        .catch((error) => console.error("Error fetching weeks:", error));
}

function showDetails(weekRangeStr) {
    console.log("weekRangeStr: "+weekRangeStr);
    const weekData = studyData[weekRangeStr];
    if (weekData) {
        weekTitle.textContent = formatDateRange(weekData.start_date);
        totalWeekTime.textContent = weekData.total_week_time;
        averageTime.textContent = weekData.week_average;
    } else {
        weekTitle.textContent = "No data available";
        totalWeekTime.textContent = "00:00:00";
        averageTime.textContent = "00:00:00";
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

// Quarter navigation
document.getElementById("prevQuarter").onclick = () => {
    currentQuarter -= 1;
    if (currentQuarter < 1) {
        currentQuarter = 4;
        currentYear -= 1;
    }
    renderWeeklyCalendar();
};

document.getElementById("nextQuarter").onclick = () => {
    currentQuarter += 1;
    if (currentQuarter > 4) {
        currentQuarter = 1;
        currentYear += 1;
    }
    renderWeeklyCalendar();
};

// Initial render
renderWeeklyCalendar();


function writeWeeks() {
    const weeksRef = db.collection("weeks");

    // Define realistic weekly mock data
    const mockWeeks = [
        {
            start_date: "2024-09-30",
            total_week_time: 110169, // in seconds (30:36:09)
            week_average: 22603, // in seconds (04:22:18)
        },
        {
            start_date: "2024-10-07",
            total_week_time: 138296, // in seconds (38:38:16)
            week_average: 28473, // in seconds (05:31:10)
        },
        {
            start_date: "2024-10-14",
            total_week_time: 169473, // in seconds (47:04:33)
            week_average: 34945, // in seconds (06:43:30)
        },
        {
            start_date: "2024-10-21",
            total_week_time: 117110, // in seconds (32:31:50)
            week_average: 23422, // in seconds (04:38:50)
        },
        {
            start_date: "2024-10-28",
            total_week_time: 95382, // in seconds (26:29:42)
            week_average: 19076, // in seconds (03:47:06)
        },
        {
            start_date: "2024-11-04",
            total_week_time: 93042, // in seconds (25:50:42)
            week_average: 18608, // in seconds (03:47:50)
        },
    ];

    // Add mock data to Firestore
    mockWeeks.forEach((week) => {
        weeksRef.add({
            start_date: firebase.firestore.Timestamp.fromDate(new Date(`${week.start_date}T00:00:00`)),
            total_week_time: week.total_week_time,
            week_average: week.week_average,
        });
    });
}

// writeWeeks();
