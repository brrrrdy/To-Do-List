import { Project, loadProjects, saveProjects } from "../models/projects.js";
import ToDo from "../models/toDos.js";

// DOM Elements
const dom = {
  projectsContainer: () => document.getElementById("projects-container"),
  todosContainer: () => document.getElementById("todos-container"),
  todoForm: () => document.getElementById("todo-form"),
  newProjectBtn: () => document.getElementById("new-project-btn"),
  projectForm: () => document.getElementById("new-project-form"),
  cancelProjectBtn: () => document.querySelector(".cancel-project-btn"),
};

// Main UI Controller
export function renderUI() {
  const projects = loadProjects();
  const { defaultProject, archiveProject } = ensureDefaultProjects(projects);

  renderProjects(projects);
  renderTodos(defaultProject.getTodos());
  setupProjectHandlers(projects, defaultProject, archiveProject);
}

// Project Management
function ensureDefaultProjects(projects) {
  let defaultProject = projects.find((p) => p.name === "Default Project");
  let archiveProject = projects.find((p) => p.name === "Archive");

  if (!defaultProject) {
    defaultProject = new Project("Default Project");
    projects.push(defaultProject);
  }

  if (!archiveProject) {
    archiveProject = new Project("Archive");
    projects.push(archiveProject);
  }

  saveProjects(projects);
  return { defaultProject, archiveProject };
}

function renderProjects(projects) {
  const container = dom.projectsContainer();
  if (!container) return;

  container.innerHTML = projects
    .map(
      (project) => `
    <div class="project-item ${
      project.name === "Archive" ? "archive-project" : ""
    }" 
         data-project-id="${project.id}">
      <h3>${project.name}</h3>
      <span class="todo-count">${project.getTodos().length} tasks</span>
    </div>
  `
    )
    .join("");
}

// Todo Rendering
function renderTodos(todos) {
  const container = dom.todosContainer();
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
  const isArchived = todo.projectAssign === "Archive";
  return `
    <div class="todo-item ${priority.toLowerCase()} ${
    isArchived ? "archived" : ""
  }" 
         data-todo-id="${todo.noteID}">
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
          ${
            isArchived
              ? ""
              : `<button class="complete-btn" data-todo-id="${todo.noteID}">✓</button>`
          }
          <button class="delete-btn" data-todo-id="${todo.noteID}">✕</button>
        </div>
      </div>
    </div>
  `;
}

// Utilities
function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

// Event Handlers
function setupProjectHandlers(projects, defaultProject, archiveProject) {
  setupTodoForm(projects, defaultProject, archiveProject);
  setupProjectCreation(projects);
  setupProjectSelection(projects);
}

function setupTodoForm(projects, defaultProject, archiveProject) {
  const form = dom.todoForm();
  if (!form) return;

  // Add project dropdown (excluding Archive)
  const projectSelect = document.createElement("div");
  projectSelect.className = "form-group";
  projectSelect.innerHTML = `
    <label for="project-assign">Project:</label>
    <select id="project-assign" required>
      ${projects
        .filter((p) => p.name !== "Archive")
        .map((p) => `<option value="${p.id}">${p.name}</option>`)
        .join("")}
    </select>
  `;
  form.insertBefore(
    projectSelect,
    form.querySelector("#dueDate").closest(".form-group")
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const title = formData.get("title");

    // if (!title) return alert("Title is required!");

    const selectedProject =
      projects.find((p) => p.id === formData.get("project-assign")) ||
      defaultProject;
    selectedProject.addTodo(
      new ToDo(
        title,
        selectedProject.name,
        formData.get("description"),
        formData.get("dueDate"),
        formData.get("priority") || "Normal"
      )
    );

    saveProjects(projects);
    renderTodos(selectedProject.getTodos());
    renderProjects(projects);
    form.reset();
  });

  // Event delegation for todo actions
  document.addEventListener("click", (e) => {
    const todoId = e.target.dataset.todoId;
    if (!todoId) return;

    const activeProject =
      projects.find((p) =>
        dom
          .projectsContainer()
          .querySelector(`[data-project-id="${p.id}"]`)
          ?.classList.contains("active")
      ) || defaultProject;

    if (e.target.classList.contains("delete-btn")) {
      activeProject.removeTodo(todoId);
    } else if (e.target.classList.contains("complete-btn")) {
      const todo = activeProject.getTodos().find((t) => t.noteID === todoId);
      if (todo) {
        activeProject.removeTodo(todoId);
        todo.projectAssign = "Archive"; // Update project assignment
        archiveProject.addTodo(todo);
      }
    }

    saveProjects(projects);
    renderTodos(
      activeProject === archiveProject
        ? archiveProject.getTodos()
        : activeProject.getTodos()
    );
    renderProjects(projects);
  });
}

function setupProjectCreation(projects) {
  const { newProjectBtn, projectForm, cancelProjectBtn } = dom;
  if (!newProjectBtn() || !projectForm()) return;

  newProjectBtn().addEventListener("click", () => {
    newProjectBtn().style.display = "none";
    projectForm().style.display = "block";
  });

  cancelProjectBtn().addEventListener("click", () => {
    projectForm().style.display = "none";
    newProjectBtn().style.display = "block";
  });

  projectForm().addEventListener("submit", (e) => {
    e.preventDefault();
    const projectName = document.getElementById("project-name").value.trim();
    if (!projectName) return alert("Project name is required!");
    if (projectName === "Archive") return alert('"Archive" is a reserved name');

    projects.push(new Project(projectName));
    saveProjects(projects);
    projectForm().reset();
    projectForm().style.display = "none";
    newProjectBtn().style.display = "block";
    renderProjects(projects);

    // Update project dropdown in todo form
    const select = document.getElementById("project-assign");
    if (select) {
      select.innerHTML = projects
        .filter((p) => p.name !== "Archive")
        .map((p) => `<option value="${p.id}">${p.name}</option>`)
        .join("");
    }
  });
}

function setupProjectSelection(projects) {
  dom.projectsContainer()?.addEventListener("click", (e) => {
    const projectItem = e.target.closest(".project-item");
    if (!projectItem) return;

    const project = projects.find(
      (p) => p.id === projectItem.dataset.projectId
    );
    if (!project) return;

    document
      .querySelectorAll(".project-item")
      .forEach((item) => item.classList.toggle("active", item === projectItem));
    renderTodos(project.getTodos());
  });
}
