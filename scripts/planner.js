// Helper function to format time in HH:MM:SS
function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}H ${mins}M ${secs}S`;
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
                clone.querySelector("#totalSubjectTime").innerText = formatTime(
                    subjectData.total_time
                );
                clone.querySelector("#subjectColor").style.color =
                    subjectData.color; // Set a default color or dynamic if needed
                subjectsContainer.appendChild(clone);

                // Get the timelines subcollection
                const timelinesRef = subjectDoc.ref.collection("timelines");
                const timelinesQuery = await timelinesRef.get();

                timelinesQuery.forEach((timelineDoc) => {
                    const timelineData = timelineDoc.data();
                    const startTime = new Date(timelineData.start);
                    const endTime = new Date(timelineData.end);

                    // Convert start and end times to grid representation
                    const startHour = startTime.getHours();
                    const startMinutes = startTime.getMinutes();
                    const endHour = endTime.getHours();
                    const endMinutes = endTime.getMinutes();

                    // Render each timeline as yellow blocks
                    for (let hour = startHour; hour <= endHour; hour++) {
                        const hourBlock = document.createElement("div");
                        hourBlock.classList.add("hour", "filled");
                        if (hour === startHour && hour === endHour) {
                            // Partial block for the start and end hour
                            hourBlock.style.gridRow = `${
                                (startMinutes / 60) * 100
                            }% / ${(endMinutes / 60) * 100}%`;
                        }
                        gridContainer.appendChild(hourBlock);
                    }
                });
            });
        } else {
            console.log("No data found for today.");
        }
    } catch (error) {
        console.error("Error fetching today's data:", error);
    }
}

// Call the main function
displayTodaySubjectsDynamically();
