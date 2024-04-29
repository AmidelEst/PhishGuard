const express = require('express');
const urlRouter = express.Router();

const MonitoredSite = require('../models/monitoredSite');
const mongoose = require('mongoose');

// Incoming URL addresses from the User
urlRouter.post('/check_url', async (req, res) => {
	try {
		const { url } = req.body;
		if (!url) throw new Error('URL parameter is required.');
		console.log('The URL that was sent: ' + url);

		if (!url) {
			return res.status(400).json({
				success: false,
				message: 'URL parameter is required.',
			});
		}

		if (url.length > 4000) {
			return res
				.status(400)
				.json({ success: false, message: 'The URL is too long.' });
		}

		// Correct the syntax error in URL validation
		if (!url.startsWith('http://') && !url.startsWith('https://')) {
			return res
				.status(400)
				.json({ success: false, message: 'The URL is not valid.' });
		}

		// If URL passes all checks, continue processing it (this part is hypothetical)
		// Example: Save URL or pass it to some service, assuming validation passes
		const monitoredSite = new MonitoredSite({ url });
		await monitoredSite.save();

		res.json({ success: true, message: 'URL processed successfully.' });
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: 'An error occurred.',
			error: err.message,
		});
	}
});

module.exports = urlRouter;
