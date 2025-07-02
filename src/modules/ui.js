import { initForm } from "./form.js";
import { loadProjects, saveProjects } from "./projects.js";
import { renderProjects, renderTodos } from "./dom.js";

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
