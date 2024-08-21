// src/features/sites/utils/certificate
const Certificate = require('../../models/certificate');
const MonitoredSite = require('../../models/monitoredSite');
const https = require('https');
const { AbortController } = require('abort-controller');
//
async function fetchSSLCertificate(domain) {
	const maxRetries = 3;
	let attempts = 0;

	while (attempts < maxRetries) {
		attempts++;

		try {
			const certificate = await attemptFetchSSLCertificate(domain);

			if (certificate) {
				return certificate;
			} else {
				console.warn(`Attempt ${attempts} failed: No certificate found for ${domain}.`);
			}
		} catch (error) {
			console.error(`Attempt ${attempts} failed for ${domain}: ${error.message}`);
		}
	}

	throw new Error(`Failed to fetch SSL certificate for ${domain} after ${maxRetries} attempts.`);
}

async function attemptFetchSSLCertificate(domain) {
	return new Promise((resolve, reject) => {
		try {
			const { hostname } = new URL(domain);

			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 5000);

			const options = {
				host: hostname,
				port: 443,
				method: 'GET',
				rejectUnauthorized: false,
				signal: controller.signal
			};

			const req = https.request(options, res => {
				clearTimeout(timeout);

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
				} else {
					reject(new Error(`No valid certificate found for ${hostname}`));
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

		const certificate = new Certificate({
			commonName: certificateData.commonName,
			issuer: certificateData.issuer || 'Unknown Issuer',
			validFrom: certificateData.validFrom,
			validTo: certificateData.validTo,
			fingerprint: certificateData.fingerprint || 'No Fingerprint Available'
		});
		await certificate.save();

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
