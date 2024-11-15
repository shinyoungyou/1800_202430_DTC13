//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displaySubjectsDynamically(collection) {
    let subjectTemplate = document.getElementById("subjectListTemplate"); // Retrieve the HTML element with the ID "subjectTemplate" and store it in the cardTemplate variable.

    db.collection(collection)
        .get() //the collection called "hikes"
        .then((allSubjects) => {
            allSubjects.forEach((doc) => {
                console.log(doc);
                var subject_id = doc.id;
                //iterate thru each doc
                var subject_name = doc.data().name; // get value of the "name" key
                var total_subject_time = doc.data().total_subject_time; // get value of the "total_subject_time" key
                var subject_color = doc.data().color; //get value of the "color" key
                let newList = subjectTemplate.content.cloneNode(true);

                newList
                    .querySelector("#subjectName")
                    .appendChild(document.createTextNode(subject_name));
                newList.querySelector("#totalSubjectTime").innerHTML =
                    total_subject_time;
                newList.querySelector("#subjectColor").style.color =
                    subject_color;
                newList.querySelector("button").id = subject_id;
                // newList.querySelector('#subjectColor').classList.add(`text-${subject_color}-500`);

                document
                    .getElementById(collection + "-go-here")
                    .appendChild(newList);
            });
        });
}
displaySubjectsDynamically("subjects"); //input param is the name of the collection

let addSubjectForm = document.getElementById("addSubjectForm");

document.getElementById("addSubjectBtn").onclick = () => {
    addSubjectForm.classList.remove("hidden"); // Show form
};

document.getElementById("cancel").onclick = () => {
    addSubjectForm.classList.add("hidden"); // Show form
};

function addSubject() {
    console.log("inside add subject");
    let subject_name = document.getElementById("subject_name").value;
    let subject_color = document.getElementById("subject_color").value;

    console.log(
        subject_name,
        subject_color,
    );

    var user = firebase.auth().currentUser;
    if (user) {
        var currentUser = db.collection("users").doc(user.uid);
        var userID = user.uid;

        // Get the document for the current user.
        db.collection("subjects")
            .add({
                name: subject_name,
                color: subject_color,
                total_subject_time: "00:00:00"
            })
            .then(() => {
                window.location.href = "home.html"; // Redirect to the thanks page
            });
    } else {
        console.log("No user is signed in");
        window.location.href = "home.html";
    }
}

let updateSubject = document.getElementById("updateSubject");

let subject_id_to_update = null;
function openSubjectModal(event) {
    subject_id_to_update = event.currentTarget.id;
    console.log(event.currentTarget.id);
    updateSubject.classList.remove("hidden"); // Show form
}

function closeSubjectModal() {
    updateSubject.classList.add("hidden"); // Show form
    subject_id_to_update = null;
}

let editSubjectForm = document.getElementById("editSubjectForm");

function openEditSubject() {
    editSubjectForm.classList.remove("hidden"); // Show form
    updateSubject.classList.add("hidden"); // Show form
    // Reference to the Firestore document
    let subjectRef = db.collection("subjects").doc(subject_id_to_update);

    // Fetch the document data
    subjectRef
        .get()
        .then((doc) => {
            if (doc.exists) {
                let subjectData = doc.data();
                console.log(subjectData);

                // Set the input values with the retrieved data
                document.getElementById("edit_subject_name").value =
                    subjectData.name;
                document.getElementById("edit_subject_color").value =
                    subjectData.color;
            } else {
                console.error("No such document!");
            }
        })
}

function editSubject(event) {
    event.preventDefault();
    let updatedName = document.getElementById("edit_subject_name").value;
    let updatedColor = document.getElementById("edit_subject_color").value;

    // Reference to the Firestore document
    let subjectRef = db.collection("subjects").doc(subject_id_to_update);
    console.log(subjectRef);
    // Update the document with new data
    subjectRef
        .update({
            name: updatedName,
            color: updatedColor,
        })
        .then(() => {
            console.log("asdf");
            window.location.href = "home.html"; // Redirect to the thanks page
            console.log("Subject successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
}

document.getElementById("editCancel").onclick = () => {
    editSubjectForm.classList.add("hidden"); // Show form
};

function writeSubjects() {
    //define a variable for the collection you want to create in Firestore to populate data
    var subjectsRef = db.collection("subjects");

    subjectsRef.add({
        name: "COMP1800",
        total_subject_time: "02:06:25",
        color: "#FFFF00",
    });
    subjectsRef.add({
        name: "COMP1510",
        total_subject_time: "00:00:00",
        color: "#0000FF",
    });
    subjectsRef.add({
        name: "COMP1712",
        total_subject_time: "01:30:46",
        color: "#800080",
    });
    subjectsRef.add({
        name: "COMP1537",
        total_subject_time: "00:00:00",
        color: "#FF0000",
    });
    subjectsRef.add({
        name: "COMM1116",
        total_subject_time: "00:00:00",
        color: "#FFC0CB",
    });
    subjectsRef.add({
        name: "COMP1113",
        total_subject_time: "00:00:00",
        color: "#7FFF00",
    });
}

//  writeSubjects()
