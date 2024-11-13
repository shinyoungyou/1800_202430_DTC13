const calendar = document.getElementById("daily-calendar"); // Target the tbody of the calendar table
const monthYear = document.getElementById("monthYear");

let currentDate = new Date();
let studyData = {}; // Object to hold Firestore data

function timeStringToDecimal(timeString) {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours + minutes / 60 + seconds / 3600;
}

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

        let date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;
        let dayData = studyData[date];

        let cell = document.createElement("td");
        cell.classList.add("calendar-cell");

        if (dayData) {
            let totalDayTimeDecimal = timeStringToDecimal(
                dayData.total_day_time
            );
            console.log(totalDayTimeDecimal);

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

            // let hoursDecimal = studyData[date] || 0;
            // let hours = Math.floor(hoursDecimal);
            // let minutes = Math.round((hoursDecimal - hours) * 60);

            cell.dataset.hours = dataHours;
            cell.innerHTML = `
                            <p>${day}</p>
                            <p>${dayData.total_day_time.slice(0, 5)}</p>`;
        } else {
            cell.innerHTML = `
                            <p>${day}</p>
                            <p class='text-transparent'>00:00</p>`;
        }
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

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCalendarDynamically(collection) {
    db.collection(collection)
        .get() //the collection called "days"
        .then((allDays) => {
            studyData = {}; // Clear previous data

            allDays.forEach((doc) => {
                //iterate thru each doc
                var date = doc.data().date.toDate(); // get value of the "date" key
                var formattedDate = `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                var total_day_time = doc.data().total_day_time; // get value of the "total_day_time" key
                var max_focus = doc.data().max_focus; // get value of the "max_focus" key
                var started = doc.data().started
                    ? doc.data().started.toDate()
                    : ""; // get value of the "started" key
                var finished = doc.data().finished
                    ? doc.data().finished.toDate()
                    : ""; // get value of the "finished" key
                var docID = doc.id;

                // Add data to studyData object
                studyData[formattedDate] = {
                    total_day_time,
                    max_focus,
                    started,
                    finished,
                };

                //update calendar
            });
            console.log("studyData", studyData);
        });
}

displayCalendarDynamically("days"); //input param is the name of the collection

function writeDays() {
    //define a variable for the collection you want to create in Firestore to populate data
    var daysRef = db.collection("days");

    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 1, 2024")),
    //     total_day_time: "00:00:00",
    //     max_focus: "",
    //     started: "",
    //     finished: ""
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 2, 2024")
    //     ),
    //     total_day_time: "00:00:00",
    //     max_focus: "",
    //     started: "",
    //     finished: "",
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 3, 2024")
    //     ),
    //     total_day_time: "00:00:00",
    //     max_focus: "",
    //     started: "",
    //     finished: "",
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 4, 2024")
    //     ),
    //     total_day_time: "00:00:00",
    //     max_focus: "",
    //     started: "",
    //     finished: "",
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 5, 2024")
    //     ),
    //     total_day_time: "00:00:00",
    //     max_focus: "",
    //     started: "",
    //     finished: "",
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 6, 2024")
    //     ),
    //     total_day_time: "00:37:43",
    //     max_focus: "00:25:57",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 6, 2024 04:23:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 6, 2024 05:07:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 7, 2024")
    //     ),
    //     total_day_time: "03:50:17",
    //     max_focus: "00:58:18",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 7, 2024 07:14:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 7, 2024 18:13:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 8, 2024")
    //     ),
    //     total_day_time: "07:13:59",
    //     max_focus: "01:44:34",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 8, 2024 08:21:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 8, 2024 22:58:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 9, 2024")
    //     ),
    //     total_day_time: "06:42:10",
    //     max_focus: "01:18:35",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 9, 2024 08:08:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 9, 2024 22:57:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 10, 2024")
    //     ),
    //     total_day_time: "03:26:44",
    //     max_focus: "01:45:30",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 10, 2024 05:51:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 10, 2024 23:08:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 11, 2024")
    //     ),
    //     total_day_time: "05:05:13",
    //     max_focus: "03:02:09",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 11, 2024 05:53:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 12, 2024 00:29:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 12, 2024")
    //     ),
    //     total_day_time: "00:52:25",
    //     max_focus: "00:52:25",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 12, 2024 00:28:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 12, 2024 01:20:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 13, 2024")
    //     ),
    //     total_day_time: "05:03:48",
    //     max_focus: "01:38:55",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 13, 2024 09:14:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 13, 2024 23:59:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 14, 2024")
    //     ),
    //     total_day_time: "08:42:35",
    //     max_focus: "02:01:27",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 14, 2024 09:03:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 15, 2024 00:40:00")
    //     ),
    // });
    // daysRef.add({
    //     date: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 15, 2024")
    //     ),
    //     total_day_time: "08:39:31",
    //     max_focus: "03:01:27",
    //     started: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 15, 2024 08:42:00")
    //     ),
    //     finished: firebase.firestore.Timestamp.fromDate(
    //         new Date("September 15, 2024 22:45:00")
    //     ),
    // });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 16, 2024")
        ),
        total_day_time: "11:15:11",
        max_focus: "01:34:32",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 16, 2024 08:23:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 17, 2024 00:30:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 17, 2024")
        ),
        total_day_time: "02:25:48",
        max_focus: "01:26:01",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 17, 2024 18:35:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 17, 2024 21:59:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 18, 2024")
        ),
        total_day_time: "03:33:01",
        max_focus: "01:33:48",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 18, 2024 19:05:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 18, 2024 22:39:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 19, 2024")
        ),
        total_day_time: "01:08:00",
        max_focus: "00:41:00",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 19, 2024 20:12:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 19, 2024 22:18:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 20, 2024")
        ),
        total_day_time: "02:57:17",
        max_focus: "01:48:06",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 20, 2024 06:40:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 20, 2024 23:04:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 21, 2024")
        ),
        total_day_time: "06:00:06",
        max_focus: "02:02:13",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 21, 2024 09:35:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 22, 2024 00:15:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 22, 2024")
        ),
        total_day_time: "11:30:00",
        max_focus: "01:56:17",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 22, 2024 08:37:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 22, 2024 23:29:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 23, 2024")
        ),
        total_day_time: "06:17:24",
        max_focus: "01:41:13",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 23, 2024 08:49:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 24, 2024 00:38:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 24, 2024")
        ),
        total_day_time: "02:58:39",
        max_focus: "01:05:12",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 24, 2024 07:21:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 24, 2024 22:22:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 25, 2024")
        ),
        total_day_time: "01:47:29",
        max_focus: "00:43:53",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 25, 2024 07:26:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 26, 2024 00:54:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 26, 2024")
        ),
        total_day_time: "07:56:26",
        max_focus: "03:34:58",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 26, 2024 07:24:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 26, 2024 23:31:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
        total_day_time: "03:19:21",
        max_focus: "01:24:03",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024 19:01:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 28, 2024 00:18:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 28, 2024")
        ),
        total_day_time: "09:36:21",
        max_focus: "02:30:43",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 28, 2024 07:35:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 28, 2024 21:14:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 29, 2024")
        ),
        total_day_time: "09:53:45",
        max_focus: "02:42:33",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 29, 2024 20:35:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 30, 2024 00:39:00")
        ),
    });
    daysRef.add({
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 30, 2024")
        ),
        total_day_time: "05:33:38",
        max_focus: "02:16:44",
        started: firebase.firestore.Timestamp.fromDate(
            new Date("September 30, 2024 08:48:00")
        ),
        finished: firebase.firestore.Timestamp.fromDate(
            new Date("September 30, 2024 23:55:00")
        ),
    });
}

// writeDays();
