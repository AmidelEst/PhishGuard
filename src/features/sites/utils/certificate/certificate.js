// src\features\sites\utils\certificate\certificate.js
const Certificate = require('../../models/certificate');
const MonitoredSite = require('../../models/monitoredSite');
const https = require('https');
const { AbortController } = require('abort-controller');
//
async function fetchSSLCertificate(domain) {
	return new Promise((resolve, reject) => {
		try {
			// Extract the hostname from the URL
			const { hostname } = new URL(domain);
			// Create an AbortController to handle timeouts
			const controller = new AbortController();
			const timeout = setTimeout(() => {
				controller.abort(); // Abort the request after 5 seconds
			}, 5000);

			const options = {
				host: hostname,
				port: 443,
				method: 'GET',
				rejectUnauthorized: false, // Allow self-signed or invalid certificates
				signal: controller.signal // Attach the signal from the AbortController
			};

			const req = https.request(options, res => {
				clearTimeout(timeout); // Clear the timeout when the request completes successfully

				// Retrieve the SSL certificate from the connection
				const certificate = res.socket.getPeerCertificate();

				if (certificate && certificate.subject && certificate.subject.CN) {
					// Check if the certificate is expired
					const now = new Date();
					const validFrom = new Date(certificate.valid_from);
					const validTo = new Date(certificate.valid_to);

					if (now > validTo) {
						return reject(new Error(`The certificate for ${hostname} is expired.`));
					}

					// Prepare the certificate object for comparison
					const formattedCertificate = {
						commonName: certificate.subject.CN,
						issuer: Object.entries(certificate.issuer)
							.map(([key, value]) => `${key}: '${value}'`)
							.join(', '),
						validFrom,
						validTo,
						fingerprint: certificate.fingerprint || 'No Fingerprint Available'
					};

					// Resolve the formatted certificate object
					resolve(formattedCertificate);
				} else {
					// Reject if the certificate is missing or invalid
					reject(new Error(`Could not retrieve a valid SSL certificate for ${hostname}.`));
				}
			});

			// Handle request errors (network issues, DNS resolution failures, etc.)
			req.on('error', err => {
				clearTimeout(timeout); // Clear the timeout on error
				reject(new Error(`Request error for ${hostname}: ${err.message}`));
			});

			// Handle the abort event
			controller.signal.addEventListener('abort', () => {
				req.destroy(); // Destroy the request in case of abort
				reject(new Error(`Request timed out while retrieving SSL certificate for ${hostname}.`));
			});

			req.end();
		} catch (error) {
			// Handle invalid domain URLs or other unexpected issues
			const invalidDomainMessage = `Invalid domain or URL format: ${domain}`;
			console.error(invalidDomainMessage, error.message);
			reject(new Error(invalidDomainMessage));
		}
	});
}

// store certificate and link it to a monitored site
async function storeCertificateForSite(siteId, certificateData) {
	try {
		// Log certificate data for debugging
		console.log(`Certificate data for site ID ${siteId}:`, certificateData);

		// Ensure critical fields are present
		if (!certificateData || !certificateData.subject || !certificateData.subject.CN) {
			throw new Error('Incomplete or missing certificate data.');
		}

		// Convert the issuer object to a string format, with a fallback for empty or invalid data
		const formattedIssuer = certificateData.issuer
			? Object.entries(certificateData.issuer)
					.map(([key, value]) => `${key}: '${value}'`)
					.join(', ')
			: 'Unknown Issuer';

		// Handle missing fields gracefully
		const commonName = certificateData.subject.CN || 'Unknown Common Name';
		const validFrom = certificateData.valid_from ? new Date(certificateData.valid_from) : null;
		const validTo = certificateData.valid_to ? new Date(certificateData.valid_to) : null;
		const fingerprint = certificateData.fingerprint || 'No Fingerprint Available';

		// If critical data is missing, log a warning
		if (!validFrom || !validTo) {
			console.warn(`Certificate for site ID ${siteId} has missing date information.`);
		}

		// Store the certificate in the database
		const certificate = new Certificate({
			commonName,
			issuer: formattedIssuer,
			validFrom,
			validTo,
			fingerprint
		});
		await certificate.save();

		// Link the certificate to the monitored site
		const monitoredSite = await MonitoredSite.findById(siteId);
		if (!monitoredSite) {
			throw new Error(`Monitored site with ID ${siteId} not found.`);
		}
		monitoredSite.certificate = certificate._id;
		await monitoredSite.save();

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
module.exports = {
	storeCertificateForSite,
	compareCertificates,
	fetchSSLCertificate
};
