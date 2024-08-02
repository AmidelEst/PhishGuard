// src/models/monitoredSite.js
const mongoose = require('mongoose');

const monitoredSiteSchema = new mongoose.Schema({
	url: { type: String, unique: true, required: true },
	hashedContent: { type: String },
	minHash: { type: [Number] },
	createdAt: { type: Date, default: Date.now },
});

const MonitoredSite = mongoose.model('MonitoredSite', monitoredSiteSchema);

module.exports = MonitoredSite;
