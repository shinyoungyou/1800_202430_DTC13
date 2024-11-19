document.addEventListener('DOMContentLoaded', function () {
    const myGroupsContainer = document.getElementById('my-groups-go-here'); // Container for "My Groups"
    const availableGroupsContainer = document.getElementById('available-groups-go-here'); // Container for "Available Groups"
    const groupTemplate = document.getElementById('newGroupListTemplate'); // Template for new groups

    // Function to display groups dynamically
    function displayMyGroupsDynamically(collection) {
        db.collection(collection)
            .get()
            .then((allGroups) => {
                allGroups.forEach((doc) => {
                    const groupData = doc.data();
                    const { name, description, is_my_group, number_of_members, created_by } = groupData;

                    const newGroup = groupTemplate.content.cloneNode(true);
                    const groupNameElement = newGroup.querySelector('[data-group-name]');
                    const groupDescriptionElement = newGroup.querySelector('[data-group-description]');
                    const groupMetadataElement = newGroup.querySelector('[data-group-metadata]');
                    const moreButton = newGroup.querySelector('.more-btn');

                    groupNameElement.innerText = name;
                    groupDescriptionElement.innerText = description;
                    groupMetadataElement.innerText = `${number_of_members}/50 members • Created by ${created_by}`;

                    // Add the `data-is-my-group` and `data-created-by` attributes dynamically
                    newGroup.querySelector('.card').dataset.isMyGroup = is_my_group.toString(); // Whether the user has joined this group
                    newGroup.querySelector('.card').dataset.createdBy = created_by;  // Who created the group

                    // Show "More" button for groups that the user has joined
                    if (is_my_group) {
                        moreButton.classList.remove('hidden');
                    }

                    if (is_my_group) {
                        myGroupsContainer.appendChild(newGroup);  // For "My Groups"
                    } else {
                        availableGroupsContainer.appendChild(newGroup);  // For "Available Groups"
                    }
                });
            })
            .catch((error) => {
                console.error("Error fetching groups: ", error);
            });
    }

    // Call the function to load groups
    displayMyGroupsDynamically("groups");
});

// Handle "More" button click (show confirmation dialog)
function handleMoreClick(event) {
    event.stopPropagation(); // Prevent the card click event from firing

    const groupContainer = event.target.closest('.card');
    const groupName = groupContainer.querySelector('[data-group-name]').innerText;

    // Ask for confirmation to unjoin the group
    const confirmation = confirm(`Are you sure you want to unjoin the group "${groupName}"?`);

    if (confirmation) {
        unjoinGroup(groupName, groupContainer);
    }
}

// Unjoin the group and update Firestore
function unjoinGroup(groupName, groupContainer) {
    const groupsRef = firebase.firestore().collection("groups");

    // Find the group in Firestore and update is_my_group to false
    groupsRef.where('name', '==', groupName).get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const groupRef = groupsRef.doc(doc.id);

                groupRef.update({
                    is_my_group: false  // Set is_my_group to false when the user unjoins the group
                }).then(() => {
                    console.log(`Successfully left the group: ${groupName}`);

                    // Remove the group from "My Groups" section
                    myGroupsContainer.removeChild(groupContainer);

                    // Clone and move it to "Available Groups" section
                    const newGroup = groupContainer.cloneNode(true);
                    newGroup.dataset.isMyGroup = 'false'; // Update to 'false' because the user has unjoined
                    availableGroupsContainer.appendChild(newGroup);

                    alert('You have left the group successfully!');
                }).catch(error => {
                    console.error("Error leaving the group: ", error);
                    alert("Error leaving the group: " + error.message);
                });
            });
        })
        .catch(error => {
            console.error("Error fetching group: ", error);
        });
}
// Show Create Group Modal
document.getElementById('createGroupButton').addEventListener('click', function () {
    document.getElementById('createGroupModal').style.display = 'block';
});

// Close Create Group Modal
function closeCreateGroupModal() {
    document.getElementById('createGroupModal').style.display = 'none';
}

// Handle Create Group Form Submission
document.getElementById('createGroupForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const groupName = document.getElementById('groupNameInput').value;
    const groupDescription = document.getElementById('groupDescriptionInput').value;

    if (!groupName || !groupDescription) {
        alert('Please fill in both fields.');
        return;
    }

    // Create a new group in Firestore
    const groupsRef = firebase.firestore().collection("groups");

    groupsRef.add({
        name: groupName,
        description: groupDescription,
        is_my_group: true,  // The creator is automatically in the group
        number_of_members: 1,  // Start with one member (the creator)
        created_by: firebase.auth().currentUser.uid,  // Get the current user as the creator
        created_at: firebase.firestore.FieldValue.serverTimestamp()
    })
        .then(() => {
            console.log(`Group created: ${groupName}`);
            alert('Group successfully created!');
            closeCreateGroupModal();  // Close the modal

            // Optionally, you can refresh the group list or add the new group dynamically to the UI
            location.reload();  // This is one option for reloading the page
        })
        .catch((error) => {
            console.error("Error creating group: ", error);
            alert('Error creating group: ' + error.message);
        });
});
