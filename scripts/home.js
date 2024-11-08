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
                //iterate thru each doc
                var subject_name = doc.data().name; // get value of the "name" key
                var total_subject_time = doc.data().total_subject_time; // get value of the "total_subject_time" key
                var subject_color = doc.data().color; //get value of the "color" key
                let newList = subjectTemplate.content.cloneNode(true);
     
                newList.querySelector("#subjectName").appendChild(document.createTextNode(subject_name));
                newList.querySelector('#totalSubjectTime').innerHTML = total_subject_time;
                newList.querySelector('#subjectColor').style.color = subject_color; 
                // newList.querySelector('#subjectColor').classList.add(`text-${subject_color}-500`); 
                
                document.getElementById(collection + "-go-here").appendChild(newList);
            });
        })
}
displaySubjectsDynamically("subjects"); //input param is the name of the collection

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
        color: "purple",
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
        name: "COMM1116",
        total_subject_time: "00:00:00",
        color: "pink",
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
    });
    subjectsRef.add({
        name: "COMP1113",
        total_subject_time: "00:00:00",
        color: "chartreuse",
        date: firebase.firestore.Timestamp.fromDate(
            new Date("September 27, 2024")
        ),
    });
}

//  writeSubjects()
