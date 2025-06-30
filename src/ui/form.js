import ToDo from "../data/todo.js";

export function initForm(onNewToDo) {
  const todoForm = document.getElementById("todo-form");
  const todoList = document.getElementById("todo-list");

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const dueDate = document.getElementById("dueDate").value;

    const todo = new ToDo(title, "Default Project", dueDate, "Medium");

    onNewToDo(todo);

    todoForm.reset();
  });
}
