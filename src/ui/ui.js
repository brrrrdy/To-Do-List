import { Project, loadProjects, saveProjects } from "../models/projects.js";
import ToDo from "../models/toDos.js";

export function renderUI() {
  const projects = loadProjects();
  const defaultProject = ensureDefaultProject(projects);

  renderProjects(projects);
  renderTodos(defaultProject.getTodos());

  setupTodoForm(defaultProject, projects);
  setupProjectCreation(projects); // Add this line
  setupProjectSelection(projects); // Add project switching
}

// Project Helpers
function ensureDefaultProject(projects) {
  let defaultProject = projects.find((p) => p.name === "Default Project");
  if (!defaultProject) {
    defaultProject = new Project("Default Project");
    projects.push(defaultProject);
    saveProjects(projects);
  }
  return defaultProject;
}

function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  if (!container) return;

  container.innerHTML = projects
    .map(
      (project) => `
    <div class="project-item" data-project-id="${project.id}">
      <h3>${project.name}</h3>
      <span class="todo-count">${project.getTodos().length} tasks</span>
    </div>
  `
    )
    .join("");
}

// Todo Rendering
function renderTodos(todos) {
  const container = document.getElementById("todos-container");
  if (!container) return;

  container.innerHTML =
    todos.length === 0
      ? '<p class="empty-message">No tasks yet. Add one!</p>'
      : sortTodosByPriority(todos).map(createTodoHTML).join("");
}

function sortTodosByPriority(todos) {
  const priorityOrder = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
  return [...todos].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

function createTodoHTML(todo) {
  const priority = todo.priority || "Normal";
  return `
    <div class="todo-item ${priority.toLowerCase()}" data-todo-id="${
    todo.noteID
  }">
      <div class="todo-header">
        <h3 class="todo-title">${todo.title}</h3>
        <span class="priority-badge ${priority.toLowerCase()}">
          ${priority}
        </span>
      </div>
      <p class="todo-description">${todo.description || "No description"}</p>
      <div class="todo-footer">
        <span class="due-date">${formatDate(todo.dueDate)}</span>
        <div class="todo-actions">
          <button class="complete-btn" data-todo-id="${todo.noteID}">✓</button>
          <button class="delete-btn" data-todo-id="${todo.noteID}">✕</button>
        </div>
      </div>
    </div>
  `;
}

// Date Handling (Single Declaration)
function formatDate(dateString) {
  if (!dateString) return "No due date";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString; // Return raw string if formatting fails
  }
}

// Form Handling
function setupTodoForm(defaultProject, projects) {
  const form = document.getElementById("todo-form");
  if (!form) return;

  // Create project select element
  const projectSelect = document.createElement("div");
  projectSelect.className = "form-group";
  projectSelect.innerHTML = `
    <label for="project-assign">Project:</label>
    <select id="project-assign" required>
      ${projects
        .map((p) => `<option value="${p.id}">${p.name}</option>`)
        .join("")}
    </select>
  `;

  // Insert after title field and before date field
  const titleGroup = form.querySelector("#title").closest(".form-group");
  const dateGroup = form.querySelector("#dueDate").closest(".form-group");
  form.insertBefore(projectSelect, dateGroup);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = form.querySelector("#title").value;
    const description = form.querySelector("#description").value;
    const priority = form.querySelector("#priority").value || "Normal";
    const dueDate = form.querySelector("#dueDate").value;
    const projectId = form.querySelector("#project-assign").value;

    if (!title) {
      alert("Title is required!");
      return;
    }

    const selectedProject =
      projects.find((p) => p.id === projectId) || defaultProject;
    const newTodo = new ToDo(
      title,
      selectedProject.name,
      description,
      dueDate,
      priority
    );

    selectedProject.addTodo(newTodo);
    saveProjects(projects);
    renderTodos(selectedProject.getTodos());
    renderProjects(projects);
    form.reset();
  });

  // ... rest of your existing event delegation code ...
}
function setupProjectCreation(projects) {
  const newProjectBtn = document.getElementById("new-project-btn");
  const projectForm = document.getElementById("new-project-form");
  const cancelBtn = document.querySelector(".cancel-project-btn");

  newProjectBtn.addEventListener("click", () => {
    newProjectBtn.style.display = "none";
    projectForm.style.display = "block";
  });

  cancelBtn.addEventListener("click", () => {
    projectForm.style.display = "none";
    newProjectBtn.style.display = "block";
  });

  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const projectName = document.getElementById("project-name").value.trim();

    if (!projectName) {
      alert("Project name is required!");
      return;
    }

    const newProject = new Project(projectName);
    projects.push(newProject);
    saveProjects(projects);

    projectForm.reset();
    projectForm.style.display = "none";
    newProjectBtn.style.display = "block";

    renderProjects(projects);
  });
}

function setupProjectSelection(projects) {
  document
    .getElementById("projects-container")
    .addEventListener("click", (e) => {
      const projectItem = e.target.closest(".project-item");
      if (projectItem) {
        const projectId = projectItem.dataset.projectId;
        const project = projects.find((p) => p.id === projectId);
        renderTodos(project.getTodos());

        // Update active project highlight
        document.querySelectorAll(".project-item").forEach((item) => {
          item.classList.remove("active");
        });
        projectItem.classList.add("active");
      }
    });
}
