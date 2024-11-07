
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD-jZPVn3bJx1oxsmoqPCgNoK1Ww0_V9Kc",
    authDomain: "comp-1800-202430.firebaseapp.com",
    projectId: "comp-1800-202430",
    storageBucket: "comp-1800-202430.firebasestorage.app",
    messagingSenderId: "196571786687",
    appId: "1:196571786687:web:12b5d60376ec4bcb57850a",
    measurementId: "G-80QN7QQR2T"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();  // Initialize Firestore

// Function to process and display subjects
function processSubjects(response) {
    console.log(response);  // Log the response to debug
    let result_html = "";

    // Start the container div
    result_html += `
    <div class="flex flex-wrap gap-3 justify-center max-w-screen-md mx-auto">
    `;

    // Loop through each subject in the response data
    for (let i = 0; i < response.data.subjects.length; i++) {
        const subject = response.data.subjects[i];
        result_html += `
        <div class="basis-1/4">
            <div class="relative text-black font-extrabold bg-white shadow-md p-4 rounded-lg">
                <div class="text-lg">${subject.name}</div> <!-- Display subject name -->
                <div class="text-gray-500">Time: ${subject.total_subject_time}</div> <!-- Display total time -->
                <div class="subject-color" style="background-color:${subject.color}; width: 40px; height: 40px; border-radius: 50%; margin-top: 10px;"></div> <!-- Color circle -->
            </div>
        </div>
        `;
    }

    // Close the container div
    result_html += `</div>`;

    // Select the result div and add the generated HTML
    const result_div = document.getElementById("result");

    // Clear existing content if necessary, then append the new content
    result_div.innerHTML = "";
    const wrapper = document.createElement('div');
    wrapper.innerHTML = result_html;
    result_div.appendChild(wrapper);
}

// Function to fetch subjects from Firestore
function fetchSubjects() {
    db.collection("subjects").get()
        .then(querySnapshot => {
            const subjects = [];
            querySnapshot.forEach(doc => {
                subjects.push(doc.data()); // Push each subject's data to the array
            });
            console.log("Fetched subjects:", subjects); // Log the fetched data
            const response = { data: { subjects: subjects } };
            processSubjects(response); // Call the function with the structured response
        })
        .catch(error => {
            console.error("Error fetching subjects:", error);
        });
}

// Call the fetchSubjects function when the page loads
window.onload = function () {
    fetchSubjects();  // Fetch subjects from Firestore
};
