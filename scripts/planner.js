// Helper function to format time in HH:MM:SS
function formatTime(seconds) {
    console.log(seconds);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}H ${mins}M ${secs}S`;
}

// Helper function to format time in 02:43:56 format
function formatTime2(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
}

// Populate the hours column (00:00 to 23:00)
function populateHourNumbers() {
    const hoursColumn = document.querySelector(".hours-column");
    hoursColumn.innerHTML = ""; // Clear existing content

    for (let i = 0; i < 24; i++) {
        const hourDiv = document.createElement("div");
        hourDiv.textContent = i < 10 ? `${i}` : `${i}`; // e.g., 01:00, 02:00
        hoursColumn.appendChild(hourDiv);
    }
}

// Maintain a global map for cell backgrounds
const cellBackgrounds = {};

// Helper function to manage cell background globally
function updateCellBackground(cell, fillPercentage, subjectColor) {
    const cellId = cell.id;

    // Initialize the cell background if not already set
    if (!cellBackgrounds[cellId]) {
        cellBackgrounds[cellId] = [];
    }

    // Add the new subject's fill percentage and color
    cellBackgrounds[cellId].push({
        percentage: fillPercentage,
        color: subjectColor,
    });

    // Sort by percentage to ensure gradients are applied in order
    cellBackgrounds[cellId].sort((a, b) => a.percentage - b.percentage);

    // Construct the linear-gradient style
    let gradient = cellBackgrounds[cellId]
        .map(
            (entry, index, array) =>
                `${entry.color} ${
                    index > 0 ? array[index - 1].percentage : 0
                }%, ${entry.color} ${entry.percentage}%`
        )
        .join(", ");

    // Apply the gradient to the cell
    cell.style.background = `linear-gradient(to right, ${gradient})`;
    cell.classList.add("filled");
}

// Populate the grid with empty cells (24 rows × 6 columns)
function populateGrid() {
    const grid = document.querySelector(".grid");
    grid.innerHTML = ""; // Clear existing grid content

    // Loop through 24 hours (rows)
    for (let row = 0; row < 24; row++) {
        // Loop through 6 intervals (columns) for each hour
        for (let col = 0; col < 6; col++) {
            const cell = document.createElement("div");
            cell.classList.add("hour");

            // Optionally, add a unique ID for easier manipulation
            cell.id = `row-${row}-col-${col}`;

            grid.appendChild(cell);
        }
    }
}

// Fill the grid dynamically based on timeline data
function fillGrid(startTime, endTime, subjectColor) {
    console.log("Start Time:", startTime, "End Time:", endTime, "Subject Color:", subjectColor);
    const grid = document.querySelector(".grid");

    // Calculate start and end indices
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const startRow = startHour;
    const startCol = Math.floor(startMinutes / 10); // Column index (0-5)
    const startRemainder = startMinutes % 10; // Minutes within the starting interval

    const endHour = endTime.getHours();
    const endMinutes = endTime.getMinutes();
    const endRow = endHour;
    const endCol = Math.floor(endMinutes / 10); // Column index (0-5)
    const endRemainder = endMinutes % 10; // Minutes within the ending interval

    // Ensure the grid is populated
    for (let row = 0; row < 24; row++) {
        for (let col = 0; col < 6; col++) {
            const cellId = `row-${row}-col-${col}`;
            let cell = document.getElementById(cellId);

            // If the cell doesn't exist, create and append it
            if (!cell) {
                cell = document.createElement("div");
                cell.classList.add("hour");
                cell.id = cellId;
                grid.appendChild(cell);
            }

            // Check if this cell falls within the start and end range
            if (
                (row > startRow || (row === startRow && col >= startCol)) &&
                (row < endRow || (row === endRow && col <= endCol))
            ) {
                // Calculate fill percentage for partial blocks
                let fillPercentage = 100; // Default to fully filled
                if (row === startRow && col === startCol) {
                    // Starting block: Fill proportionally based on start minutes
                    fillPercentage = ((10 - startRemainder) / 10) * 100;
                } else if (row === endRow && col === endCol) {
                    // Ending block: Fill proportionally based on end minutes
                    fillPercentage = (endRemainder / 10) * 100;
                }

                // Update the cell background globally
                updateCellBackground(cell, fillPercentage, subjectColor);
            }
        }
    }
}


function firestoreTimestampToDate(timestamp) {
    return new Date(
        timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000)
    );
}


// Main function to display today's subjects and timelines
async function displayTodaySubjectsDynamically() {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0)); // Midnight of today
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999)); // End of today

    try {
        // Query the days collection for today's date
        const daysRef = db.collection("days");
        const dayQuery = await daysRef
            .where("date", ">=", startOfDay)
            .where("date", "<=", endOfDay)
            .get();

        if (!dayQuery.empty) {
            const dayDoc = dayQuery.docs[0]; // Assume there's only one matching day document
            const dayData = dayDoc.data();

            // Update the total time in the header
            document.querySelector("h4 span:nth-child(2)").innerText =
                formatTime(dayData.total_time);

            // Get the studied_subjects subcollection
            const studiedSubjectsRef =
                dayDoc.ref.collection("studied_subjects");
            const studiedSubjectsQuery = await studiedSubjectsRef.get();

            const subjectsContainer =
                document.getElementById("subjects-go-here");
            subjectsContainer.innerHTML = ""; // Clear previous content

            const gridContainer = document.querySelector(".grid");
            gridContainer.innerHTML = ""; // Clear previous timelines

            studiedSubjectsQuery.forEach(async (subjectDoc) => {
                const subjectData = subjectDoc.data();

                // Clone and populate the subject list template
                const template = document.getElementById("subjectListTemplate");
                const clone = template.content.cloneNode(true);

                clone.querySelector("#subjectName").innerText =
                    subjectData.name;
                clone.querySelector("#totalSubjectTime").innerText =
                    formatTime2(subjectData.total_time);
                clone.querySelector("#subjectColor").style.color =
                    subjectData.color; // Default color if not specified
                subjectsContainer.appendChild(clone);

                // Get the timelines subcollection
                const timelinesRef = subjectDoc.ref.collection("timelines");
                const timelinesQuery = await timelinesRef.get();

                timelinesQuery.forEach((timelineDoc) => {
                    const timelineData = timelineDoc.data();
                    console.log(timelineData.start);
                    const startTime = firestoreTimestampToDate(
                        timelineData.start
                    );
                    const endTime = firestoreTimestampToDate(
                        timelineData.end
                    );

                    // Fill the grid based on start and end times
                    fillGrid(startTime, endTime, subjectData.color);
                });
            });
        } else {
            console.log("No data found for today.");
        }
    } catch (error) {
        console.error("Error fetching today's data:", error);
    }
}

// Call initialization functions
populateHourNumbers();
populateGrid();
displayTodaySubjectsDynamically();
