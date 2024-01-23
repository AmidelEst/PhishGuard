// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Assuming you have a User model in a file like 'User.js'
const User = require('./src/models/user');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Body parser middleware
app.use(express.json());

// Connect to MongoDB
const { run } = require('./src/config/db');
run().catch(console.dir);

// User Signup Route
app.post('/user/create', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Other existing routes...
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Server listening on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
