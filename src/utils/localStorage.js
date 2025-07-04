import { generateUUID } from "../utils/id.js";
import { Project } from "../models/projects.js";

/**
 * Stores data in localStorage
 * @param {string} key - The key under which to store the data
 * @param {*} value - The data to store (will be stringified)
 */
export function storeData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Retrieves projects from localStorage or creates a default project if none exists
 * @returns {Project[]} Array of Project instances
 */
export function retrieveProjects() {
  const storedProjects = localStorage.getItem("storedProjects");

  if (storedProjects) {
    try {
      const parsed = JSON.parse(storedProjects);

      return parsed.map((p) => {
        const project = new Project(p.name);
        project.id = p.id || generateUUID();
        project.todos = p.todos || [];
        return project;
      });
    } catch (error) {
      console.error("Error parsing stored projects:", error);

      return [new Project("Default Project")];
    }
  }

  return [new Project("Default Project")];
}

/**
 * Saves projects to localStorage
@param {Project[]} projects - Array of Project instances to save
 */
export function saveProjects(projects) {
  storeData("storedProjects", projects);
}

// Utility function for generating UUIDs (in case it's needed here)
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback if crypto.randomUUID not supported:
  return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
