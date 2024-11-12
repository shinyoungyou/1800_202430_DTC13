//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayCardsDynamically(collection) {
    let cardTemplate = document.getElementById("subjectCardTemplate"); // Retrieve the HTML element with the ID "subjectCardTemplate" and store it in the cardTemplate variable.
    db.collection(collection)
        .get() //the collection called "hikes"
        .then((allSubjects) => {
            //var i = 1;  //Optional: if you want to have a unique ID for each hike
            allSubjects.forEach((doc) => {
                //iterate thru each doc
                var name = doc.data().name; // get value of the "name" key
                var total_subject_time = doc.data().total_subject_time; // get value of the "details" key
                var color = doc.data().color; //get unique ID to each hike to be used for fetching right image
                let newcard = cardTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.
                //i++;   //Optional: iterate variable to serve as unique ID
            });
        })
        .catch((error) => {
            console.error("Error displaying subjects:", error);
        });
}
displayCardsDynamically("subjects"); //input param is the name of the collection
function writeSubjects() {

    //define a variable for the collection you want to create in Firestore to populate data
    var subjectsRef = db.collection("subjects");

    subjectsRef.add({
        name: "COMP1800",
        total_subject_time: "02:06:25",
        color: "yellow",
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
    });
    subjectsRef.add({
        name: "COMP1510",
        total_subject_time: "00:00:00",
        color: "blue",
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
    });
    subjectsRef.add({
        name: "COMP1712",
        total_subject_time: "01:30:46",
        color:"purple",
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
    });
    subjectsRef.add({
        name: "COMP1537",
        total_subject_time: "00:00:00",
        color: "red",
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
    });
    subjectsRef.add({
        name: "COMP1116",
        total_subject_time: "00:00:00",
        color: "pink",
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
    });
    subjectsRef.add({
        name: "COMP1113",
        total_subject_time: "00:00:00",
        color: "mint",
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
    });
}
// writeSubjects()