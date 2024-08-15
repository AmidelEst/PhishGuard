// src\features\sites\models\monitoredSite.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const monitoredSiteSchema = new Schema(
	{
		// Reference to the Hosting whitelist
		whitelistId: { type: Schema.Types.ObjectId, ref: 'whitelists', required: true },
		siteName: { type: String, required: true },
		url: { type: String, required: true },
		DOM: { type: String },
		minHash: { type: [Number] },
		// Reference to the SSL certificate
		certificate: { type: Schema.Types.ObjectId, ref: 'Certificate' },
	},
	{ timestamps: true }
);

const MonitoredSite = mongoose.model('monitored_sites', monitoredSiteSchema);
module.exports = MonitoredSite;
