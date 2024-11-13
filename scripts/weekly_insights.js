const calendar = document.getElementById("weekly-calendar");
const quarterYear = document.getElementById("quarterYear");
const studyData = {};

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;

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
    for (const key in studyData) {
        delete studyData[key];
    }

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
                const weekStartStr = data.start_date
                    .toDate()
                    .toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                    });
                studyData[weekStartStr] = {
                    total_week_time: data.total_week_time,
                    week_average: data.week_average,
                };
            });

            let row = document.createElement("tr");

            // Loop through each week in the quarter
            for (let week = 0; week < 13; week++) {
                const weekStartStr = `${String(
                    weekStartDate.getMonth() + 1
                ).padStart(2, "0")}/${String(weekStartDate.getDate()).padStart(
                    2,
                    "0"
                )}`;

                let cell = document.createElement("td");
                cell.classList = "calendar-cell week";

                // Check if data exists for the current week in studyData
                if (studyData[weekStartStr]) {
                    const totalWeekTime =
                        studyData[weekStartStr].total_week_time;
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

                    // let hoursDecimal = studyData[date] || 0;
                    // let hours = Math.floor(hoursDecimal);
                    // let minutes = Math.round((hoursDecimal - hours) * 60);

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
        // If moving from Q1 to Q4 of the previous year
        currentQuarter = 4;
        currentYear -= 1;
    }
    renderWeeklyCalendar();
};

document.getElementById("nextQuarter").onclick = () => {
    currentQuarter += 1;
    if (currentQuarter > 4) {
        // If moving from Q4 to Q1 of the next year
        currentQuarter = 1;
        currentYear += 1;
    }
    renderWeeklyCalendar();
};

// Initial render
renderWeeklyCalendar();

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
