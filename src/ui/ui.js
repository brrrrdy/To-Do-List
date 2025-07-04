import { initForm } from "../models/form.js";
import { Project, loadProjects, saveProjects } from "../models/projects.js";

export function renderUI() {
  try {
    // 1. Load or initialize projects
    let projects = loadProjects();
    console.log("Initial projects:", projects);

    // 2. Ensure default project exists
    let defaultProject = projects.find((p) => p.name === "Default Project");
    if (!defaultProject) {
      console.log("Creating default project");
      defaultProject = new Project("Default Project");
      projects.push(defaultProject);
      saveProjects(projects);
    }

    // 3. Render initial state
    renderProjects(projects);
    renderTodos(defaultProject.getTodos());
    console.log("Initial todos:", defaultProject.getTodos());

    // 4. Set up form handler
    initForm((newTodo) => {
      console.log("New todo received:", newTodo);

      // Add to default project
      defaultProject.addTodo(newTodo);
      console.log("Updated todos:", defaultProject.getTodos());

      // Persist and re-render
      saveProjects(projects);
      renderProjects(projects);
      renderTodos(defaultProject.getTodos());
    });
  } catch (error) {
    console.error("Error in renderUI:", error);
  }
}

function renderProjects(projects) {
  const container = document.getElementById("projects-container");
  if (!container) {
    console.error("Projects container not found");
    return;
  }

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
  if (!container) {
    console.error("Todos container not found!");
    return;
  }

  console.log("Rendering todos:", todos);
  container.innerHTML = "";

  if (todos.length === 0) {
    container.innerHTML = '<p class="empty-message">No tasks yet. Add one!</p>';
    return;
  }

  const sortedTodos = sortTodosByPriority(todos);
  sortedTodos.forEach((todo) => {
    container.appendChild(createTodoElement(todo));
  });
}

function sortTodosByPriority(todos) {
  const priorityOrder = { Urgent: 0, High: 1, Normal: 2, Low: 3 };
  return [...todos].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}

function createTodoElement(todo) {
  const element = document.createElement("div");
  element.className = `todo-item ${todo.priority.toLowerCase()}`;
  element.dataset.todoId = todo.noteID;

  element.innerHTML = `
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
  `;

  // Add event listeners
  element
    .querySelector(".complete-btn")
    .addEventListener("click", () => toggleTodoComplete(todo.noteID));
  element
    .querySelector(".delete-btn")
    .addEventListener("click", () => deleteTodo(todo.noteID));

  return element;
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
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

  project.removeTodo(todoId);
  saveProjects(projects);
  renderTodos(project.getTodos());
}
