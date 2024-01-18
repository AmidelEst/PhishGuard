// src/config/db.js
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI; // It's best practice to use environment variables for sensitive information
const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Connected successfully to MongoDB');
  } catch (error) {
    console.error('Could not connect to MongoDB', error);
  }
}

module.exports = { client, run };
