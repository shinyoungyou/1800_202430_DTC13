//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
function displayMyGroupsDynamically(collection) {
    let groupTemplate = document.getElementById("groupListTemplate"); // Retrieve the HTML element with the ID "groupTemplate" and store it in the cardTemplate variable.
    let newGroupTemplate = document.getElementById("newGroupListTemplate"); // Retrieve the HTML element with the ID "groupTemplate" and store it in the cardTemplate variable.
    db.collection(collection)
        .get() //the collection called "Groups"
        .then((allSubjects) => {
            allSubjects.forEach((doc) => {
                console.log(doc);
                //iterate thru each doc
                var subject_name = doc.data().name; // get value of the "name" key
                var number_of_members = doc.data().number_of_members; // get value of the "number_of_members" key
                var created_by = doc.data().created_by; // get value of the "created_by" key
                var is_my_group = doc.data().is_my_group; // get value of the "is_my_group" key

                let newList = groupTemplate?.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.
                let newGroupList = newGroupTemplate?.content.cloneNode(true); // Clone the HTML template to create a new card (newcard) that will be filled with Firestore data.

                if (is_my_group && newList) {
                    newList.querySelector("#groupName").innerHTML =
                        subject_name;
                    let NumberOfMembersAndCreatedBy = `${number_of_members}/50 person • ${created_by}`;
                    newList.querySelector(
                        "#groupNumberOfMembersAndCreatedBy"
                    ).innerHTML = NumberOfMembersAndCreatedBy;

                    document
                        .getElementById(collection + "-go-here")
                        .appendChild(newList);
                } else if (!is_my_group && newGroupList) {
                    // show this data on new groupos
                    console.log(newGroupList);
                    newGroupList.querySelector("#groupName").innerHTML =
                        subject_name;
                    let NumberOfMembersAndCreatedBy = `${number_of_members}/50 person • ${created_by}`;
                    newGroupList.querySelector(
                         "#groupNumberOfMembersAndCreatedBy"
                    ).innerHTML = NumberOfMembersAndCreatedBy;

                    document
                        .getElementById(collection + "-go-here")
                        .appendChild(newGroupList);
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
        is_my_group: true,
    });
    groupsRef.add({
        name: "Group 2",
        number_of_members: 44,
        created_by: "Kiana",
        is_my_group: true,
    });
    groupsRef.add({
        name: "Group 3",
        number_of_members: 50,
        created_by: "Shinyoung",
        is_my_group: true,
    });
    groupsRef.add({
        name: "Group 4",
        number_of_members: 27,
        created_by: "Raman",
        is_my_group: true,
    });
    groupsRef.add({
        name: "Group A",
        number_of_members: 30,
        created_by: "Emily",
        is_my_group: false,
    });
    groupsRef.add({
        name: "Group B",
        number_of_members: 33,
        created_by: "Sarah",
        is_my_group: false,
    });
    groupsRef.add({
        name: "Group C",
        number_of_members: 20,
        created_by: "Michael",
        is_my_group: false,
    });

    groupsRef.add({
        name: "Group D",
        number_of_members: 45,
        created_by: "Noah",
        is_my_group: false,
    });

    groupsRef.add({
        name: "Group E",
        number_of_members: 47,
        created_by: "Benjamin",
        is_my_group: false,
    });
}

// writeGroups()


function createNewGroup(groupName){
    var groupsRef = db.collection("groups");

    groupsRef.add({
        name: groupName,
        number_of_members: 1,
        created_by: "",
        is_my_group: true,
    })

    .then(() => {
        console.log("Group created successfully!")
        alert("Group created successfully!")
    })

    .catch(err => {
        console.log(err);
    });
}

document.getElementById("createNewGroup").addEventListener("click", function(event){
    event.preventDefault();
    const groupName = document.getElementById("groupName").value;
    createNewGroup(groupName);
})


// Function to create a new group in Firestore (as per your original code)
function createNewGroup(groupName) {
    const groupsRef = collection(db, "groups");

    addDoc(groupsRef, {
        name: groupName,
        number_of_members: 1,
        created_by: "Unknown",  // Replace with actual user data if needed
        is_my_group: true,
    })
        .then(() => {
            console.log("Group created successfully!");
            alert("Group created successfully!");
        })
        .catch((err) => {
            console.error("Error creating group:", err);
            alert("Error creating group: " + err.message);
        });
}

// Event listener for form submission to create a new group
document.getElementById("createNewGroup").addEventListener("submit", function (event) {
    event.preventDefault();  // Prevent default form behavior

    const groupName = document.getElementById("groupName").value;

    if (groupName.trim() === "") {
        alert("Please provide a group name.");
        return;
    }

    createNewGroup(groupName);

    // Optionally, reset the form
    document.getElementById("groupName").value = "";
});

// Function to open the modal and display group details
function openGroupModal(groupName) {
    // Populate the modal with the group name (or any other data you want to show)
    document.getElementById("modalGroupName").textContent = groupName;

    // Show the modal
    const modal = document.getElementById("groupModal");
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("groupModal");
    modal.style.display = "none";
}

// Event listener for closing the modal
document.getElementById("closeModal").addEventListener("click", closeModal);

// Event listener for clicking on a group
document.getElementById("groupList").addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("group-item")) {
        const groupName = event.target.textContent;  // Get the group name from the clicked item
        openGroupModal(groupName);  // Open modal and display group info
    }
});
