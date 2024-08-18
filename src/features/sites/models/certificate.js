//------------------------------------------------------//
// src/features/sites/models/certificate.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const certificateSchema = new Schema(
	{
		commonName: { type: String, required: true, unique: true },
		issuer: String,
		validFrom: Date,
		validTo: Date,
		fingerprint: String,
	},
	{ timestamps: true }
);

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
