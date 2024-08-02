// whitelist.js
// const mongoose = require('mongoose');
const MonitoredSite = require('../models/monitoredSite');
const { compressAndHashHTML } = require('./urlToHashContent');

// Sample whitelist URLs
const whitelist = [
	'https://is.hit.ac.il/nidp/idff/sso?id=risk2fa&sid=0&option=credential&sid=0&target=https%3A%2F%2Fportal.hit.ac.il%2F',
	'https://www.facebook.com/login.php/',
	'https://www.instagram.com/accounts/login/?hl=en',
	
];

async function setupWhitelist() {
	try {
		await addSitesToWhitelist(whitelist);
		console.log('All sites added to the whitelist.');
	} catch (error) {
		console.error('Error adding sites to the whitelist:', error);
	}
}

async function addSiteToWhitelist(url) {
	try {
		const { minHash, content } = await compressAndHashHTML(url);
		if (!minHash || !content) {
			console.error(`Failed to compress and hash content for ${url}`);
			return;
		}

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