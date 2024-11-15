const calendar = document.getElementById("weekly-calendar");
const quarterYear = document.getElementById("quarterYear");
let studyData = {};

// let currentDate = new Date("2024-11-05T00:00:00");
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;

// Helper function to get the start date of the current week (Monday)
function getStartOfWeek(date) {
    let day = date.getDay();
    let diffToMonday = day === 0 ? -6 : 1 - day; // Adjust to Monday (or previous Monday if Sunday)
    let startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() + diffToMonday);
    return startOfWeek;
}

// Get and format the current week's range
let currentWeekStartDate = getStartOfWeek(currentDate);

function formatDate(startDate) {
    return `${startDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })}`
}

// Helper function to format the start and end dates of a week as a range
function formatDateRange(startDate) {
    let endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Set end date to 6 days after start date

    return `${startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`;
}

// Conditionally set the formatted current date for highlighting based on selected year and quarter
let formattedCurrentDate = (currentYear === new Date().getFullYear() && currentQuarter === Math.floor(currentDate.getMonth() / 3) + 1)
    ? formatDate(currentWeekStartDate)
    : formatDate(getStartDateOfWeek(currentYear, (currentQuarter - 1) * 13 + 1));

let previousSelectedCell = null;

// Convert time string to decimal
function timeStringToDecimal(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours + minutes / 60 + seconds / 3600;
}

// Function to update the quarter display
function updateQuarterDisplay() {
    quarterYear.textContent = `${currentYear} Q${currentQuarter}`;
}

// Helper function to get the start date of a specific week number in a given year
function getStartDateOfWeek(year, weekNumber) {
    let jan1 = new Date(year, 0, 1); // January 1st
    let daysOffset = (weekNumber - 1) * 7;
    let weekStartDate = new Date(jan1);
    weekStartDate.setDate(jan1.getDate() + daysOffset);

    // Adjust to the nearest Monday
    while (weekStartDate.getDay() !== 1) {
        weekStartDate.setDate(weekStartDate.getDate() + 1);
    }
    return weekStartDate;
}

// Function to calculate and render weekly insights
function renderWeeklyCalendar() {
    calendar.innerHTML = ""; // Clear previous weekly data
    updateQuarterDisplay();

    // Reset studyData for the new quarter
    studyData = {};

    let startWeek = (currentQuarter - 1) * 13 + 1; // Weeks 1-13 for Q1, 14-26 for Q2, etc.
    let year = currentYear;

    // Calculate the start date for the quarter
    let quarterStartDate = getStartDateOfWeek(year, startWeek);
    let weekStartDate = new Date(quarterStartDate);

    // Special handling for Q1: if Q1 includes the last Monday of the previous year, adjust start date
    if (currentQuarter === 1) {
        const lastMondayOfPreviousYear = getStartDateOfWeek(year - 1, 53); // The last week of the previous year
        if (lastMondayOfPreviousYear.getMonth() === 11) {
            // December
            weekStartDate = lastMondayOfPreviousYear;
        }
    }

    // Fetch all weekly data for the current quarter and year from Firestore
    db.collection("weeks")
        .where(
            "start_date",
            ">=",
            firebase.firestore.Timestamp.fromDate(quarterStartDate)
        )
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                let start_date = data.start_date.toDate();
                let weekStartStr = formatDate(start_date);
                studyData[weekStartStr] = {
                    start_date: start_date,
                    total_week_time: data.total_week_time,
                    week_average: data.week_average,
                };
            });

            showDetails(formattedCurrentDate);

            let row = document.createElement("tr");

            // Loop through each week in the quarter
            for (let week = 0; week < 13; week++) {
                let weekStartStr = formatDate(weekStartDate);

                let cell = document.createElement("td");
                cell.classList = "calendar-cell week";

                // Check if data exists for the current week in studyData
                if (studyData[weekStartStr]) {
                    const totalWeekTime = studyData[weekStartStr].total_week_time;
                    const weekAverage = studyData[weekStartStr].week_average;

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
                    cell.innerHTML = `
                        <p>${weekStartStr} ~ </p>
                        <p>${totalWeekTime}</p>
                    `;
                } else {
                    // Placeholder for weeks with no data
                    cell.innerHTML = `
                        <p>${weekStartStr} ~ </p>
                        <p class='text-transparent'>00:00:00</p>
                    `;
                }

                // Highlight the correct week based on the selected year and quarter
                if (weekStartStr === formattedCurrentDate) {
                    cell.classList.add("current-week");
                    previousSelectedCell = cell;
                }

                cell.addEventListener("click", () => {
                    if (previousSelectedCell)
                        previousSelectedCell.classList.remove("current-week");
                    cell.classList.add("current-week");
                    previousSelectedCell = cell;
                    showDetails(weekStartStr);
                });

                row.appendChild(cell);

                // Check if the row has reached 5 cells
                if (row.children.length === 5) {
                    calendar.appendChild(row);
                    row = document.createElement("tr");
                }

                // Move to the next week
                weekStartDate.setDate(weekStartDate.getDate() + 7);
            }

            // Append any remaining cells if the last row has fewer than 5 cells
            if (row.children.length > 0) {
                calendar.appendChild(row);
            }
        })
        .catch((error) => {
            console.error("Error fetching weekly data: ", error);
        });
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


// Show details for the selected week
function showDetails(weekRangeStr) {
    console.log(weekRangeStr);
    const weekData = studyData[weekRangeStr];
    if (weekData) {
        document.getElementById("weekTitle").textContent = formatDateRange(weekData.start_date);
        document.getElementById("totalWeekTime").textContent = weekData.total_week_time;
        document.getElementById("averageTime").textContent = weekData.week_average;
    } 
    else {
        document.getElementById("weekTitle").textContent = "No data available";
        document.getElementById("totalWeekTime").textContent = "00:00:00";
        document.getElementById("averageTime").textContent = "00:00:00";
    }
}

function writeWeeks() {
    //define a variable for the collection you want to create in Firestore to populate data
    var weeksRef = db.collection("weeks");

    weeksRef.add({
        start_date: firebase.firestore.Timestamp.fromDate(
            new Date("September 30, 2024")
        ),
        total_week_time: "30:36:09",
        week_average: "04:22:18",
    });
    weeksRef.add({
        start_date: firebase.firestore.Timestamp.fromDate(
            new Date("October 7, 2024")
        ),
        total_week_time: "38:38:16",
        week_average: "05:31:10",
    });
    weeksRef.add({
        start_date: firebase.firestore.Timestamp.fromDate(
            new Date("October 14, 2024")
        ),
        total_week_time: "47:04:33",
        week_average: "06:43:30",
    });
    weeksRef.add({
        start_date: firebase.firestore.Timestamp.fromDate(
            new Date("October 21, 2024")
        ),
        total_week_time: "32:31:50",
        week_average: "04:38:50",
    });
    weeksRef.add({
        start_date: firebase.firestore.Timestamp.fromDate(
            new Date("October 28, 2024")
        ),
        total_week_time: "26:29:42",
        week_average: "03:47:06",
    });
    weeksRef.add({
        start_date: firebase.firestore.Timestamp.fromDate(
            new Date("November 4, 2024")
        ),
        total_week_time: "25:50:42",
        week_average: "03:47:50",
    });
}

// writeWeeks();
