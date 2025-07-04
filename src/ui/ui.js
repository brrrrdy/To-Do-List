import { initForm } from "../models/form.js";
import { loadProjects, saveProjects } from "../models/projects.js";

export function renderUI() {
  const projects = loadProjects();

  renderProjects(projects);

  let defaultProject =
    projects.find((p) => p.name === "Default Project") || projects[0];

  if (defaultProject) {
    renderTodos(defaultProject.getTodos());
  }

  initForm((newTodo) => {
    defaultProject.addTodo(newTodo);
    saveProjects(projects);
    renderProjects(projects);
    renderTodos(defaultProject.getTodos());
  });
}

function renderProjects(projects) {
  const projectsContainer = document.getElementById("projects-container");
  if (!projectsContainer) return;

  projectsContainer.innerHTML = projects
    .map(
      (project) => `
    <div class="project-item" data-project-id="${project.id}">
      <h3>${project.name}</h3>
      <span class="todo-count">${project.getTodos().length} items</span>
    </div>
  `
    )
    .join("");
}

function renderTodos(todos) {
  const todosContainer = document.getElementById("todos-container");
  if (!todosContainer) {
    console.error("Todos container not found!");
    return;
  }

  todosContainer.innerHTML = "";

  const sortedTodos = sortTodosByPriority(todos);

  if (sortedTodos.length === 0) {
    todosContainer.innerHTML =
      '<p class="empty-message">No tasks yet. Add one!</p>';
    return;
  }

  sortedTodos.forEach((todo) => {
    const todoElement = createTodoElement(todo);
    todosContainer.appendChild(todoElement);
  });
}

function sortTodosByPriority(todos) {
  const priorityOrder = {
    Urgent: 0,
    High: 1,
    Normal: 2,
    Low: 3,
  };

  return [...todos].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function createTodoElement(todo) {
  const todoElement = document.createElement("div");
  todoElement.className = `todo-item ${todo.priority.toLowerCase()}`;
  todoElement.dataset.todoId = todo.noteID;

  const formattedDate = todo.dueDate ? formatDate(todo.dueDate) : "No due date";

  todoElement.innerHTML = `
    <div class="todo-header">
      <h3 class="todo-title">${todo.title}</h3>
      <span class="priority-badge ${todo.priority.toLowerCase()}">
        ${todo.priority}
      </span>
    </div>
    <p class="todo-description">${todo.description || "No description"}</p>
    <div class="todo-footer">
      <span class="due-date">${formattedDate}</span>
      <div class="todo-actions">
        <button class="complete-btn" data-todo-id="${todo.noteID}">✓</button>
        <button class="delete-btn" data-todo-id="${todo.noteID}">✕</button>
      </div>
    </div>
  `;

  // Add event listeners for actions
  todoElement.querySelector(".complete-btn").addEventListener("click", () => {
    toggleTodoComplete(todo.noteID);
  });

  todoElement.querySelector(".delete-btn").addEventListener("click", () => {
    deleteTodo(todo.noteID);
  });

  return todoElement;
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function toggleTodoComplete(todoId) {
  const projects = loadProjects();
  const project =
    projects.find((p) => p.name === "Default Project") || projects[0];
  const todo = project.getTodos().find((t) => t.noteID === todoId);

  if (todo) {
    todo.isCompleted = !todo.isCompleted;
    saveProjects(projects);
    renderTodos(project.getTodos());
  }
}

function deleteTodo(todoId) {
  const projects = loadProjects();
  const project =
    projects.find((p) => p.name === "Default Project") || projects[0];

  project.removeTodo(todoId); // You'll need to implement this method in your Projects class
  saveProjects(projects);
  renderTodos(project.getTodos());
}
