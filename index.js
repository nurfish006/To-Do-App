let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Add Task
const addTask = () => {
    const taskInput = document.getElementById("taskInput");
    const text = taskInput.value.trim();
    
    if (text) {
        tasks.push({ text: text, completed: false });
        taskInput.value = '';
        updateTaskList();
        updateProgress();
        saveTasks();
    }
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
    const submitButton = document.getElementById("newTask");

    taskInput.value = tasks[index].text;
    taskInput.focus();

    submitButton.textContent = "Edit";
    submitButton.onclick = (event) => {
        event.preventDefault();
        const newText = taskInput.value.trim();
        if (newText) {
            tasks[index].text = newText;
            taskInput.value = '';
            submitButton.textContent = "+";
            submitButton.onclick = addTask;
            updateTaskList();
            saveTasks();
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
        return { text, completed };
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