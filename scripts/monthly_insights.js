const calendar = document.getElementById("monthly-calendar"); // Target the table body for the monthly calendar
const yearDisplay = document.getElementById("yearDisplay");
let studyData = {}; // Object to hold Firestore data for each month

let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let formattedCurrentMonth = currentDate.getMonth(); // Only use this for the current year

let previousSelectedCell = null; // To store the last selected cell

// Convert time string to decimal
function timeStringToDecimal(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours + minutes / 60 + seconds / 3600;
}

// Function to render the monthly insights
function renderMonthlyCalendar() {
    calendar.innerHTML = ""; // Clear previous content
    yearDisplay.textContent = currentYear; // Update the year display

    // Clear studyData from previous year
    studyData = {};

    // Determine the month to highlight
    let highlightedMonth =
        currentYear === new Date().getFullYear()
            ? formattedCurrentMonth // Current month for the current year
            : 0; // Default to January for other years

    // Fetch all monthly data for the current year from Firestore
    db.collection("months")
        .where(
            "first_date",
            ">=",
            firebase.firestore.Timestamp.fromDate(
                new Date(`${currentYear}-01-01`)
            )
        )
        .where(
            "first_date",
            "<=",
            firebase.firestore.Timestamp.fromDate(
                new Date(`${currentYear}-12-31`)
            )
        )
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const firstDate = data.first_date.toDate();
                const monthIndex = firstDate.getMonth(); // 0 for Jan, 1 for Feb, etc.

                studyData[monthIndex] = {
                    firstDate: firstDate,
                    total_month_time: data.total_month_time,
                    month_average: data.month_average,
                };
            });

            let row = document.createElement("tr");

            showDetails(formattedCurrentMonth);

            // Loop through each month
            for (let month = 0; month < 12; month++) {
                let cell = document.createElement("td");
                cell.classList.add("calendar-cell", "month");

                // Check if data exists for the month
                if (studyData[month]) {
                    const totalMonthTime = studyData[month].total_month_time;
                    // const monthAverage = studyData[month].month_average;

                    let totalMonthTimeDecimal =
                        timeStringToDecimal(totalMonthTime);

                    let dataHours = null;
                    if (
                        totalMonthTimeDecimal > 0 &&
                        totalMonthTimeDecimal < 90
                    ) {
                        dataHours = 0;
                    } else if (
                        totalMonthTimeDecimal >= 90 &&
                        totalMonthTimeDecimal < 150
                    ) {
                        dataHours = 4;
                    } else if (totalMonthTimeDecimal >= 150) {
                        dataHours = 7;
                    }

                    cell.dataset.hours = dataHours;
                    cell.innerHTML = `
                        <p>${new Date(currentYear, month).toLocaleString(
                            "en-US",
                            { month: "short" }
                        )}</p>
                        <p>${totalMonthTime}</p>
                    `;
                } else {
                    cell.innerHTML = `
                        <p>${new Date(currentYear, month).toLocaleString(
                            "en-US",
                            { month: "short" }
                        )}</p>
                        <p class="text-transparent">00:00:00</p>
                    `;
                }

                // Highlight the correct month
                if (month === highlightedMonth) {
                    cell.classList.add("current-month");
                    previousSelectedCell = cell;
                }

                cell.addEventListener("click", () => {
                    if (previousSelectedCell) {
                        previousSelectedCell.classList.remove("current-month");
                    }
                    cell.classList.add("current-month");
                    previousSelectedCell = cell;
                    showDetails(month);
                });

                row.appendChild(cell);

                // Check if the row has reached 5 cells
                if (row.children.length === 4) {
                    calendar.appendChild(row);
                    row = document.createElement("tr");
                }
            }

            // Append any remaining cells if the last row has fewer than 5 cells
            if (row.children.length > 0) {
                calendar.appendChild(row);
            }
        })
        .catch((error) => {
            console.error("Error fetching monthly data: ", error);
        });
}

// Show details for the selected month
function showDetails(month) {
    const monthData = studyData[month];
    if (monthData != null) {
        document.getElementById("monthTitle").textContent = new Date(
            currentYear,
            month
        ).toLocaleString("en-US", { month: "long", year: "numeric" });
        document.getElementById("totalMonthTime").textContent =
            monthData.total_month_time;
        document.getElementById("averageTime").textContent =
            monthData.month_average;
    } else {
        document.getElementById("monthTitle").textContent = "No data available";
        document.getElementById("totalMonthTime").textContent = "00:00:00";
        document.getElementById("averageTime").textContent = "00:00:00";
    }
}

// Year navigation
document.getElementById("prevYear").onclick = () => {
    currentYear -= 1;
    renderMonthlyCalendar();
};

document.getElementById("nextYear").onclick = () => {
    currentYear += 1;
    renderMonthlyCalendar();
};

// Initial render
renderMonthlyCalendar();

function writeMonths() {
    //define a variable for the collection you want to create in Firestore to populate data
    var monthsRef = db.collection("months");

    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("January 1, 2024")
        ),
        total_month_time: "94:32:25",
        month_average: "03:15:36",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("February 1, 2024")
        ),
        total_month_time: "111:33:14",
        month_average: "04:51:00",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("March 1, 2024")
        ),
        total_month_time: "97:17:40",
        month_average: "03:53:30",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("April 1, 2024")
        ),
        total_month_time: "119:28:12",
        month_average: "05:11:39",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("May 1, 2024")
        ),
        total_month_time: "111:55:24",
        month_average: "04:08:43",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("June 1, 2024")
        ),
        total_month_time: "47:36:05",
        month_average: "02:16:00",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("July 1, 2024")
        ),
        total_month_time: "70:24:49",
        month_average: "02:30:53",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("August 1, 2024")
        ),
        total_month_time: "93:20:16",
        month_average: "04:03:29",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("September 1, 2024")
        ),
        total_month_time: "136:27:01",
        month_average: "05:27:28",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("October 1, 2024")
        ),
        total_month_time: "157:44:05",
        month_average: "05:05:17",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("November 1, 2024")
        ),
        total_month_time: "13:37:28",
        month_average: "04:32:25",
    });
    monthsRef.add({
        first_date: firebase.firestore.Timestamp.fromDate(
            new Date("December 1, 2024")
        ),
        total_month_time: "00:00:00",
        month_average: "00:00:00",
    });
}

// writeMonths();
