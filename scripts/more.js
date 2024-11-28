function getNameFromAuth() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log("User ID:", user.uid);
            console.log("User Object:", user);

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
                            console.log("User Data:", userData);

                            const schoolElement = document.getElementById("school-goes-here");
                            const cityElement = document.getElementById("city-goes-here");

                            if (schoolElement) schoolElement.innerText = userData.school || "N/A";
                            if (cityElement) cityElement.innerText = userData.city || "N/A";
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
