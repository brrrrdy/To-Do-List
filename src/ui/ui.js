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
