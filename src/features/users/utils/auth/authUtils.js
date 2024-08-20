//-----------------------------------------------------
// src/features/users/utils/auth/authUtils.js
const redisClient = require('./redisClient');
const jwt = require('jsonwebtoken');

// Generate Access Token (short-lived)
const generateAccessToken = payload => {
	accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
	return accessToken;
};
// Generate Refresh Token (long-lived)
const generateRefreshToken = payload => {
	return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }); // Refresh token lasts 7 days
};

// Verify Access Token
const verifyAccessToken = async token => {
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

// Verify Refresh Token
const verifyRefreshToken = async token => {
	try {
		const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
		return decoded;
	} catch (error) {
		throw new Error('Invalid refresh token');
	}
};

// Get Token Expiration Time
const getTokenExpiration = token => {
	const decoded = jwt.decode(token);
	return decoded.exp;
};

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	getTokenExpiration
};
