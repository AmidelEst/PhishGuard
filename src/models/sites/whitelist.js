// src/models/sites/whitelist.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const whitelistSchema = new Schema({
	adminId: { type: Schema.Types.ObjectId, ref: 'admin_users', required: true },
	whitelistName: { type: String, required: true, unique: true },
	monitoredSites: [{ type: Schema.Types.ObjectId, unique: true, ref: 'monitored_sites' }],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const Whitelist = mongoose.model('Whitelists', whitelistSchema);
module.exports = Whitelist;
