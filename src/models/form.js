import ToDo from "./toDos.js";

export function initForm(addTodoCallback) {
  const form = document.getElementById("todo-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = form.querySelector("#title").value;
    const description = form.querySelector("#description").value;
    const dueDate = form.querySelector("#dueDate").value;
    const priority = form.querySelector("#priority").value;

    const projectAssign = "Default Project";

    const todo = new ToDo(title, projectAssign, description, dueDate, priority);

    addTodoCallback(todo);
    form.reset();
  });
}
