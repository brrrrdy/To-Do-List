# To-Do List

https://brrrrdy.github.io/To-Do-List

![To-Do List screenshot](https://tomalvarez.xyz/assets/scrn_todo-BiP_SKLe.webp)

## REQUIREMENTS

- Todo items created dynamically using classes, with title, description, due date and priority
- Separate projects/lists, with a default project on first load
- Create new projects and assign todos to them
- View all projects and all todos within each project
- Expand a single todo to see and edit its details
- Delete a todo
- Priority visualised through colour coding
- Data persisted to localStorage so todos survive a page refresh
- Date formatting via date-fns

## ABOUT

A todo list app built as part of The Odin Project JavaScript course, designed to practise application architecture, modular JavaScript, and working with the Web Storage API.

Application logic and DOM manipulation are kept in separate modules, keeping the codebase clean and maintainable. Todo items and projects are constructed using classes, serialised to JSON, and saved to localStorage on every change — with methods re-attached on retrieval
to work around JSON's inability to store functions.

Date handling is managed with the date-fns library, and todos are colour coded by priority to give the interface a clear visual hierarchy at a glance.

## BUILT WITH

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![Webpack](https://img.shields.io/badge/webpack-%238DD6F9.svg?style=for-the-badge&logo=webpack&logoColor=black)
