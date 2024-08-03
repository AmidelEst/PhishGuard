// src/utils/whitelist.js
const fs = require('fs');
const path = require('path');
const MonitoredSite = require('../models/monitoredSite');
const { compressAndHashHTML } = require('./urlToHash');

// Function to read whitelist URLs from JSON file
function readWhitelistFromFile() {
	const filePath = path.join(__dirname, 'whitelist.json');
	const fileData = fs.readFileSync(filePath, 'utf-8');
	const whitelist = JSON.parse(fileData);
	return whitelist;
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

async function addSiteToWhitelist(site) {

	const { name: siteName, url } = site; // use 'name:' to fit the json key name.
	try {
		// Create minHash and content for the given site
		const result = await compressAndHashHTML(url);
		if (!result) {
			console.error(`Failed to compress and hash content for ${siteName}`);
			return;
		}

		const { minHash, content } = result;
		// Create instance of a monitor site in the database
		await MonitoredSite.findOneAndUpdate(
			{ url: url },
			{
				siteName: siteName,
				url: url,
				minHash: minHash,
				content: content,
			},
			{ upsert: true, new: true } // Create a new document if it doesn't exist, return the updated document
		);

		console.log(`Added/Updated data to ${siteName}`); //with MinHash ${minHash}
	} catch (error) {
		console.error(`Error adding/updating ${siteName} `, error);
	}
}

async function addSitesToWhitelist(urls) {
	for (const url of urls) {
		await addSiteToWhitelist(url);
	}
}

module.exports = setupWhitelist;
