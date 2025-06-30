import { newDate, parseISO } from "../utils/date.js";
import { generateUUID } from "../utils/id.js";

export default class ToDo {
  constructor(
    title,
    projectAssign,
    dueDate,
    priority,
    checklist = [],
    label = null,
    isCompleted = false
  ) {
    this.title = title;
    this.projectAssign = projectAssign;
    this.dueDate = isDate(dueDate) ? dueDate : makeNewDate(dueDate);
    this.priority = priority;
    this.checklist = checklist;
    this.label = label;
    this.isCompleted = isCompleted;
    this.noteID = generateUUID();
  }
}
