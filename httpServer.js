import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const INDEX_FILE = path.join(__dirname, 'public', 'index.html');

// Part A uses a JavaScript array; no database is required.
const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending' },
  { id: 2, taskName: 'Prepare Project Report', assignedTo: 'Priya Verma', status: 'In Progress' },
  { id: 3, taskName: 'Test Website', assignedTo: 'Amit Kumar', status: 'Completed' },
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function sendText(res, statusCode, message, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(message);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;
    const maxBodySize = 1024 * 1024;

    req.on('data', (chunk) => {
      if (tooLarge) return;
      body += chunk;
      if (Buffer.byteLength(body, 'utf8') > maxBodySize) {
        tooLarge = true;
        body = '';
      }
    });

    req.on('end', () => {
      if (tooLarge) {
        reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
        return;
      }
      if (!body.trim()) {
        reject(Object.assign(new Error('Request body is required.'), { statusCode: 400 }));
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(Object.assign(new Error('Invalid JSON in request body.'), { statusCode: 400 }));
      }
    });

    req.on('error', (error) => reject(error));
  });
}

function hasRequiredTaskFields(task) {
  return (
    task &&
    task.id !== null && task.id !== undefined && task.id !== '' &&
    typeof task.id !== 'boolean' &&
    Number.isInteger(Number(task.id)) &&
    typeof task.taskName === 'string' && task.taskName.trim() !== '' &&
    typeof task.assignedTo === 'string' && task.assignedTo.trim() !== '' &&
    typeof task.status === 'string' && task.status.trim() !== ''
  );
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const route = requestUrl.pathname;

  if (route === '/' && req.method === 'GET') {
    sendText(
      res,
      200,
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Employee Task Management</title></head><body><h1>Welcome to Employee Task Management</h1><p>Node.js HTTP server is running successfully.</p></body></html>',
      'text/html; charset=utf-8',
    );
    return;
  }

  if (route === '/tasks' && req.method === 'GET') {
    sendJson(res, 200, tasks);
    return;
  }

  if (route === '/about' && req.method === 'GET') {
    sendText(res, 200, 'Employee Task Management is a Node.js application used to manage employee tasks and their status.');
    return;
  }

  // Serve public/index.html with the built-in FS module.
  if (route === '/home' && req.method === 'GET') {
    fs.readFile(INDEX_FILE, 'utf8', (error, html) => {
      if (error) {
        console.error('Could not read public/index.html:', error.message);
        sendText(res, 500, 'Unable to load the home page.');
        return;
      }
      sendText(res, 200, html, 'text/html; charset=utf-8');
    });
    return;
  }

  if (route === '/add-task' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      sendJson(res, 415, { message: 'Content-Type must be application/json.' });
      return;
    }

    try {
      const newTask = await readJsonBody(req);
      if (!hasRequiredTaskFields(newTask)) {
        sendJson(res, 400, { message: 'Required fields are id, taskName, assignedTo and status.' });
        return;
      }

      const taskId = Number(newTask.id);
      if (tasks.some((task) => task.id === taskId)) {
        sendJson(res, 409, { message: 'A task with this ID already exists.' });
        return;
      }

      const taskToAdd = {
        id: taskId,
        taskName: newTask.taskName.trim(),
        assignedTo: newTask.assignedTo.trim(),
        status: newTask.status.trim(),
      };
      tasks.push(taskToAdd);
      sendJson(res, 201, { message: 'Task added successfully.', task: taskToAdd });
    } catch (error) {
      sendJson(res, error.statusCode || 400, { message: error.message || 'Invalid request.' });
    }
    return;
  }

  const knownRoutes = ['/', '/tasks', '/about', '/home', '/add-task'];
  if (knownRoutes.includes(route)) {
    sendJson(res, 405, { message: 'Method not allowed for this route.' });
    return;
  }

  sendJson(res, 404, { message: 'Route not found.' });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
