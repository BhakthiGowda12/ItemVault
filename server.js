const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

const USERS_FILE = 'users.json';
const LOST_FILE = 'lostItems.json';
const FOUND_FILE = 'foundItems.json';

function read(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file));
}

function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (!req.cookies.username) {
    return res.redirect('/login.html');
  }
  next();
}

// Signup
app.post('/signup', (req, res) => {
  const users = read(USERS_FILE);
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.send("Username exists. <a href='/signup.html'>Try again</a>");
  }
  users.push({ username, password });
  write(USERS_FILE, users);
  res.redirect('/login.html');
});

// Login
/*app.post('/login', (req, res) => {
  const users = read(USERS_FILE);
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.send("Invalid credentials. <a href='/login.html'>Try again</a>");
  res.cookie('username', username);
  res.redirect('/index.html');
});*/
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = JSON.parse(fs.readFileSync('users.json'));

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.redirect('/index.html');
    } else {
        res.send('Invalid username or password');
    }
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/login.html');
});

// Submit Lost
app.post('/submit-lost', requireLogin, (req, res) => {
  const items = read(LOST_FILE);
  req.body.username = req.cookies.username;
  items.push(req.body);
  write(LOST_FILE, items);
  res.redirect('/lost_list.html');
});

// Submit Found
app.post('/submit-found', requireLogin, (req, res) => {
  const items = read(FOUND_FILE);
  req.body.username = req.cookies.username;
  items.push(req.body);
  write(FOUND_FILE, items);
  res.redirect('/found_list.html');
});

// APIs to fetch data
app.get('/lost-items', (req, res) => {
  res.json(read(LOST_FILE));
});

app.get('/found-items', (req, res) => {
  res.json(read(FOUND_FILE));
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
