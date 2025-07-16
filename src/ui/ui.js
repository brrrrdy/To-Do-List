import { Project, loadProjects, saveProjects } from "../models/projects.js";
import ToDo from "../models/toDos.js";

export function renderUI() {
  const projects = loadProjects();
  const defaultProject = ensureDefaultProject(projects);

  renderProjects(projects);
  renderTodos(defaultProject.getTodos());
  setupTodoForm(defaultProject, projects);
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

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = form.querySelector("#title").value;
    const description = form.querySelector("#description").value;
    const priority = form.querySelector("#priority").value || "Normal";
    const dueDate = form.querySelector("#dueDate").value;

    if (!title) {
      alert("Title is required!");
      return;
    }

    const newTodo = new ToDo(
      title,
      "Default Project",
      description,
      dueDate, // Store raw date string
      priority
    );

    defaultProject.addTodo(newTodo);
    saveProjects(projects);
    renderTodos(defaultProject.getTodos());
    form.reset();
  });

  // Event Delegation
  document.addEventListener("click", (e) => {
    const todoId = e.target.dataset.todoId;
    if (!todoId) return;

    if (e.target.classList.contains("delete-btn")) {
      defaultProject.removeTodo(todoId);
      saveProjects(projects);
      renderTodos(defaultProject.getTodos());
    } else if (e.target.classList.contains("complete-btn")) {
      const todo = defaultProject.getTodos().find((t) => t.noteID === todoId);
      if (todo) {
        todo.isCompleted = !todo.isCompleted;
        saveProjects(projects);
        renderTodos(defaultProject.getTodos());
      }
    }
  });
}
