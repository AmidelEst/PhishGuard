// src/utils/redisClient.js

const dotenv = require('dotenv');
dotenv.config();
const redis = require('redis');

const client = redis.createClient({
	url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.on('error', (err) => console.error('Redis Client Error', err));

client
	.connect()
	.then(() => {
		console.log('Connected to Redis');
	})
	.catch((err) => {
		console.error('Error connecting to Redis:', err);
	});

module.exports = client;