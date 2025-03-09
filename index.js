let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Add Task
const addTask = () => {
    const taskInput = document.getElementById("taskInput");
    const taskDeadline = document.getElementById("taskDeadline");
    const text = taskInput.value.trim();
    const deadline = taskDeadline.value;

    // Check if the task already exists
    const isTaskExists = tasks.some(task => task.text.toLowerCase() === text.toLowerCase());

    // Check if the deadline is in the past
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const isPastDeadline = deadline && deadline < today;

    if (isPastDeadline) {
        displayErrorMessage("Deadline cannot be in the past.");
        return;
    }

    if (text && !isTaskExists) {
        tasks.push({ text: text, completed: false, deadline: deadline || null });
        taskInput.value = '';
        taskDeadline.value = '';
        updateTaskList();
        updateProgress();
        saveTasks();
        suggestPriority(); // Update AI suggestions
    } else if (isTaskExists) {
        displayErrorMessage("This task already exists!");
    }
};

// Display Error Message
const displayErrorMessage = (message) => {
    const errorMessage = document.createElement("div");
    errorMessage.className = "error-message";
    errorMessage.textContent = message;

    const form = document.querySelector("form");
    form.appendChild(errorMessage);

    // Remove the error message after 3 seconds
    setTimeout(() => {
        errorMessage.remove();
    }, 3000);
};

// Update Task List
const updateTaskList = () => {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const taskItem = document.createElement("li");
        taskItem.className = "taskItem";
        taskItem.draggable = true;

        taskItem.innerHTML = `
            <div class="task ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''} />
                <p>${task.text}</p>
                ${task.deadline ? `<small>Deadline: ${task.deadline}</small>` : ''}
            </div>
            <div class="icons">
                <img src="./assets/edit.jpg" alt="edit" class="edit" onclick="editTask(${index})" />
                <img src="./assets/delete.jpg" alt="delete" class="delete" onclick="deleteTask(${index})" />
            </div>
        `;

        const checkbox = taskItem.querySelector(".checkbox");
        checkbox.addEventListener("change", () => toggleTaskComplete(index));

        taskList.appendChild(taskItem);
    });
};

// AI Priority Suggestion
const suggestPriority = () => {
    const prioritySuggestion = document.getElementById("prioritySuggestion");

    if (tasks.length === 0) {
        prioritySuggestion.textContent = "Add tasks to get priority suggestions.";
        return;
    }

    // Sort tasks by deadline (earliest first)
    const sortedTasks = [...tasks].sort((a, b) => {
        const deadlineA = a.deadline ? new Date(a.deadline) : new Date(9999, 11, 31); // Far future if no deadline
        const deadlineB = b.deadline ? new Date(b.deadline) : new Date(9999, 11, 31);
        return deadlineA - deadlineB;
    });

    // Get the top 3 tasks
    const topTasks = sortedTasks.slice(0, 3);

    // Display suggestions
    prioritySuggestion.innerHTML = `
        <strong>Priority Suggestions:</strong>
        <ul>
            ${topTasks.map(task => `<li>${task.text} (Deadline: ${task.deadline || "No deadline"})</li>`).join("")}
        </ul>
    `;
};

// Toggle Task Completion
const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTaskList();
    updateProgress();
    saveTasks();

    // Show confetti if all tasks are completed
    if (tasks.length > 0 && tasks.every(task => task.completed)) {
        showConfetti();
    }
};

// Edit Task
const editTask = (index) => {
    const taskInput = document.getElementById("taskInput");
    const taskDeadline = document.getElementById("taskDeadline");
    const submitButton = document.getElementById("newTask");

    // Populate input fields with task details
    taskInput.value = tasks[index].text;
    taskDeadline.value = tasks[index].deadline || '';
    taskInput.focus();

    // Change button to "Edit" mode
    submitButton.textContent = "Edit";
    submitButton.onclick = (event) => {
        event.preventDefault();
        const newText = taskInput.value.trim();
        const newDeadline = taskDeadline.value;

        // Check if the deadline is in the past
        const today = new Date().toISOString().split("T")[0];
        const isPastDeadline = newDeadline && newDeadline < today;

        if (isPastDeadline) {
            displayErrorMessage("Deadline cannot be in the past.");
            return;
        }

        if (newText) {
            tasks[index].text = newText;
            tasks[index].deadline = newDeadline || null;
            taskInput.value = '';
            taskDeadline.value = '';
            submitButton.textContent = "+";
            submitButton.onclick = addTask;
            updateTaskList();
            saveTasks();
            suggestPriority(); // Update AI suggestions
        }
    };
};

// Delete Task
const deleteTask = (index) => {
    tasks.splice(index, 1);
    updateTaskList();
    updateProgress();
    saveTasks();
};

// Update Progress Bar
const updateProgress = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const progressBar = document.getElementById("progress");
    const numbers = document.getElementById("numbers");

    if (totalTasks > 0) {
        const progressPercentage = (completedTasks / totalTasks) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    } else {
        progressBar.style.width = "0%";
    }

    numbers.textContent = `${completedTasks} / ${totalTasks}`;
};

// Save Tasks to Local Storage
const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Show Confetti
const showConfetti = () => {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });
};

// Drag-and-Drop Functionality
let draggedItem = null;

const addDragAndDrop = () => {
    const taskList = document.getElementById("taskList");

    taskList.addEventListener("dragstart", (e) => {
        if (e.target.classList.contains("taskItem")) {
            draggedItem = e.target;
            e.target.classList.add("dragging");
        }
    });

    taskList.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const currentItem = document.querySelector(".dragging");

        if (afterElement == null) {
            taskList.appendChild(currentItem);
        } else {
            taskList.insertBefore(currentItem, afterElement);
        }
    });

    taskList.addEventListener("dragend", (e) => {
        if (e.target.classList.contains("taskItem")) {
            e.target.classList.remove("dragging");
            updateTaskOrder();
        }
    });
};

const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll(".taskItem:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
};

const updateTaskOrder = () => {
    const taskItems = document.querySelectorAll(".taskItem");
    tasks = Array.from(taskItems).map((item) => {
        const text = item.querySelector("p").textContent;
        const completed = item.querySelector(".checkbox").checked;
        const deadline = item.querySelector("small") ? item.querySelector("small").textContent.replace("Deadline: ", "") : null;
        return { text, completed, deadline };
    });
    saveTasks();
};

// Dark Mode Toggle
const toggleDarkMode = () => {
    document.body.classList.toggle("light-mode");
    const isLightMode = document.body.classList.contains("light-mode");
    localStorage.setItem("theme", isLightMode ? "light" : "dark");
};

const loadTheme = () => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
        document.body.classList.add("light-mode");
    }
};

// Event Listeners
document.getElementById("darkModeToggle").addEventListener("click", toggleDarkMode);
document.getElementById("newTask").addEventListener("click", function (event) {
    event.preventDefault();
    addTask();
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    addDragAndDrop();
    updateTaskList();
    updateProgress();
});