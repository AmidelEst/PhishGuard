// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const { run, client } = require('./src/config/db');

// Assuming you have a User model in a file like 'User.js'
const User = require('./src/models/user');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Body parser middleware
app.use(express.json());

// Connect to MongoDB
run().catch(console.dir);

// User Signup Route
app.post('/user/create', async (req, res) => {
  try {
      // Assuming the request body contains user data
      const userData = req.body;
  
      // Access a specific database
      const database = client.db('UserManagementDB');
  
      // Access a specific collection in that database
      const collection = database.collection('Users');
  
      // Perform the insertion
      const result = await collection.insertOne(userData);
  
      console.log('Inserted document with _id:', result.insertedId);
  
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});
app.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const database = client.db('UserManagementDB');
    const collection = database.collection('Users');

    // Find the user with the provided email and password
    const user = await collection.findOne({ email, password });

    if (user) {
      console.log('User logged in successfully');
      // Send a response indicating successful login
      res.status(200).send('Login successful');
    } else {
      console.log('Invalid credentials');
      // Send a response indicating invalid credentials
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal server error');
  }
});
// Other existing routes...
app.get('/signup', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/popup.html');
});

// Server listening on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
