// server.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public')); // Serve static files from the 'public' directory

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Connect to MongoDB
const { run } = require('./src/config/db');
run().catch(console.dir);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// signInButton.addEventListener('click', function () {
//   window.location.href = '/login';
// });
