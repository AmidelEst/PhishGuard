// src/features/sites/utils/certificate
const Certificate = require('../../models/certificate');
const MonitoredSite = require('../../models/monitoredSite');
const https = require('https');
const { AbortController } = require('abort-controller');
const cron = require('node-cron');

async function fetchSSLCertificate(domain) {
	const maxRetries = 3;
	let attempts = 0;

	while (attempts < maxRetries) {
		attempts++;

		try {
			const certificate = await attemptFetchSSLCertificate(domain);

			if (certificate) {
				// If a valid certificate is found, return it immediately.
				return certificate;
			}
		} catch (error) {
			console.error(`Attempt ${attempts} failed for ${domain}: ${error.message}`);
		}

		// Log the warning for debugging purposes.
		console.warn(`Attempt ${attempts} failed: Retrying SSL certificate fetch for ${domain}.`);
	}

	// If all attempts fail, throw an error after the loop.
	throw new Error(`Failed to fetch SSL certificate for ${domain} after ${maxRetries} attempts.`);
}
async function attemptFetchSSLCertificate(domain) {
	return new Promise((resolve, reject) => {
		try {
			const { hostname } = new URL(domain);

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 10000); // Set timeout to 10 seconds

			const options = {
				host: hostname,
				port: 443,
				method: 'GET',
				rejectUnauthorized: false,
				signal: controller.signal
			};

			const req = https.request(options, res => {
				clearTimeout(timeout); // Clear the timeout if the request completes

				const certificate = res.socket.getPeerCertificate();

				if (certificate && certificate.subject && certificate.subject.CN) {
					resolve({
						commonName: certificate.subject.CN,
						issuer: Object.entries(certificate.issuer)
							.map(([key, value]) => `${key}: '${value}'`)
							.join(', '),
						validFrom: new Date(certificate.valid_from),
						validTo: new Date(certificate.valid_to),
						fingerprint: certificate.fingerprint || 'No Fingerprint Available'
					});
				}
			});

			req.on('error', err => {
				clearTimeout(timeout);
				reject(new Error(`Request error: ${err.message}`));
			});

			controller.signal.addEventListener('abort', () => {
				req.destroy();
				reject(new Error(`Request timed out for ${hostname}`));
			});

			req.end();
		} catch (error) {
			reject(new Error(`Invalid domain format: ${domain}`));
		}
	});
}
// store certificate and link it to a monitored site
async function storeCertificateForSite(siteId, certificateData) {
	try {
		console.log(`Storing certificate for site ID ${siteId}:`, certificateData);

		// Validate certificate data before proceeding
		if (!certificateData || !certificateData.commonName || !certificateData.validFrom || !certificateData.validTo) {
			throw new Error('Incomplete or missing certificate data.');
		}

		// Find the monitored site by ID
		const monitoredSite = await MonitoredSite.findById(siteId);
		if (!monitoredSite) {
			throw new Error(`Monitored site with ID ${siteId} not found.`);
		}

		// Perform upsert operation (update if certificate exists, otherwise insert)
		const certificate = await Certificate.findOneAndUpdate(
			{ _id: monitoredSite.certificate }, // Condition to check if the certificate exists for the site
			{
				commonName: certificateData.commonName,
				issuer: certificateData.issuer || 'Unknown Issuer',
				validFrom: certificateData.validFrom,
				validTo: certificateData.validTo,
				fingerprint: certificateData.fingerprint || 'No Fingerprint Available'
			},
			{
				new: true, // Return the updated document
				upsert: true, // Create a new document if it doesn't exist
				setDefaultsOnInsert: true // Apply defaults if creating a new document
			}
		);

		// Update the monitored site with the certificate ID if a new certificate was created
		if (!monitoredSite.certificate || monitoredSite.certificate.toString() !== certificate._id.toString()) {
			monitoredSite.certificate = certificate._id;
			await monitoredSite.save();
		}

		return monitoredSite;
	} catch (err) {
		console.error(`Error storing certificate for site ID ${siteId}:`, err.message);
		throw err;
	}
}
//
async function compareCertificates(monitoredSiteCertificate, newCertificate) {
	// Compare fingerprints (this is a common way to compare certificates)
	return monitoredSiteCertificate.fingerprint === newCertificate.fingerprint;
}
//----------------------------------
async function updateAllCertificates() {
	const sites = await MonitoredSite.find();
	for (const site of sites) {
		try {
			const updatedCertificate = await attemptFetchSSLCertificate(site.canonicalUrl);
			await storeCertificateForSite(site._id, updatedCertificate);
		} catch (error) {
			console.error(`Failed to update certificate for site ${site._id}:`, error);
		}
	}
}

// Weekly full update on Sunday at 2:00 AM
cron.schedule('0 2 * * 0', updateAllCertificates);

module.exports = {
	storeCertificateForSite,
	compareCertificates,
	fetchSSLCertificate
};
