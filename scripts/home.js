function writeSubjects() {
    // Define a variable for the collection you want to create in Firestore to populate data
    var subjectsRef = db.collection("subjects");

    subjectsRef.add({
        name: "COMP1800",
        total_subject_time: "01:30:46",
        color: " ",
        timelines: "",
        todos: ""
    });

    subjectsRef.add({
        name: "COMP1712",
        total_subject_time: "01:30:46",
        color: " ",
        timelines: "",
        todos: ""
    });

    subjectsRef.add({
        name: "COMP1537",
        total_subject_time: "01:30:46",
        color: " ",
        timelines: "",
        todos: ""
    });

    subjectsRef.add({
        name: "COMP1116",
        total_subject_time: "01:30:46",
        color: " ",
        timelines: "",
        todos: ""
    });
}

function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("subjectCardTemplate");

    db.collection(collection).get().then(allSubjects => {
        allSubjects.forEach(doc => {
            var name = doc.data().name;
            var total_subject_time = doc.data().total_subject_time;
            var color = doc.data().color;

            let newcard = cardTemplate.content.cloneNode(true);

            // Update the card with the data
            newcard.querySelector('.subject-name').innerText = name;
            newcard.querySelector('.subject-time').innerText = total_subject_time;
            newcard.querySelector('.subject-color').style.backgroundColor = color;

            // Append the new card to the card container
            document.getElementById("cardContainer").appendChild(newcard);
        });
    }).catch(error => {
        console.error("Error displaying subjects:", error);
    });
}

// Call the function to display cards dynamically
displayCardsDynamically("subjects");
