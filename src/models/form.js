import ToDo from "./toDos.js";

export function initForm(addTodoCallback) {
  const form = document.getElementById("todo-form");
  if (!form) throw new Error("Form element not found!");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const todo = new ToDo(
      form.querySelector("#title").value,
      "Default Project",
      form.querySelector("#description").value,
      form.querySelector("#dueDate").value,
      form.querySelector("#priority").value
    );

    addTodoCallback(todo);
    form.reset();
  });
}
