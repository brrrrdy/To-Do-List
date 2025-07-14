import { generateUUID } from "../utils/id.js";

export class Project {
  constructor(name) {
    this.name = name;
    this.todos = [];
    this.id = generateUUID();
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

export function loadProjects() {
  const stored = localStorage.getItem("storedProjects");
  if (stored) {
    const parsed = JSON.parse(stored);

    return parsed.map((p) => {
      const project = new Project(p.name);
      project.todos = p.todos;
      project.id = p.id;
      return project;
    });
  }
  return [new Project("Default Project")];
}

export function saveProjects(projects) {
  localStorage.setItem("storedProjects", JSON.stringify(projects));
}
