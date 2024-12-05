function getNameFromAuth() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            const userName = user.displayName || "Anonymous"; // Handle null displayName
            const email = user.email;

            // Update DOM elements, ensuring they exist
            const nameElement = document.getElementById("name-goes-here");
            const name2Element = document.getElementById("name2-goes-here");
            const emailElement = document.getElementById("email-goes-here");

            if (nameElement) nameElement.innerText = userName;
            if (name2Element) name2Element.innerText = userName;
            if (emailElement) emailElement.innerText = email;

            // Firestore reference
            const db = firebase.firestore();
            const usersRef = db.collection("users");

            usersRef
                .where("name", "==", userName)
                .where("email", "==", email)
                .get()
                .then((snapshot) => {
                    if (!snapshot.empty) {
                        snapshot.forEach((doc) => {
                            const userData = doc.data();

                            const schoolElement =
                                document.getElementById("school-goes-here");
                            const cityElement =
                                document.getElementById("city-goes-here");

                            if (schoolElement)
                                schoolElement.innerText =
                                    userData.school || "N/A";
                            if (cityElement)
                                cityElement.innerText = userData.city || "N/A";
                        });
                    } else {
                        console.log("No matching user document found.");
                    }
                })
                .catch((error) => console.error("Error fetching user:", error));
        } else {
            console.log("No user is logged in.");
        }
    });
}

// Call the function
getNameFromAuth();

function openUpdateModal(field) {
    const updateForm = document.getElementById("updateForm");
    const updateField = document.getElementById("updateField");
    const updateTitle = document.getElementById("updateTitle");

    updateForm.classList.remove("hidden");
    updateForm.dataset.field = field;
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            console.error("No user is logged in.");
            return;
        }
        const userName = user.displayName || "Anonymous"; // Handle null displayName
        const email = user.email;

        const db = firebase.firestore();
        const usersRef = db.collection("users");

        usersRef
            .where("name", "==", userName)
            .where("email", "==", email)
            .get()
            .then((snapshot) => {
                if (!snapshot.empty) {
                    snapshot.forEach((doc) => {
                        const userData = doc.data();

                        const schoolElement =
                            document.getElementById("school-goes-here");
                        const cityElement =
                            document.getElementById("city-goes-here");

                        if (schoolElement)
                            schoolElement.innerText = userData.school || "N/A";
                        if (cityElement)
                            cityElement.innerText = userData.city || "N/A";

                        switch (field) {
                            case "name":
                                updateTitle.innerText = "Update Name";
                                updateField.value =
                                    userName;
                                break;
                            case "email":
                                updateTitle.innerText = "Update Email";
                                updateField.value =
                                    email;
                                break;
                            case "school":
                                updateTitle.innerText = "Update School";
                                updateField.value =
                                    userData.school;
                                break;
                            case "city":
                                updateTitle.innerText = "Update City";
                                updateField.value =
                                    userData.city;
                                break;
                        }
                        console.log("asdfasdf");
                    });
                } else {
                    console.log("No matching user document found.");
                }
            })
            .catch((error) => console.error("Error fetching user:", error));
    });
}

document.getElementById("cancelUpdate").addEventListener("click", () => {
    document.getElementById("updateForm").classList.add("hidden");
    document.getElementById("updateField").value = "";
});

document.getElementById("updateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const field = document.getElementById("updateForm").dataset.field;
    const newValue = document.getElementById("updateField").value;

    if (!newValue.trim()) {
        alert("Please enter a value.");
        return;
    }

    const user = firebase.auth().currentUser;
    const db = firebase.firestore();
    const usersRef = db.collection("users");

    if (!user) {
        console.error("No user logged in");
        return;
    }

    const userDoc = usersRef.doc(user.uid);

    // Update Firestore and Auth
    const updates = {};
    updates[field] = newValue;

    if (field === "email") {
        // Update Firebase Auth email
        user.updateEmail(newValue)
            .then(() => userDoc.update(updates))
            .then(() => {
                alert("Email updated successfully!");
                document.getElementById(`${field}-goes-here`).innerText =
                    newValue;
                document.getElementById("updateForm").classList.add("hidden");
            })
            .catch((error) => console.error("Error updating email:", error));
    } else if (field === "name") {
        // Update Firebase Auth displayName
        user.updateProfile({ displayName: newValue })
            .then(() => userDoc.update(updates))
            .then(() => {
                alert("Name updated successfully!");
                document.getElementById("name-goes-here").innerText = newValue;
                document.getElementById("name2-goes-here").innerText = newValue;
                document.getElementById("updateForm").classList.add("hidden");
            })
            .catch((error) => console.error("Error updating name:", error));
    } else {
        // Update Firestore for school or city
        userDoc
            .update(updates)
            .then(() => {
                alert(
                    `${
                        field.charAt(0).toUpperCase() + field.slice(1)
                    } updated successfully!`
                );
                document.getElementById(`${field}-goes-here`).innerText =
                    newValue;
                document.getElementById("updateForm").classList.add("hidden");
            })
            .catch((error) => console.error(`Error updating ${field}:`, error));
    }

    document.getElementById("updateField").value = "";
});
