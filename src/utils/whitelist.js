// src/utils/whitelist.js
const fs = require('fs');
const path = require('path');
const MonitoredSite = require('../models/monitoredSite');
const { compressAndHashHTML } = require('./urlToHashContent');

// Function to read whitelist URLs from JSON file
function readWhitelistFromFile() {
	const filePath = path.join(__dirname, 'whitelist.json');
	const fileData = fs.readFileSync(filePath, 'utf-8');
	const whitelist = JSON.parse(fileData);
	return whitelist.map((site) => site.url);
}

// Setup whitelist
async function setupWhitelist() {
	const whitelist = readWhitelistFromFile();
	try {
		await addSitesToWhitelist(whitelist);

	} catch (error) {
		console.error('Error adding sites to the whitelist:', error);
	}
	console.log('All sites added to the whitelist.');
}

async function addSiteToWhitelist(url) {
	try {
		const result = await compressAndHashHTML(url);
		if (!result) {
			console.error(`Failed to compress and hash content for ${url}`);
			return;
		}

		const { minHash, content } = result;

		await MonitoredSite.findOneAndUpdate(
			{ url: url },
			{
				url: url,
				minHash: minHash,
				content: content,
			},
			{ upsert: true, new: true } // Create a new document if it doesn't exist, return the updated document
		);

		console.log(`Added/Updated ${url} in the whitelist.`); //with MinHash ${minHash}
	} catch (error) {
		console.error(`Error adding/updating ${url} in the whitelist:`, error);
	}
}

async function addSitesToWhitelist(urls) {
	for (const url of urls) {
		await addSiteToWhitelist(url);
	}
}

module.exports = setupWhitelist;
