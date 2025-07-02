import { initForm } from "./modules/form.js";

const todoList = [];
const container = document.getElementById("container");

// Create a <ul> inside container for todo items
const ul = document.createElement("ul");
container.appendChild(ul);

function addTodoToUI(todo) {
  todoList.push(todo);
  const li = document.createElement("li");
  li.textContent = `${todo.title} ${todo.description} — due on ${todo.dueDate}`;
  ul.appendChild(li);
}

initForm(addTodoToUI);
