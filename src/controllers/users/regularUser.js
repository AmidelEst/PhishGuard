// src/controllers/users/regularUser.js
const express = require('express');
const bcrypt = require('bcrypt');
const regularUserRouter = express.Router();
const RegularUser = require('../../models/users/regularUser');
const AdminUser = require('../../models/users/adminUser');
const Whitelist = require('../../models/sites/whitelist');
const { generateToken, verifyToken } = require('../../utils/authUtils');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return res.sendStatus(401); // Unauthorized

	const user = verifyToken(token);
	if (!user) return res.sendStatus(403); // Forbidden

	req.user = user; // Attach the user information to the request object
	next(); // Proceed to the next middleware or route handler
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
		// Find the user and populate the subscribed whitelist
		const user = await RegularUser.findOne({ email: email.trim().toLowerCase() }).populate(
			{
				path: 'subscribedWhitelist',
				populate: { path: 'Whitelists', model: 'monitored_sites' },
			}
		);
		if (!user) {
			return res.status(401).send({ success: false, message: 'User not found.' });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({ success: false, message: 'Wrong password.' });
		}
		const token = generateToken({ _id: user._id, role: 'user' });
		// Extract URLs from the populated monitored sites
		const monitoredSiteUrls = user.subscribedWhitelist.Whitelists.map((site) => site.url);
		res.json({
			success: true,
			token: token,
			subscribedWhitelist: monitoredSiteUrls,
		});
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

// 2) POST - logout - regularUser
regularUserRouter.post('/logout', (req, res) => {
	res.json({ success: true, message: 'Logged out successfully' });
});

// GET - details - regularUser
regularUserRouter.get('/details', authenticateToken, async (req, res) => {
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

regularUserRouter.get('/whitelist/:id', authenticateToken, async (req, res) => {
	try {
		const whitelistId = req.params.id;
		console.log(whitelistId);
		// Find the whitelist by its ID
		const whitelist = await Whitelist.findById(whitelistId);

		if (!whitelist) {
			return res.status(404).json({ success: false, message: 'Whitelist not found' });
		}

		res.json({ success: true, whitelist });
	} catch (error) {
		console.error('Error fetching whitelist:', error);
		res.status(500).json({ success: false, message: 'Server error' });
	}
});

module.exports = regularUserRouter;
