// contentUtils.js
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');

// Normalize URL by removing fragments
function normalizeUrl(url) {
	try {
		const normalizedUrl = new URL(url);
		normalizedUrl.hash = '';
		return normalizedUrl.toString();
	} catch (e) {
		console.error(`Invalid URL: ${url}`);
		return null;
	}
}

// Fetch HTML content from a URL
async function fetchHTML(url) {
	try {
		const { data } = await axios.get(url);
		return data;
	} catch (error) {
		console.error(`Error fetching HTML from ${url}:`, error);
		return null;
	}
}

// Extract text content from HTML
function extractContent(html) {
	const $ = cheerio.load(html);
	$('style').remove();

	// Extract script content with a reasonable length limit
	$('script').each((i, elem) => {
		const scriptContent = $(elem).html();
		const maxLength = 500; // Set a maximum length for script content
		if (scriptContent.length > maxLength) {
			$(elem).text(scriptContent.substring(0, maxLength) + '...'); // Truncate long scripts
		}
	});

	return $('body').text().replace(/\s+/g, ' ').trim().toLowerCase();
}

// Normalize text content by removing punctuation and extra spaces
function normalizeText(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

// Generate shingles from text
function getShingles(text, shingleSize = 4) {
	const shingles = new Set();
	for (let i = 0; i <= text.length - shingleSize; i++) {
		shingles.add(text.substring(i, i + shingleSize));
	}
	return Array.from(shingles);
}

// Generate MinHash signatures from shingles
function generateMinHash(shingles, numHashes = 200) {
	return Array.from({ length: numHashes }, (_, i) => {
		return shingles.reduce((minHash, shingle) => {
			const hashValue = parseInt(
				crypto
					.createHash('sha256')
					.update(shingle + i)
					.digest('hex')
					.substring(0, 8),
				16
			);
			return Math.min(minHash, hashValue);
		}, Infinity);
	});
}

// Compress and hash HTML content
async function compressAndHashHTML(url) {
	const normalizedUrl = normalizeUrl(url);
	if (!normalizedUrl) return null;

	const html = await fetchHTML(normalizedUrl);
	if (!html) return null;

	const content = extractContent(html);
	if (!content) return null;

	const normalizedContent = normalizeText(content);
	const shingles = getShingles(normalizedContent);
	const minHash = generateMinHash(shingles);

	console.log(`URL: ${url}`); // , MinHash: ${minHash}
	return { minHash, content: normalizedContent, shingles };
}

module.exports = {
	normalizeUrl,
	fetchHTML,
	extractContent,
	normalizeText,
	getShingles,
	generateMinHash,
	compressAndHashHTML,
};
