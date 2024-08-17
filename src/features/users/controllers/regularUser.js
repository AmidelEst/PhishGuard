// src/features/users/controllers/users/regularUser.js
const express = require('express');
const bcrypt = require('bcrypt');
const regularUserRouter = express.Router();
const RegularUser = require('../models/regularUser');
const AdminUser = require('../models/adminUser');
const Whitelist = require('../../sites/models/whitelist');
const {
	generateToken,
	verifyToken,
	getTokenExpiration,
} = require('../utils/auth/authUtils');
const redisClient = require('../utils/auth/redisClient');

// Function to blacklist a token
const blacklistToken = async (token, expiresIn) => {
    await redisClient.set(token, 'blacklisted', 'EX', expiresIn);
};
// 0) POST - register - regularUser
regularUserRouter.post('/register', async (req, res) => {
	try {
		const { email, password, subscribedWhitelist } = req.body;
		const existingUser = await RegularUser.findOne({ email });

		if (existingUser) {
			return res.status(409).send({ success: false, message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new RegularUser({
			email,
			password: hashedPassword,
			subscribedWhitelist,
		});
		await newUser.save();

		res.status(201).send({ success: true, message: 'User registered successfully' });
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});
// 1) POST - login - regularUser
regularUserRouter.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		// Find the user
		const user = await RegularUser.findOne({ email: email.trim().toLowerCase() });
		if (!user) {
			return res.status(401).send({ success: false, message: 'User not found.' });
		}
		// Check if the user has a subscribed whitelist
		if (!user.subscribedWhitelist) {
			return res
				.status(500)
				.send({ success: false, message: 'User has no subscribed whitelist.' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({ success: false, message: 'Wrong password.' });
		}
		const token = generateToken({ _id: user._id, role: 'user' });
		const subscribedWhitelistId = user.subscribedWhitelist._id;
		
		// Extract the subscribedWhitelistId and return it along with the token
		res.json({
			success: true,
			token: token,
			subscribedWhitelistId: subscribedWhitelistId,
		});
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});
// 2) POST - logout - regularUser
regularUserRouter.post('/logout', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
	if (!token) {
		return res.status(400).json({ success: false, message: 'No token provided' });
	}

	try {
		const expiresIn = getTokenExpiration(token) - Math.floor(Date.now() / 1000);
		await blacklistToken(token, expiresIn);
		res.json({ success: true, message: 'Logged out successfully' });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Server error during logout' });
	}
});
// GET - details - regularUser
regularUserRouter.get('/details', async (req, res) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return res.sendStatus(401);

	const user = verifyToken(token);
	if (!user) return res.sendStatus(403);

	RegularUser.findById(user._id, (err, foundUser) => {
		if (err || !foundUser)
			return res.status(404).send({ success: false, message: 'User not found.' });

		res.send({ success: true, email: foundUser.email });
	});
});
// GET - admin-list - No need for token
regularUserRouter.get('/admin-list', async (req, res) => {
	try {
		const admins = await AdminUser.find({}, 'email name'); // Fetch only email and name
		res.status(200).json({ success: true, admins });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});
// GET - admin's whitelist - No need for token
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
// Get -  after loginPage or at popup press - regularUser TOKEN -
regularUserRouter.get('/whitelist/:id/monitored-sites', async (req, res) => {
	try {
		const id = req.params.id;

		const whitelist = await Whitelist.findById(id).populate({
			path: 'monitoredSites',
			model: 'monitored_sites',
		});

		if (!whitelist) {
			return res.status(404).json({ success: false, message: 'Whitelist not found' });
		}

		// if (!Array.isArray(whitelist.monitoredSites)) {
		// 	console.error('monitoredSites is not an array:', whitelist.monitoredSites);
		// }

		const monitoredSiteUrls = whitelist.monitoredSites.map((monitoredSite) => monitoredSite.canonicalUrl);

		// console.log('Returning monitored sites:', monitoredSiteUrls); // Add this line to log the monitored sites

		res.json({
			success: true,
			monitoredSites: monitoredSiteUrls,
		});
	} catch (error) {
		console.error('Error fetching whitelist:', error);
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: error.message,
		});
	}
});


module.exports = regularUserRouter;
