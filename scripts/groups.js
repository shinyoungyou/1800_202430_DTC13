//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayMyGroupsDynamically(collection) {
    let groupTemplate = document.getElementById("groupListTemplate"); // Retrieve the HTML element with the ID "groupTemplate" and store it in the cardTemplate variable.

    db.collection(collection)
        .get() //the collection called "hikes"
        .then((allSubjects) => {
            allSubjects.forEach((doc) => {
                console.log(doc);
                //iterate thru each doc
                var subject_name = doc.data().name; // get value of the "name" key
                var number_of_members = doc.data().number_of_members; // get value of the "number_of_members" key
                var created_by = doc.data().created_by; // get value of the "created_by" key
                var is_my_group = doc.data().is_my_group; // get value of the "is_my_group" key
                let newList = groupTemplate.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                if (is_my_group) {
                    newList.querySelector("#groupName").innerHTML = subject_name;
                    let NumberOfMembersAndCreatedBy = `${number_of_members}/50 person • ${created_by}`;
                    newList.querySelector("#groupNumberOfMembersAndCreatedBy").innerHTML = NumberOfMembersAndCreatedBy;

                    document.getElementById(collection + "-go-here").appendChild(newList);
                }
            });
        });
}
displayMyGroupsDynamically("groups"); //input param is the name of the collection

function writeGroups() {
    //define a variable for the collection you want to create in Firestore to populate data
    var groupsRef = db.collection("groups");

    groupsRef.add({
        name: "Group 1",
        number_of_members: 26,
        created_by: "Maria",
        is_my_group : true,
    });
    groupsRef.add({
        name: "Group 2",
        number_of_members: 44,
        created_by: "Kiana",
        is_my_group : true,
    });
    groupsRef.add({
        name: "Group 3",
        number_of_members: 50,
        created_by: "Shinyoung",
        is_my_group : true,
    });
    groupsRef.add({
        name: "Group 4",
        number_of_members: 27,
        created_by: "Raman",
        is_my_group : true,
    });
    groupsRef.add({
        name: "Group A",
        number_of_members: 30,
        created_by: "Emily",
        is_my_group : false,
    });
    groupsRef.add({
        name: "Group B",
        number_of_members: 33,
        created_by: "Sarah",
        is_my_group : false,
    });
    groupsRef.add({
        name: "Group C",
        number_of_members: 20,
        created_by: "Michael",
        is_my_group : false,
    });

    groupsRef.add({
        name: "Group D",
        number_of_members: 45,
        created_by: "Noah",
        is_my_group : false,
    });

    groupsRef.add({
        name: "Group E",
        number_of_members: 47,
        created_by: "Benjamin",
        is_my_group : false,
    });
}

// writeGroups()