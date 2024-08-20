//------------------------------------------------------//
// src/features/users/controllers/adminUser.js
const express = require('express');
const adminUserRouter = express.Router();
// models
const AdminUser = require('../models/adminUser');
const Whitelist = require('../../sites/models/whitelist');
const MonitoredSite = require('../../sites/models/monitoredSite');
//logics
const { storeCertificateForSite, fetchSSLCertificate } = require('../../sites/utils/certificate/certificate');
const { compressAndHashHTML } = require('../../sites/utils/cyber/urlToHash');
const { normalizeUrl, generateUrlPattern } = require('../../sites/utils/urls/url');
//auth
const { generateAccessToken, getTokenExpiration } = require('../utils/auth/authUtils');
const roleMiddleware = require('../middleware/roleMiddleware');
const redisClient = require('../utils/auth/redisClient');
const bcrypt = require('bcrypt');

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
			message: 'User registered successfully'
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
			return res.status(401).send({ success: false, message: 'Authentication failed. User not found.' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).send({ success: false, message: 'Authentication failed. Wrong password.' });
		}

		const token = generateAccessToken({ _id: user._id, role: 'admin' });
		res.json({ success: true, token });
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});
// 2) TOKEN - logout - adminUser
adminUserRouter.post('/logout', roleMiddleware(['admin']), async (req, res) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) {
		return res.status(400).json({ success: false, message: 'No token provided' });
	}
	try {
		const expiresIn = getTokenExpiration(token) - Math.floor(Date.now() / 1000);
		await redisClient.set(token, 'blacklisted', 'EX', expiresIn);
		res.json({ success: true, message: 'Successfully logged out and token blacklisted.' });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Failed to log out.' });
	}
});
// TOKEN - Create Whitelist
adminUserRouter.post('/createWhitelist', roleMiddleware(['admin']), async (req, res) => {
	try {
		const { whitelistName } = req.body;

		// Get the adminId from req.user, which is set by the roleMiddleware
		const adminId = req.user._id;

		// Verify the admin exists
		const admin = await AdminUser.findById(adminId);
		if (!admin) {
			return res.status(404).send({ success: false, message: 'Admin not found' });
		}

		// Create the whitelist
		const newWhitelist = new Whitelist({ adminId, whitelistName });
		await newWhitelist.save();

		res.status(201).send({
			success: true,
			message: 'Whitelist created successfully'
		});
	} catch (error) {
		res.status(500).send({ success: false, message: error.message });
	}
});
// TOKEN - Add Site/site's to Whitelist
adminUserRouter.post('/addSiteToWhitelist', roleMiddleware(['admin']), async (req, res) => {
	try {
		const { whitelistName, sites } = req.body;
		const adminId = req.user._id;

		// Verify that the whitelist exists for this admin
		const whitelist = await Whitelist.findOneAndUpdate(
			{ adminId, whitelistName }, // Query to match
			{ $setOnInsert: { adminId, whitelistName } }, // Set on insert if no match found
			{ new: true, upsert: true, setDefaultsOnInsert: true } // Upsert options
		);

		// Array to store results
		const addedSites = [];
		const errors = [];

		// Loop through the sites array
		for (let site of sites) {
			const { siteName, url } = site;

			// Normalize the canonical URL
			const canonicalUrl = normalizeUrl(url); // Assuming normalizeUrl is a utility function to normalize URLs

			// Check if the site already exists
			const existingSite = await MonitoredSite.findOne({ canonicalUrl });
			if (existingSite) {
				errors.push({ siteName, message: 'Site already exists' });
				continue; // Skip to the next site
			}

			// Generate the URL pattern for variations
			const urlPattern = generateUrlPattern(canonicalUrl); // Assuming generateUrlPattern is a utility function for creating a pattern

			// Process the site (hash the HTML content and other logic)
			const hashedResult = await compressAndHashHTML(canonicalUrl);
			if (!hashedResult) {
				errors.push({ siteName, message: 'Failed to hash site content' });
				continue; // Skip to the next site
			}

			// Create a new monitored site
			const newMonitoredSite = new MonitoredSite({
				whitelistId: whitelist._id,
				siteName,
				canonicalUrl,
				urlPattern, // Store the pattern that matches variations of the site URL
				DOM: hashedResult.content,
				minHash: hashedResult.minHash
			});
			await newMonitoredSite.save();

			// Try to fetch and store the SSL certificate
			try {
				const certificate = await fetchSSLCertificate(canonicalUrl);
				await storeCertificateForSite(newMonitoredSite._id, certificate); // Link the certificate to the site
			} catch (error) {
				console.error(`Failed to fetch SSL certificate for ${siteName}:`, error.message);
				errors.push({ siteName, message: 'Failed to fetch SSL certificate' });
			}

			// Add the site to the whitelist
			whitelist.monitoredSites.push(newMonitoredSite._id);
			addedSites.push(newMonitoredSite);
		}

		// Save the updated whitelist
		await whitelist.save();

		// Send the response
		res.status(201).send({
			success: true,
			message: 'Sites processed',
			addedSites,
			errors
		});
	} catch (error) {
		console.error('Error adding sites to whitelist:', error.message);
		res.status(500).send({ success: false, message: error.message });
	}
});
module.exports = adminUserRouter;
