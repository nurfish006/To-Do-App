let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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

const updateTaskList = () => {
    const taskList = document.querySelector(".task-list");
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const taskItem = document.createElement("li");
        taskItem.className = "taskItem";

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

const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTaskList();
    updateProgress();
    saveTasks();

    // Show confetti if all tasks are completed
    if (tasks.every(task => task.completed)) {
        showConfetti();
    }
};

const editTask = (index) => {
    const taskInput = document.getElementById("taskInput");
    const submitButton = document.getElementById("newTask");

    // Populate input field with task text
    taskInput.value = tasks[index].text;
    taskInput.focus();

    // Change button to "Edit" mode
    submitButton.textContent = "Edit";
    submitButton.onclick = (event) => {
        event.preventDefault();
        const newText = taskInput.value.trim();
        if (newText) {
            tasks[index].text = newText;
            taskInput.value = '';
            submitButton.textContent = "+";
            submitButton.onclick = addTask; // Reset button to add task mode
            updateTaskList();
            saveTasks();
        }
    };
};

const deleteTask = (index) => {
    tasks.splice(index, 1);
    updateTaskList();
    updateProgress();
    saveTasks();
};

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

const saveTasks = () => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

const showConfetti = () => {
    const confettiSettings = { target: 'confetti-canvas', max: 150 };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    setTimeout(() => {
        confetti.clear();
    }, 3000); // Stop confetti after 3 seconds
};

// Load tasks from local storage on page load
document.addEventListener("DOMContentLoaded", () => {
    updateTaskList();
    updateProgress();
});

document.getElementById("newTask").addEventListener("click", function (event) {
    event.preventDefault();
    addTask();
});