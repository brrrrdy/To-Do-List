export class Project {
  constructor(name) {
    this.name = name;
    this.todos = [];
    this.id = generateUUID(); // Make sure you have this from id.js
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  getTodos() {
    return this.todos;
  }

  removeTodo(todoId) {
    this.todos = this.todos.filter((t) => t.noteID !== todoId);
  }
}

// Initialize with default project if none exists
export function loadProjects() {
  const stored = localStorage.getItem("storedProjects");
  if (stored) {
    return JSON.parse(stored);
  }

  const defaultProject = new Project("Default Project");
  return [defaultProject];
}

export function saveProjects(projects) {
  localStorage.setItem("storedProjects", JSON.stringify(projects));
}
