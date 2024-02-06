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

// Server listening on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
