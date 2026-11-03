import express from 'express';

const app = express();
const PORT = 4000;

// Parse JSON request bodies.
app.use(express.json());

// Sample tasks are stored in a JavaScript array (no database).
const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Design Dashboard', assignedTo: 'Priya Verma', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Test Website', assignedTo: 'Amit Kumar', status: 'Completed', priority: 'Low' },
];

const allowedFields = ['taskName', 'assignedTo', 'status', 'priority'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasRequiredTaskFields(task) {
  return (
    task &&
    Number.isInteger(Number(task.id)) &&
    String(task.id).trim() !== '' &&
    isNonEmptyString(task.taskName) &&
    isNonEmptyString(task.assignedTo) &&
    isNonEmptyString(task.status)
  );
}

// GET /tasks - Retrieve all tasks.
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// GET /tasks/:id - Retrieve one task by ID.
app.get('/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const task = tasks.find((item) => item.id === taskId);
  if (!task) {
    return res.status(404).json({ message: 'Task not found.' });
  }
  return res.status(200).json(task);
});

// POST /tasks - Add a new task.
app.post('/tasks', (req, res) => {
  const newTask = req.body;
  if (!hasRequiredTaskFields(newTask)) {
    return res.status(400).json({
      message: 'Required fields are id, taskName, assignedTo and status.',
    });
  }

  const taskId = Number(newTask.id);
  if (tasks.some((task) => task.id === taskId)) {
    return res.status(409).json({ message: 'A task with this ID already exists.' });
  }

  const taskToAdd = {
    id: taskId,
    taskName: newTask.taskName.trim(),
    assignedTo: newTask.assignedTo.trim(),
    status: newTask.status.trim(),
    priority: isNonEmptyString(newTask.priority) ? newTask.priority.trim() : 'Medium',
  };

  tasks.push(taskToAdd);
  return res.status(201).json({ message: 'Task added successfully', task: taskToAdd });
});

// PUT /tasks/:id - Update an existing task.
app.put('/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const taskIndex = tasks.findIndex((item) => item.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  const updates = req.body;
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return res.status(400).json({ message: 'Request body must be a JSON object.' });
  }

  const updateKeys = Object.keys(updates).filter((key) => key !== 'id');
  if (updateKeys.length === 0 || updateKeys.some((key) => !allowedFields.includes(key))) {
    return res.status(400).json({ message: 'Provide valid task fields to update.' });
  }

  for (const key of updateKeys) {
    if (!isNonEmptyString(updates[key])) {
      return res.status(400).json({ message: `${key} must be a non-empty string.` });
    }
  }

  const updatedTask = {
    ...tasks[taskIndex],
    ...Object.fromEntries(updateKeys.map((key) => [key, updates[key].trim()])),
  };
  tasks[taskIndex] = updatedTask;

  return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
});

// DELETE /tasks/:id - Delete a task.
app.delete('/tasks/:id', (req, res) => {
  const taskId = Number(req.params.id);
  const taskIndex = tasks.findIndex((item) => item.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found.' });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  return res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
});

// Return JSON for unknown endpoints.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Handle invalid JSON and unexpected errors.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Invalid JSON in request body.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
