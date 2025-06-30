import { isDate, makeNewDate } from "./utils/date.js";
import { generateUUID } from "../utils/id.js";

class newToDo {
  constructor(
    title,
    projectAssign,
    dueDate,
    priority,
    checklist,
    label,
    isCompleted
  ) {
    this.title = title;
    this.projectAssign = projectAssign;
    this.dueDate = dueDate;
    this.priority = priority;
    this.checklist = checklist;
    this.label = label;
    this.isCompleted = isCompleted;
    this.noteID = generateUUID();
  }
}
