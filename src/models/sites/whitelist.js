// src/models/sites/whitelist.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema; // Import Schema from mongoose

const whitelistSchema = new Schema({
	adminId: {
		type: Schema.Types.ObjectId,
		ref: 'AdminUser',
		required: true,
	},
	monitoredSites: [{ type: Schema.Types.ObjectId, ref: 'MonitoredSite' }],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const Whitelist = mongoose.model('Whitelist', whitelistSchema);

module.exports = Whitelist;
