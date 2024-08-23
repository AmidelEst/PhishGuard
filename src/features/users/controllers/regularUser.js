//------------------------------------------------------//
// src/features/users/controllers/users/regularUser.js
const express = require('express');
const regularUserRouter = express.Router();
//input handling
const sanitize = require('mongo-sanitize');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();
// Models
const RegularUser = require('../models/regularUser');
const AdminUser = require('../models/adminUser');
const Whitelist = require('../../sites/models/whitelist');
// Auth
const {
	generateAccessToken,
	verifyRefreshToken,
	getTokenExpiration,
	generateRefreshToken
} = require('../utils/auth/authUtils');
const roleMiddleware = require('../middleware/roleMiddleware');
const redisClient = require('../utils/auth/redisClient');

// ?---Token Assigning Process--------------
regularUserRouter.get('/refresh-token', roleMiddleware(['user']), async (req, res) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) {
			return res.status(401).json({ success: false, message: 'Refresh token is required.' });
		}

		const decoded = await verifyRefreshToken(refreshToken);
		const userId = await redisClient.get(`refreshToken:${refreshToken}`);

		if (!userId) {
			return res.status(403).json({ success: false, message: 'Invalid or expired refresh token.' });
		}

		// Generate new tokens
		const newAccessToken = generateAccessToken({ _id: decoded._id, role: decoded.role });
		const newRefreshToken = generateRefreshToken({ _id: decoded._id, role: decoded.role });

		// Store new refresh token in Redis and remove the old one
		await redisClient.del(`refreshToken:${refreshToken}`);
		await redisClient.set(`refreshToken:${newRefreshToken}`, decoded._id, 'EX', 60 * 60 * 24 * 7); // 7 days expiry

		res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
	} catch (error) {
		console.error('Error refreshing token:', error);
		res.status(500).json({ success: false, message: 'Could not refresh token.' });
	}
});
//? 1) login - PUBLIC
regularUserRouter.post('/login', async (req, res) => {
	try {
		// Sanitize and validate inputs
		const email = sanitize(req.body.email).trim().toLowerCase();
		const password = sanitize(req.body.password);

		if (!email || !password) {
			return res.status(400).send({ success: false, message: 'Email and password are required.' });
		}

		// Find the user by sanitized email
		const user = await RegularUser.findOne({ email });
		if (!user) {
			return res.status(401).send({ success: false, message: 'Invalid credentials.' });
		}
		// Check if the user has a subscribed whitelist
		if (!user.subscribedWhitelist) {
			return res.status(401).send({ success: false, message: 'User has no subscribed whitelist.' });
		}
		// Compare passwords
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({ success: false, message: 'Invalid credentials.' });
		}
		// Generate Access and Refresh Tokens
		const accessToken = generateAccessToken({ _id: user._id, role: 'user' });
		const refreshToken = generateRefreshToken({ _id: user._id, role: 'user' });

		// Convert user._id to string if necessary
		const userId = user._id.toString();

		// Set the refresh token in Redis with a 7-day expiration
		await redisClient.set(`refreshToken:${refreshToken}`, userId, 'EX', 60 * 60 * 24 * 7); // 7 days expiry
		res.json({
			success: true,
			accessToken: accessToken,
			refreshToken: refreshToken,
			subscribedWhitelistId: user.subscribedWhitelist._id
		});
	} catch (error) {
		console.error('Error during login:', error);
		res.status(500).send({ success: false, message: error.message });
	}
});
//^----------WITH TOKEN ACTIONS - PRIVATE--------------------
//^  after loginPage or at popup press
regularUserRouter.get('/whitelist/:id/monitored-sites', roleMiddleware(['user']), async (req, res) => {
	try {
		const id = req.params.id;
		const whitelist = await Whitelist.findById(id).populate({
			path: 'monitoredSites',
			model: 'monitored_sites'
		});
		if (!whitelist) {
			return res.status(404).json({ success: false, message: 'Whitelist not found' });
		}
		const monitoredSiteUrls = whitelist.monitoredSites.map(monitoredSite => monitoredSite.canonicalUrl);
		res.json({
			success: true,
			monitoredSites: monitoredSiteUrls
		});
	} catch (error) {
		console.error('Error fetching whitelist:', error);
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message
		});
	}
});
//^  details
regularUserRouter.get('/details', roleMiddleware(['user']), async (req, res) => {
	process.stdout.write(req.params + '\n');
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return res.sendStatus(401);
	RegularUser.findById(res.user._id, (err, foundUser) => {
		if (err || !foundUser) return res.status(404).send({ success: false, message: 'User not found.' });
		res.send({ success: true, email: foundUser.email, securityLevel: foundUser.securityLevel });
	});
});
//^  Security Level
regularUserRouter.get('/security-level', roleMiddleware(['user']), async (req, res) => {
	try {
		console.log(res.user._id); // Check if the user ID is correctly extracted
		const user = await RegularUser.findById(userId).select('securityLevel');
		if (!user) {
			return res.status(404).json({ success: false, message: 'User not found.' });
		}

		res.json({ success: true, securityLevel: user.securityLevel });
	} catch (error) {
		console.error('Error fetching security level:', error);
		res.status(500).json({ success: false, message: error.message });
	}
});
//^  2) TOKEN - logout
regularUserRouter.post('/logout', async (req, res) => {
	const token = req.headers.authorization?.split(' ')[1];
	const { refreshToken } = req.body;
	console.log('🚀 ~ logout ~ token:', token);
	console.log('🚀 ~ logout ~ refreshToken:', refreshToken);

	if (!token || !refreshToken) {
		return res.status(400).json({ success: false, message: 'No token provided' });
	}

	try {
		// Blacklist the access token
		const expiresIn = getTokenExpiration(token) - Math.floor(Date.now() / 1000);
		if (expiresIn > 0) {
			await redisClient.set(token, 'blacklisted', 'EX', expiresIn); // Blacklist access token
		}

		// Blacklist the refresh token
		await redisClient.del(`refreshToken:${refreshToken}`); // Remove the refresh token from Redis

		res.json({ success: true, message: 'Logged out successfully' });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Server error during logout' });
	}
});

//*----------RegisterPage - PUBLIC ----------------------
//* 0) handle register
regularUserRouter.post('/register', async (req, res) => {
	try {
		const { email, password, securityLevel, subscribedWhitelist } = req.body;
		console.log(email);
		const existingUser = await RegularUser.findOne({ email });

		if (existingUser) {
			return res.status(409).send({ success: false, message: 'User already exists' });
		}
		const saltRounds = parseInt(process.env.SALT_ROUNDS || 10);
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const newUser = new RegularUser({
			email,
			password: hashedPassword,
			securityLevel,
			subscribedWhitelist
		});
		await newUser.save();

		res.status(201).send({ success: true, message: 'User registered successfully' });
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});
//* GET admins
regularUserRouter.get('/admin-list', async (req, res) => {
	try {
		const admins = await AdminUser.find({}, 'email name'); // Fetch only email and name
		res.status(200).json({ success: true, admins });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});
//* GET admin's Whitelists
regularUserRouter.get('/adminsWhitelists', async (req, res) => {
	try {
		const adminName = req.query.adminName;
		if (!adminName) {
			return res.status(400).json({ success: false, message: 'Admin name is required' });
		}

		// Find the admin by name
		const admin = await AdminUser.findOne({ name: adminName });
		if (!admin) {
			return res.status(404).json({ success: false, message: 'Admin not found' });
		}

		// Find whitelists associated with the admin
		const whitelists = await Whitelist.find({ adminId: admin._id });

		res.json({ success: true, whitelists });
	} catch (error) {
		console.error('Error fetching whitelists:', error);
		res.status(500).json({ success: false, message: 'Server error' });
	}
});

module.exports = regularUserRouter;
