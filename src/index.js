import ToDo from "./data/todo.js";

const todo1 = new ToDo(
  "Learn Webpack",
  "Practice Project",
  "2025-07-15",
  "High",
  ["Setup config", "Write modules"],
  "Learning",
  false
);

const outputDiv = document.getElementById("output");
outputDiv.textContent = `Created ToDo: ${todo1.title}, Due: ${todo1.dueDate}`;
console.log(todo1);
