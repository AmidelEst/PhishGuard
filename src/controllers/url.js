// src/controllers/url.js

const express = require('express');
const router = express.Router();

const MonitoredSite = require('../models/monitoredSite');
const mongoose = require('mongoose');

const { spawn } = require('child_process');

// Incoming URL addresses from the User
router.post('/check_url', async (req, res) => {
	try {
		const { url } = req.body;
		console.log('The url that was sent: ' + url);
		if (!url) {
			return res
				.status(400)
				.send({ error: 'URL parameter is required.' });
		}

		const pythonProcess = spawn('python', ['scripts/logic.py', url]);

		let pythonData = '';
		pythonProcess.stdout.on('data', (data) => {
			pythonData += data.toString();
		});

		pythonProcess.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
		});

		pythonProcess.on('close', (code) => {
			console.log(`Python script exited with code ${code}`);
			if (code === 0) {
				res.send(pythonData);
			} else {
				res.status(500).send(
					'Error occurred while running the Python script.'
				);
			}
		});
	} catch (err) {
		console.error(err);
		res.status(500).send({ message: 'An error occurred.' });
	}
});

//python

// Export the router
module.exports = router;
