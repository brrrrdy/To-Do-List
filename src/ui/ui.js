import { Project, loadProjects, saveProjects } from "../models/projects.js";
import ToDo from "../models/toDos.js";

export function renderUI() {
  // Initialize projects and get default project
  const projects = loadProjects();
  const defaultProject = ensureDefaultProject(projects);

  // Initial render
  renderProjects(projects);
  renderTodos(defaultProject.getTodos());

  // Setup form handler
  setupTodoForm(defaultProject, projects);
}

// Helper functions
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
  return `
    <div class="todo-item ${todo.priority.toLowerCase()}" data-todo-id="${
    todo.noteID
  }">
      <div class="todo-header">
        <h3 class="todo-title">${todo.title}</h3>
        <span class="priority-badge ${todo.priority.toLowerCase()}">
          ${todo.priority}
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

function formatDate(dateString) {
  if (!dateString) return "No due date";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function setupTodoForm(defaultProject, projects) {
  const form = document.getElementById("todo-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const newTodo = new ToDo(
      formData.get("title"),
      "Default Project",
      formData.get("description"),
      formData.get("dueDate"),
      formData.get("priority")
    );

    defaultProject.addTodo(newTodo);
    saveProjects(projects);
    renderTodos(defaultProject.getTodos());
    form.reset();
  });

  // Event delegation for todo actions
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
