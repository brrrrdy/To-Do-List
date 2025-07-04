import { projects } from "../models/projects";
import { tasks } from "./tasks";

export function storeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function retrieveProjects() {
  let storedProjects = localStorage.getItem("storedProjects");
  let deserializedProjects;

  if (storedProjects) {
    deserializedProjects = JSON.parse(storedProjects);
    projects.length = 0;
    deserializedProjects.forEach((project) => projects.push(project));
  } else {
    deserializedProjects = projects;
    storeData("storedProjects", projects);
  }
  return deserializedProjects;
}

export function retrieveTasks() {
  let storedTasks = localStorage.getItem("storedTasks");
  let deserializedTasks;

  if (storedTasks) {
    deserializedTasks = JSON.parse(storedTasks);
    Object.keys(tasks).forEach((task) => delete tasks[task]);
    Object.keys(deserializedTasks).forEach((task) => {
      tasks[task] = deserializedTasks[task];
    });
  } else {
    deserializedTasks = tasks;
    storeData("storedTasks", tasks);
  }
  return deserializedTasks;
}

export function saveProjects() {
  storeData("storedProjects", projects);
}

export function saveTasks() {
  storeData("storedTasks", tasks);
}
