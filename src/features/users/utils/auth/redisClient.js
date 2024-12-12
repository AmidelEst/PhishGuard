//-----------------------------------------------------
// src/features/users/utils/auth/redisClient.js

const dotenv = require('dotenv');
dotenv.config();
const redis = require('redis');

const redisHost = process.env.REDIS_HOST || 'localhost'; // Fallback to 'localhost' for local development
const redisPort = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
	url: `redis://${redisHost}:${redisPort}`
});
client.on('error', err => console.error('Redis Client Error', err));

client
	.connect()
	.then(() => {
		// console.log('Connected to Redis');
		console.log(`Connected to Redis at ${redisHost}:${redisPort}`);
	})
	.catch(err => {
		console.error('Error connecting to Redis:', err);
	});

module.exports = client;
