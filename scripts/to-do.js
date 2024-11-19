// // Initialize Firebase Firestore
// const db = firebase.firestore();

// Function to display todos for a specific subject
function displayTodosForSubject(subjectId) {
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = ''; // Clear existing todos

    db.collection("todos")
        .where("subjectId", "==", subjectId)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                console.log("No todos found for subject:", subjectId);
                return;
            }
            querySnapshot.forEach((doc) => {
                const todo = doc.data();
                const todoItem = document.createElement('li');
                todoItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                todoItem.innerHTML = `
                    <span>${todo.text}</span>
                    <button class="btn btn-danger btn-sm delete-todo" data-id="${doc.id}">Delete</button>
                `;
                todoList.appendChild(todoItem);
            });
        })
        .catch(error => {
            console.error("Error fetching todos:", error);
        });
}

// Function to add a new todo
function addTodo() {
    const todoText = document.getElementById("todoInput").value;
    const subjectSelect = document.getElementById("subjectSelect");
    const selectedSubject = subjectSelect.options[subjectSelect.selectedIndex];

    if (todoText && selectedSubject.value) {
        db.collection("todos").add({
            text: todoText,
            is_done: false,
            subjectId: selectedSubject.value,
            subjectName: selectedSubject.text
        }).then(() => {
            console.log("Todo added successfully");
            document.getElementById("todoInput").value = ''; // Clear input
            displayTodosForSubject(selectedSubject.value); // Refresh todo list for this subject
            $('#todoModal').modal('hide'); // Close the modal
        }).catch(error => {
            console.error("Error adding todo:", error);
        });
    } else {
        console.log("Todo text is empty or no subject selected");
    }
}

// Event listener for opening the todo modal
document.getElementById("todoBtnModal").addEventListener("click", function () {
    const subjectSelect = document.getElementById("subjectSelect");
    subjectSelect.innerHTML = '<option value="">Select a subject</option>';

    db.collection("subjects").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const subject = doc.data();
            subjectSelect.innerHTML += `<option value="${doc.id}">${subject.name}</option>`;
        });
    });

    // document.getElementById("todoModal").classList.remove("hidden"); // Show form

    $('#todoModal').modal('show'); // Show the modal
});

// Event listener for adding a todo
document.getElementById("addTodoBtn").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default form submission
    addTodo();
});

// Event delegation for delete buttons
document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('delete-todo')) {
        const todoId = e.target.dataset.id;
        deleteTodo(todoId);
    }
});

// Function to delete a todo
function deleteTodo(todoId) {
    db.collection("todos").doc(todoId).delete()
        .then(() => {
            console.log("Todo deleted successfully");
            displayTodosForSubject(subjectId); // Refresh the list for that subject
        })
        .catch(error => {
            console.error("Error deleting todo:", error);
        });
}

// Event listener for closing the modal
document.getElementById("closeTodoModal").addEventListener("click", function () {
    $('#todoModal').modal('hide'); // Hide the modal using Bootstrap's method
});
