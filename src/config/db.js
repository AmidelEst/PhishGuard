// src/config/db.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI; // It's best practice to use environment variables for sensitive information
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  socketTimeoutMS: 30000, // Adjust the value as needed
});

async function run() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');

    // Optionally, ping the database
    const database = client.db('UserManagementDB');
    const pingResult = await database.command({ ping: 1 });
    console.log('Ping result:', pingResult);

  } catch (error) {
    console.error('Could not connect to MongoDB', error);
  }
}

module.exports = { client, run };