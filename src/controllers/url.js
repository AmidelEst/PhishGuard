// src/controllers/url.js

const express = require('express');
const router = express.Router();

const MonitoredSite = require('../models/monitoredSite');
const mongoose = require('mongoose');

// User registration
router.post('/url/input', async (req, res) => {
	try {
		const { url } = req.body;
		res.status(201).send({ message: url });
	} catch (err) {
		handleErrors(err, res);
	}
});

// Export the router
module.exports = router;
