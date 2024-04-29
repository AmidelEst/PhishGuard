// src/models/monitoredSite.js
const mongoose = require('mongoose');

const monitoredSiteSchema = new mongoose.Schema({
	url: {
		type: String,
		required: [true, 'URL is required'],
		unique: true,
	},
	// addedBy: {
	//   ref: 'User',
	//   required: [true, 'Admin user ID is required'],
	// },
	// You can add more fields here if needed
});

const MonitoredSite = mongoose.model('MonitoredSite', monitoredSiteSchema);

module.exports = MonitoredSite;
