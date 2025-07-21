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
let activeProjectId = null; // Track active project by id
let todoActionListenerAdded = false; // Prevent multiple listeners

export function renderUI() {
  const projects = loadProjects();
  const { defaultProject, archiveProject } = ensureDefaultProjects(projects);

  // Set default active project if not set
  if (!activeProjectId || !projects.some((p) => p.id === activeProjectId)) {
    activeProjectId = defaultProject.id;
  }

  renderProjects(projects);
  renderTodos(getActiveProject(projects, defaultProject).getTodos());
  setupProjectHandlers(projects, defaultProject, archiveProject);
}

function getActiveProject(projects, defaultProject) {
  return projects.find((p) => p.id === activeProjectId) || defaultProject;
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
    }${project.id === activeProjectId ? " active" : ""}"
         data-project-id="${project.id}" tabindex="0" aria-label="Project: ${
        project.name
      }">
      <h3>${project.name}</h3>
      <span class="todo-count" aria-label="${
        project.getTodos().length
      } tasks">${project.getTodos().length} tasks</span>
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

  // Set focus to first todo for accessibility
  const firstTodo = container.querySelector(".todo-item");
  if (firstTodo) firstTodo.setAttribute("tabindex", "0");
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
  setupTodoActionDelegation(projects, defaultProject, archiveProject);
}

function setupTodoForm(projects, defaultProject) {
  const form = dom.todoForm();
  if (!form) return;

  // Only add the project dropdown if it doesn't exist
  if (!form.querySelector("#project-assign")) {
    const projectSelect = document.createElement("div");
    projectSelect.className = "form-group";
    projectSelect.innerHTML = `
      <label for="project-assign">Project:</label>
      <select id="project-assign" name="project-assign" required aria-label="Select project">
        ${projects
          .filter((p) => p.name !== "Archive")
          .map((p) => `<option value="${p.id}">${p.name}</option>`)
          .join("")}
      </select>
    `;
    // Insert project select before dueDate group if possible, else at end
    const dueDateGroup = form.querySelector("#dueDate")?.closest(".form-group");
    if (dueDateGroup) {
      form.insertBefore(projectSelect, dueDateGroup);
      // Ensure dueDate input has name="dueDate"
      const dueDateInput = form.querySelector("#dueDate");
      if (dueDateInput && !dueDateInput.name) {
        dueDateInput.name = "dueDate";
      }
    } else {
      form.appendChild(projectSelect);
    }
  } else {
    // Update dropdown options if projects changed
    const select = form.querySelector("#project-assign");
    select.innerHTML = projects
      .filter((p) => p.name !== "Archive")
      .map((p) => `<option value="${p.id}">${p.name}</option>`)
      .join("");
    // Ensure dueDate input has name="dueDate"
    const dueDateInput = form.querySelector("#dueDate");
    if (dueDateInput && !dueDateInput.name) {
      dueDateInput.name = "dueDate";
    }
  }

  // Remove any previous submit event listeners to prevent double submission
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  // Now add the event listener to the new form
  newForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(newForm);
    const title = formData.get("title");
    const dueDate = formData.get("dueDate");
    const selectedProject =
      projects.find((p) => p.id === formData.get("project-assign")) ||
      defaultProject;
    selectedProject.addTodo(
      new ToDo(
        title,
        selectedProject.name,
        formData.get("description"),
        dueDate,
        formData.get("priority") || "Normal"
      )
    );

    saveProjects(projects);
    activeProjectId = selectedProject.id;
    renderTodos(selectedProject.getTodos());
    renderProjects(projects);
    newForm.reset();
    // Reset dropdown to default project
    const select = newForm.querySelector("#project-assign");
    if (select) select.value = defaultProject.id;
  });
}

// Only add the todo action event delegation once
function setupTodoActionDelegation(projects, defaultProject, archiveProject) {
  if (todoActionListenerAdded) return;
  document.addEventListener("click", (e) => {
    const todoId = e.target.dataset.todoId;
    if (!todoId) return;

    const activeProject = getActiveProject(projects, defaultProject);

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
  todoActionListenerAdded = true;
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

    // Update all project dropdowns in todo forms
    document.querySelectorAll("#project-assign").forEach((select) => {
      select.innerHTML = projects
        .filter((p) => p.name !== "Archive")
        .map((p) => `<option value="${p.id}">${p.name}</option>`)
        .join("");
    });
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

    activeProjectId = project.id;
    document
      .querySelectorAll(".project-item")
      .forEach((item) => item.classList.toggle("active", item === projectItem));
    renderTodos(project.getTodos());
  });
}
