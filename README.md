# MT1-LABEXAM – Employee Task Management

A Node.js lab examination project that demonstrates the built-in HTTP and FS modules, routing, HTTP methods, static file serving, and REST APIs using Express.js.

## Requirements

- Node.js (version 18 or later)
- npm

## Project structure

```text
MT1-LABEXAM/
├── package.json
├── httpServer.js
├── expressApp.js
├── public/
│   └── index.html
└── screenshots/
```

## Setup

Open a terminal in the project folder and run:

```bash
npm install
```

## Part A – Node.js HTTP and FS modules

Start the HTTP server:

```bash
npm run start:http
```

The server runs at `http://localhost:3000`.

| Method | URL | Expected result |
|---|---|---|
| GET | `http://localhost:3000/` | Welcome page in HTML |
| GET | `http://localhost:3000/tasks` | All tasks in JSON |
| GET | `http://localhost:3000/about` | Application information |
| GET | `http://localhost:3000/home` | `public/index.html` served using FS |
| POST | `http://localhost:3000/add-task` | Adds a task to the in-memory array |

For `POST /add-task`, choose **Body → raw → JSON** and send:

```json
{
  "id": 4,
  "taskName": "Develop REST API",
  "assignedTo": "Amit Kumar",
  "status": "Pending"
}
```

## Part B – Express.js REST API

Open a **second terminal** in the project folder and run:

```bash
npm run start:express
```

The Express server runs at `http://localhost:4000`.

| Method | URL | Expected result |
|---|---|---|
| GET | `http://localhost:4000/tasks` | Retrieve all tasks |
| GET | `http://localhost:4000/tasks/1` | Retrieve task with ID 1 |
| POST | `http://localhost:4000/tasks` | Add a task (success status: 201) |
| PUT | `http://localhost:4000/tasks/1` | Update task with ID 1 |
| DELETE | `http://localhost:4000/tasks/1` | Delete task with ID 1 |

### Sample POST body

```json
{
  "id": 4,
  "taskName": "Develop REST API",
  "assignedTo": "Amit Kumar",
  "status": "Pending",
  "priority": "Medium"
}
```

### Sample PUT body

```json
{
  "taskName": "Develop Login Page",
  "assignedTo": "Rahul Sharma",
  "status": "Completed",
  "priority": "High"
}
```

For POST and PUT, choose **Body → raw → JSON** in EchoAPI. Test the DELETE request after completing the GET, POST and PUT tests.

## Screenshots for submission

Save screenshots in the `screenshots/` folder:

1. HTTP server running in the terminal.
2. Browser output for `/`, `/tasks`, `/about` and `/home`.
3. EchoAPI responses for Express GET all, GET by ID, POST, PUT and DELETE.
4. GitHub repository page and commit history.

Do not add `node_modules` to GitHub; it is excluded by `.gitignore`.

## Notes

- No database is used. Both servers maintain data in JavaScript arrays while they are running.
- Part A uses only Node.js built-in `http` and `fs` modules; it does not use Express.
- Part B uses Express.js and runs independently on port 4000.
- The two servers have separate in-memory task arrays.
