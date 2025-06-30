import ToDo from "../data/todo.js";

export function initForm(addTodoCallback) {
  const form = document.getElementById("todo-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = form.querySelector("#title").value;
    const description = form.querySelector("#description").value;
    const dueDate = form.querySelector("#dueDate").value;

    const projectAssign = "Default Project";
    const priority = "Normal";

    const todo = new ToDo(title, projectAssign, description, dueDate, priority);

    addTodoCallback(todo);

    form.reset();
  });
}
