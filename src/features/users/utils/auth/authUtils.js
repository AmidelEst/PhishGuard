// src/utils/authUtils.js
const redisClient = require('./redisClient');
const jwt = require('jsonwebtoken');

// Function to generate a JWT token
const generateToken = (payload) => {
	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: '24h',
	});
};

// Verify if a token is valid and not blacklisted
const verifyToken = async (token) => {
    try {
        const reply = await redisClient.get(token);
        if (reply === 'blacklisted') {
            throw new Error('Token is blacklisted');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        throw err;
    }
};

// Function to extract the expiration time from the token
const getTokenExpiration = (token) => {
    const decoded = jwt.decode(token);
    return decoded.exp; // Return the expiration time in seconds since the epoch
};

module.exports = {
    generateToken,
    verifyToken,
    getTokenExpiration,
};
