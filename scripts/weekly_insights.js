const calendar = document.getElementById("weekly-calendar");
const quarterYear = document.getElementById("quarterYear");
const studyData = {
    "2024-11-01": 1.5,
    "2024-11-02": 2.3,
    "2024-11-03": 0.8,
    // Add all dates with their respective hours here
};

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;

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

    let startWeek = (currentQuarter - 1) * 13 + 1; // Weeks 1-13 for Q1, 14-26 for Q2, etc.
    let year = currentDate.getFullYear();

    let weekStartDate = getStartDateOfWeek(year, startWeek); // Helper function to get the date for the start of a specific week
    let weekEndDate = new Date(weekStartDate);

    let row = document.createElement("tr"); // Start a new row for the calendar

    // Loop for each of the 13 weeks in the current quarter
    for (let week = 0; week < 13; week++) {
        let totalHoursDecimal = 0;

        // Calculate end of the week (Sunday)
        weekEndDate.setDate(weekStartDate.getDate() + 6);

        // Loop through each day in the current week
        for (
            let day = new Date(weekStartDate);
            day <= weekEndDate;
            day.setDate(day.getDate() + 1)
        ) {
            if (day.getMonth() !== currentDate.getMonth()) break; // Stop if day is outside the current month

            const dateKey = `${day.getFullYear()}-${String(
                day.getMonth() + 1
            ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const hoursDecimal = studyData[dateKey] || 0;

            totalHoursDecimal += hoursDecimal;
        }

        const totalHours = Math.floor(totalHoursDecimal);
        const totalMinutes = Math.round((totalHoursDecimal - totalHours) * 60);

        // Format week dates
        const weekStartStr = `${String(weekStartDate.getMonth() + 1).padStart(2,"0"
        )}/${String(weekStartDate.getDate()).padStart(2, "0")}`;

        // Create cell for the current week
        let cell = document.createElement("td");
        cell.innerHTML = `
            <p>${weekStartStr} ~ </p>
            <p>${totalHours}:${String(totalMinutes).padStart(2, "0")}</p>
        `;
        row.appendChild(cell);

        // Check if the row has reached 5 cells
        if (row.children.length === 5) {
            // Append the row to the calendar body and start a new row
            calendar.appendChild(row);
            row = document.createElement("tr");
        }

        // Move to the next week
        weekStartDate.setDate(weekStartDate.getDate() + 7);
        weekEndDate.setDate(weekEndDate.getDate() + 7);
    }

    // Append any remaining cells if the last row has fewer than 5 cells
    if (row.children.length > 0) {
        calendar.appendChild(row);
    }
}

// Quarter navigation
document.getElementById("prevQuarter").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 3);
    currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    renderWeeklyCalendar();
};

document.getElementById("nextQuarter").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 3);
    currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    renderWeeklyCalendar();
};

// Initial render
renderWeeklyCalendar();