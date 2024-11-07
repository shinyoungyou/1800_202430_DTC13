const calendar = document.getElementById("daily-calendar"); // Target the tbody of the calendar table
const monthYear = document.getElementById("monthYear");
const studyData = {
    "2024-11-01": 1.5,
    "2024-11-02": 2.3,
    "2024-11-03": 0.8,
    // Add all dates with their respective hours here
};

let currentDate = new Date();

function renderDailyCalendar() {
    calendar.innerHTML = ""; // Clear the previous calendar content
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let firstDay = new Date(year, month, 1).getDay();

    // Monday is 0, Tuesday is 1, ..., Sunday is 6
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Update the month-year display
    monthYear.textContent = currentDate.toLocaleDateString("en-US", {
        month: "short",
        // year: "numeric",
    });

    let row = document.createElement("tr");

    // Add empty cells for the days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement("td");
        emptyCell.classList.add("empty-cell");
        row.appendChild(emptyCell);
    }

    // Fill in cells with dates and study hours
    for (let day = 1; day <= daysInMonth; day++) {
        if (row.children.length === 7) {
            // If the row has 7 cells, append it to the calendar body and start a new row
            calendar.appendChild(row);
            row = document.createElement("tr");
        }

        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;

        let dataHours = null
        if (studyData[date] > 0 || studyData[date] < 4) {
            dataHours = 0;
        } else if (studyData[date] >= 4 || studyData[date] < 7) {
            dataHours = 4;
        } else if (studyData[date] >= 7 || studyData[date] < 10) {
            dataHours = 7;
        } else if (studyData[date] >= 10){
            dataHours = 10;
        } 

        let hoursDecimal = studyData[date] || 0;
        let hours = Math.floor(hoursDecimal);
        let minutes = Math.round((hoursDecimal - hours) * 60);

        let cell = document.createElement("td");
        cell.classList.add("calendar-cell");
        cell.dataset.hours = dataHours; 
        cell.innerHTML = `
            <p>${day}</p>
            <p>${hours}:${String(minutes).padStart(2, "0")}</p>`;
        row.appendChild(cell);
    }

    // Add any remaining empty cells to complete the last row
    while (row.children.length < 7) {
        const emptyCell = document.createElement("td");
        emptyCell.classList.add("empty-cell");
        row.appendChild(emptyCell);
    }

    // Append the last row to the calendar body
    calendar.appendChild(row);
}

// Month navigation
document.getElementById("prevMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderDailyCalendar();
};

document.getElementById("nextMonth").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderDailyCalendar();
};

renderDailyCalendar(); // Initial render