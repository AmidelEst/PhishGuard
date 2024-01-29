require('dotenv').config();
const express = require('express');
const { run } = require('./src/config/db');
const app = express();

// Connect to MongoDB
run().catch(console.dir);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
