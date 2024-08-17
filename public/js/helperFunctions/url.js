// url.js
export function normalizeUrl(url) {
	try {
		const parsedUrl = new URL(url.toLowerCase());

		// Normalize by removing query parameters and fragments
		const normalizedUrl = parsedUrl.origin + parsedUrl.pathname;

		// Optionally, you could strip trailing slashes
		return normalizedUrl.replace(/\/+$/, '');
	} catch (error) {
		console.error('Invalid URL:', error);
		return null; // Return null or handle invalid URLs appropriately
	}
}

// Adjust isUrlInWhitelist to handle an array of strings (URLs)

export function isUrlInWhitelist(submittedUrl, whitelist) {
    // Check that the whitelist is an array of strings
    if (!Array.isArray(whitelist)) {
        console.error('Invalid whitelist structure:', whitelist);
        return { success: false, message: 'Invalid whitelist structure' };
    }

    const normalizedSubmittedUrl = normalizeUrl(submittedUrl);

    if (!normalizedSubmittedUrl) {
        return { success: false, message: 'Invalid URL submitted' };
    }

    // Loop through the whitelist and check for a direct match
    for (const url of whitelist) {
        const normalizedWhitelistUrl = normalizeUrl(url);

        if (normalizedWhitelistUrl.includes(normalizedSubmittedUrl)) {
			return { success: true, canonicalUrl: url };
		}
    }

    return { success: false, message: 'URL not found in whitelist' };
}


// //
export const extractBaseUrl = (url) => {
	try {
		const { hostname } = new URL(url);
		return hostname;
	} catch (e) {
		return null;
	}
};
// Format submitted URL with the correct prefix if missing
export const formatSubmittedUrl = (url) => {
	if (!/^https?:\/\//i.test(url)) {
		url = /^www\./i.test(url) ? `https://${url}` : `https://www.${url}`;
	}
	return url;
};
