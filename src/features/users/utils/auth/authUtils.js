// src/features/users/utils/auth/authUtils.js
const redisClient = require('./redisClient');
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};
const verifyToken = async (token) => {
	try {
		const isBlacklisted = await redisClient.get(token);
		if (isBlacklisted === 'blacklisted') {
			throw new Error('Token is blacklisted');
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		return decoded;
	} catch (error) {
		throw new Error(error.message);
	}
};
const getTokenExpiration = (token) => {
	const decoded = jwt.decode(token);
	return decoded.exp;
};

module.exports = { generateToken, verifyToken, getTokenExpiration };
