import ToDo from "./data/todo.js";
import { initForm } from "./ui/form.js";

const todoList = []; // store todos here
const container = document.getElementById("container");

// Create a <ul> for the todos inside container if you don’t have one yet
const ul = document.createElement("ul");
container.appendChild(ul);

function addTodoToUI(todo) {
  todoList.push(todo);

  const li = document.createElement("li");
  li.textContent = `${todo.title} — due on ${todo.dueDate}`;
  ul.appendChild(li);
}

// Initialize form and provide the callback
initForm(addTodoToUI);
