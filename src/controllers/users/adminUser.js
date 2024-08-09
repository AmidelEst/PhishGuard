// src/controllers/users/adminUser.js

const express = require('express');
const adminUserRouter = express.Router();
const AdminUser = require('../../models/users/adminUser');
const Whitelist = require('../../models/sites/whitelist');
const MonitoredSite = require('../../models/sites/monitoredSite');
const bcrypt = require('bcrypt');
const { generateToken, verifyToken } = require('../../utils/authUtils');
const roleMiddleware = require('../../middleware/roleMiddleware');

// 0) register - adminUser
adminUserRouter.post('/register', async (req, res) => {
	try {
		const { email, password } = req.body;
		const existingUser = await AdminUser.findOne({ email });

		if (existingUser) {
			return res.status(409).send({ success: false, message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new AdminUser({ ...req.body, password: hashedPassword });
		await newUser.save();

		res.status(201).send({
			success: true,
			message: 'User registered successfully',
		});
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

// 1) login - adminUser
adminUserRouter.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await AdminUser.findOne({ email });

		if (!user) {
			return res
				.status(401)
				.send({ success: false, message: 'Authentication failed. User not found.' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res
				.status(401)
				.send({ success: false, message: 'Authentication failed. Wrong password.' });
		}

		const token = generateToken({ _id: user._id });
		res.json({ success: true, token });
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});
// 2) logout - adminUser
adminUserRouter.post('/logout', (req, res) => {
	res.json({ success: true, message: 'Logged out successfully' });
});
// Create Whitelist
adminUserRouter.post('/createWhitelist', async (req, res) => {
	try {
		const { adminId } = req.body;

		// Verify the admin exists
		const admin = await AdminUser.findById(adminId);
		if (!admin) {
			return res.status(404).send({ success: false, message: 'Admin not found' });
		}

		// Create the whitelist
		const newWhitelist = new Whitelist({ adminId });
		await newWhitelist.save();

		res.status(201).send(
			{success: true,message: 'Whitelist created successfully',
			whitelist: newWhitelist,}
		);
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

// Add Site to Whitelist
adminUserRouter.post('/addSiteToWhitelist', roleMiddleware(['admin']), async (req, res) => {
	try {
		const { adminId, whitelistId, siteName, url, DOM, minHash } = req.body;

		// Verify the admin exists
		const admin = await AdminUser.findById(adminId);
		if (!admin) {
			return res.status(404).send({ success: false, message: 'Admin not found' });
		}

		// Verify the whitelist exists
		const whitelist = await Whitelist.findById(whitelistId);
		if (!whitelist) {
			return res.status(404).send({ success: false, message: 'Whitelist not found' });
		}

		// Create a new monitored site
		const newMonitoredSite = new MonitoredSite({ adminId, siteName, url, DOM, minHash });
		await newMonitoredSite.save();

		// Add the site to the whitelist
		whitelist.monitoredSites.push(newMonitoredSite._id);
		await whitelist.save();

		res.status(201).send({
			success: true,
			message: 'Site added to whitelist successfully',
			site: newMonitoredSite,
		});
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});

module.exports = adminUserRouter;
