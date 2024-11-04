//---------------------------------------------------
// This function loads the parts of your skeleton
// (navbar, footer, and other things) into the HTML doc.
//---------------------------------------------------
function loadSkeleton() {
    console.log("loadSkeleton function called");
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            console.log("User is logged in. Loading nav_after_login.html");
            $("#navbarPlaceholder").load(
                "./text/nav_after_login.html",
                function (response, status, xhr) {
                    if (status === "error") {
                        console.error(
                            "Error loading nav_after_login.html:",
                            xhr.status,
                            xhr.statusText
                        );
                    } else {
                        console.log("nav_after_login.html loaded successfully");
                        setup(); // Call setup only after content is loaded
                    }
                }
            );
            $("#footerPlaceholder").load("./text/footer.html");
        } else {
            console.log("No user is logged in. Loading nav_before_login.html");
            $("#navbarPlaceholder").load(
                "./text/nav_before_login.html",
                function (response, status, xhr) {
                    if (status === "error") {
                        console.error(
                            "Error loading nav_before_login.html:",
                            xhr.status,
                            xhr.statusText
                        );
                    } else {
                        console.log(
                            "nav_before_login.html loaded successfully"
                        );
                        setup(); // Call setup only after content is loaded
                    }
                }
            );
            $("#footerPlaceholder").load("./text/footer.html");
        }
    });
}

// Function to set up the icons after navbar is loaded
function setup() {
    console.log("Setup function called");

    const homeIcon = document.getElementById("home-icon");
    const groupIcon = document.getElementById("group-icon");

    if (homeIcon && groupIcon) {
        // Detect the current page by URL
        if (window.location.href.includes("home.html")) {
            homeIcon.classList.add("bi-house-fill");
            groupIcon.classList.add("bi-people");
            console.log("Icons set for home.html");
        } else if (
            window.location.href.includes("mygroups.html") ||
            window.location.href.includes("newGroups.html")
        ) {
            homeIcon.classList.add("bi-house");
            groupIcon.classList.add("bi-people-fill");
            console.log("Icons set for mygroups.html");
        } else {
            homeIcon.classList.add("bi-house");
            groupIcon.classList.add("bi-people");
            console.log("Icons set for other pages");
        }
    } else {
        console.error("homeIcon or groupIcon not found in the DOM.");
    }
}

loadSkeleton(); // Invoke the function
