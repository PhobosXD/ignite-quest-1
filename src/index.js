const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not exist!' });
  }

  request.user = user;

  return next();
}

function checkNotExistsUserAccount(request, response, next) {
  const { username } = request.body;
  const userAlreadyExist = users.some((user) => user.username === username);

  if (userAlreadyExist) {
    return response.status(400).json({ error: 'Username already exist!' });
  }

  return next();
}

function checkExistTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not exist!' });
  }

  request.todo = todo;

  return next();
}

app.post('/users',checkNotExistsUserAccount, (request, response) => {
  const { name, username } = request.body;
  
  const user = {
    id: v4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const todo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put(
  '/todos/:id',
  checksExistsUserAccount,
  checkExistTodo,
  (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch(
  '/todos/:id/done',
  checksExistsUserAccount,
  checkExistTodo,
  (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.json(todo);
});

app.delete(
  '/todos/:id',
  checksExistsUserAccount, checkExistTodo,
  (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;