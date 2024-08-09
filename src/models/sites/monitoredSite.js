// src/models/sites/monitoredSite.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const monitoredSiteSchema = new Schema(
	{
		siteName: { type: String, unique: true, required: true },
		url: { type: String, unique: true, required: true },
		DOM: { type: String },
		minHash: { type: [Number] },
		adminId: { type: Schema.Types.ObjectId, ref: 'admin_users', required: true }, // Reference to the admin who added this site
	},
	{ timestamps: true }
);

const MonitoredSite = mongoose.model('monitored_sites', monitoredSiteSchema);

module.exports = MonitoredSite;
