// src\features\sites\utils\certificate\certificate.js
const Certificate = require('../../models/certificate');
const MonitoredSite = require('../../models/monitoredSite');
const https = require('https');
const tls = require('tls');

async function fetchSSLCertificate(domain) {
	return new Promise((resolve, reject) => {
		// we only pass the domain, not the full URL with path
		const { hostname } = new URL(domain);

		const options = {
			host: hostname,
			port: 443,
			method: 'GET',
			rejectUnauthorized: false,
		};

		const req = https.request(options, (res) => {
			const certificate = res.socket.getPeerCertificate();
			if (certificate) {
				resolve(certificate);
			} else {
				reject(new Error('Could not retrieve certificate.'));
			}
		});

		req.on('error', (err) => {
			reject(err);
		});

		req.end();
	});
}

// Function to store the certificate and link it to a monitored site
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
		const validFrom = certificateData.valid_from
			? new Date(certificateData.valid_from)
			: null;
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
			fingerprint,
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


async function compareCertificates(domain, newCertificate) {
	const storedCertificate = await CertificateModel.findOne({ domain });

	if (!storedCertificate) {
		return false; // No stored certificate to compare
	}

	// Compare fingerprints (this is a common way to compare certificates)
	return storedCertificate.fingerprint === newCertificate.fingerprint;
}
module.exports = {
	storeCertificateForSite,
	fetchSSLCertificate,
};
