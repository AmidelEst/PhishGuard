// src/controllers/users/regularUser.js
const express = require('express');
const bcrypt = require('bcrypt');
const regularUserRouter = express.Router();
const RegularUser = require('../../models/users/regularUser');
const AdminUser = require('../../models/users/adminUser');
const Whitelist = require('../../models/sites/whitelist');
const { generateToken, verifyToken, getTokenExpiration } = require('../../utils/authUtils');
const redisClient = require('../../utils/redisClient');

// Function to blacklist a token
function blacklistToken(token, expiresIn) {
    // Store the token in Redis with an expiration time
    redisClient.set(token, 'blacklisted', 'EX', expiresIn);
}
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
		const user = await RegularUser.findOne({ email: email.trim().toLowerCase() });
		// .populate({
		// 		path: 'subscribedWhitelist',
		// 		populate: { path: 'monitoredSites', model: 'monitored_sites' },
		// 	});
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
		// Extract the subscribedWhitelistId and return it along with the token
		const subscribedWhitelistId = user.subscribedWhitelist._id;

		// Extract URLs from the populated monitored sites
		// const monitoredSiteUrls = user.subscribedWhitelist.monitoredSites.map(
		// 	(site) => site.url
		// );

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
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(400).json({ success: false, message: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(400).json({ success: false, message: 'No token provided' });
    }

    try {
        const expiresIn = getTokenExpiration(token) - Math.floor(Date.now() / 1000);
        
        // Blacklist the token
        await redisClient.set(token, 'blacklisted', 'EX', expiresIn);

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout' });
    }
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
// Get - regularUser TOKEN - after loginPage or at popup press
regularUserRouter.get(
	'/whitelist/:id/monitored-sites',
	authenticateToken,
	async (req, res) => {
		try {
			const whitelistId = req.params.id;
			console.log(whitelistId);

			// Find the whitelist by its ID and populate the monitoredSites field
			const whitelist = await Whitelist.findById(whitelistId).populate({
				path: 'monitoredSites',
				model: 'monitored_sites', // Ensure the correct model is referenced
			});

			if (!whitelist) {
				return res
					.status(404)
					.json({ success: false, message: 'Whitelist not found' });
			}
			// Extract the URLs of the monitored sites
			const monitoredSiteUrls = whitelist.monitoredSites.map((site) => site.url);

			res.json({
				success: true,
				monitoredSites: monitoredSiteUrls,
			});
		} catch (error) {
			console.error('Error fetching whitelist:', error);
			res.status(500).json({ success: false, message: 'Server error' });
		}
	}
);

module.exports = regularUserRouter;
